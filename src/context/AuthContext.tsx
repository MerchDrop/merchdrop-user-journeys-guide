import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { 
  signUpSchema, 
  signInSchema, 
  roleAssignmentSchema, 
  profileUpdateSchema,
  SignUpInput, 
  SignInInput, 
  RoleAssignmentInput, 
  ProfileUpdateInput 
} from '@/lib/auth-schemas';
import { useAuthValidation } from '@/hooks/useAuthValidation';
import { getAuthErrorMessage } from '@/lib/authErrorMessages';

// Types
interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  social_links: any;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'artist' | 'user' | 'designer';
  status: 'active' | 'pending' | 'rejected';
  created_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  requested_role?: string | null;
  rejection_reason?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRoles: UserRole[];
  loading: boolean;
  hasRole: (role: 'admin' | 'moderator' | 'artist' | 'user' | 'designer') => boolean;
  getPrimaryRole: () => 'admin' | 'moderator' | 'artist' | 'user' | 'designer' | null;
  isAdmin: boolean;
  isArtist: boolean;
  isDesigner: boolean;
  isSuperAdmin: boolean;
  signUp: (input: SignUpInput) => Promise<{ error: any }>;
  signUpArtist: (input: SignUpInput) => Promise<{ error: any }>;
  signUpDesigner: (input: SignUpInput) => Promise<{ error: any }>;
  signIn: (input: SignInInput) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: ProfileUpdateInput) => Promise<{ error: any }>;
  assignRole: (input: RoleAssignmentInput) => Promise<{ error: any }>;
  verifyOtp: (email: string, token: string, type?: 'signup' | 'recovery') => Promise<{ error: any; data?: any }>;
  resendOtp: (email: string, type?: 'signup' | 'recovery') => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Validation hook
  const { validate } = useAuthValidation();

  // Core data fetching functions
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, first_name, last_name, phone, avatar_url, bio, website_url, social_links, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('AuthContext: Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('AuthContext: Error fetching profile:', error);
      return null;
    }
  };

  const fetchUserRoles = async (userId: string): Promise<UserRole[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  };

  const fetchSuperAdminStatus = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_super_admin');
      if (error) return false;
      return data || false;
    } catch {
      return false;
    }
  };

  // User setup function using secure RPC
  const setupUserProfile = async (userId: string, userType: 'user' | 'artist' | 'designer' = 'user') => {
    try {
      const { error: rpcError } = await supabase.rpc(
        'setup_user_profile',
        {
          _display_name: null,
          _user_type: userType
        }
      );

      if (rpcError) {
        if (rpcError.code === 'P0001' || rpcError.message?.includes('not authenticated')) {
          return await manualUserSetup(userId);
        }
        return false;
      }

      return true;
    } catch {
      return await manualUserSetup(userId);
    }
  };

  // Fallback manual setup — always inserts 'user' role; artist/designer go through approval flow
  const manualUserSetup = async (userId: string) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return false;

      await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: currentUser.email,
          display_name: currentUser.email
        });

      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (!existingRoles || existingRoles.length === 0) {
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'user' });
      }

      return true;
    } catch {
      return false;
    }
  };

  // Load user data
  const loadUserData = async (userId: string) => {
    try {
      const [profileData, rolesData, superAdminStatus] = await Promise.all([
        fetchProfile(userId),
        fetchUserRoles(userId),
        fetchSuperAdminStatus()
      ]);

      setProfile(profileData);
      setUserRoles(rolesData);
      setIsSuperAdmin(superAdminStatus);
    } catch {
      // non-fatal — state remains at previous values
    }
  };

  // Auth state listener — onAuthStateChange always fires INITIAL_SESSION on mount,
  // so getSession() is not needed and would create a duplicate setup race.
  useEffect(() => {
    let isMounted = true;
    let isSetupInProgress = false;
    let isSetupComplete = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setUserRoles([]);
          setIsSuperAdmin(false);
          setLoading(false);
          isSetupInProgress = false;
          isSetupComplete = false;
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user && !isSetupInProgress && !isSetupComplete) {
            isSetupInProgress = true;

            // Defer to avoid Supabase auth state deadlock
            setTimeout(async () => {
              if (!isMounted || !session?.user) {
                isSetupInProgress = false;
                return;
              }

              try {
                if (!isSetupComplete) {
                  const userType = session.user.user_metadata?.user_type || 'user';
                  await setupUserProfile(session.user.id, userType);
                }

                await loadUserData(session.user.id);
                isSetupComplete = true;
              } finally {
                if (isMounted) {
                  setLoading(false);
                  isSetupInProgress = false;
                }
              }
            }, 100);
          } else if (!session?.user) {
            setProfile(null);
            setUserRoles([]);
            setLoading(false);
            isSetupInProgress = false;
            isSetupComplete = false;
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Authentication functions with validation
  const signUp = async (input: SignUpInput) => {
    const validation = validate(signUpSchema, input);
    if (!validation.isValid) {
      return { error: { message: 'Invalid input data', details: validation.errors } };
    }

    try {
      const redirectUrl = `${window.location.origin}/email-confirmation`;
      
      const { error } = await supabase.auth.signUp({
        email: (validation.data as SignUpInput).email,
        password: (validation.data as SignUpInput).password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { 
            display_name: (validation.data as SignUpInput).displayName,
            user_type: 'user' 
          }
        }
      });

      if (error) {
        Sentry.captureException(error, { tags: { location: 'AuthContext.signUp' } });
        const errorInfo = getAuthErrorMessage(error, 'signup');
        toast({
          title: errorInfo.title,
          description: errorInfo.message,
          variant: "destructive",
        });
      } else {
        // Call custom email function with branded template
        const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
          body: {
            email: (validation.data as SignUpInput).email,
            userType: 'user',
            displayName: (validation.data as SignUpInput).displayName,
            confirmationUrl: redirectUrl
          }
        });
        
        if (emailError) {
          console.error('Error sending custom email:', emailError);
        }

        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign Up Error", 
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUpArtist = async (input: SignUpInput) => {
    const validation = validate(signUpSchema, input);
    if (!validation.isValid) {
      return { error: { message: 'Invalid input data', details: validation.errors } };
    }

    try {
      const redirectUrl = `${window.location.origin}/email-confirmation?role=artist`;
      
      const { error } = await supabase.auth.signUp({
        email: (validation.data as SignUpInput).email,
        password: (validation.data as SignUpInput).password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { 
            display_name: (validation.data as SignUpInput).displayName,
            user_type: 'artist' 
          }
        }
      });

      if (error) {
        Sentry.captureException(error, { tags: { location: 'AuthContext.signUpArtist' } });
        const errorInfo = getAuthErrorMessage(error, 'signup');
        toast({
          title: errorInfo.title,
          description: errorInfo.message,
          variant: "destructive",
        });
      } else {
        // Call custom email function with branded artist template
        const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
          body: {
            email: (validation.data as SignUpInput).email,
            userType: 'artist',
            displayName: (validation.data as SignUpInput).displayName,
            confirmationUrl: redirectUrl
          }
        });
        
        if (emailError) {
          console.error('Error sending custom email:', emailError);
        }

        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your artist registration.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Artist Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUpDesigner = async (input: SignUpInput) => {
    const validation = validate(signUpSchema, input);
    if (!validation.isValid) {
      return { error: { message: 'Invalid input data', details: validation.errors } };
    }

    try {
      const redirectUrl = `${window.location.origin}/email-confirmation?role=designer`;
      
      const { error } = await supabase.auth.signUp({
        email: (validation.data as SignUpInput).email,
        password: (validation.data as SignUpInput).password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { 
            display_name: (validation.data as SignUpInput).displayName,
            user_type: 'designer' 
          }
        }
      });

      if (error) {
        Sentry.captureException(error, { tags: { location: 'AuthContext.signUpDesigner' } });
        const errorInfo = getAuthErrorMessage(error, 'signup');
        toast({
          title: errorInfo.title,
          description: errorInfo.message,
          variant: "destructive",
        });
      } else {
        // Call custom email function with branded designer template
        const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
          body: {
            email: (validation.data as SignUpInput).email,
            userType: 'designer',
            displayName: (validation.data as SignUpInput).displayName,
            confirmationUrl: redirectUrl
          }
        });
        
        if (emailError) {
          console.error('Error sending custom email:', emailError);
        }

        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your designer registration.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Designer Sign Up Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (input: SignInInput) => {
    const validation = validate(signInSchema, input);
    if (!validation.isValid) {
      return { error: { message: 'Invalid input data', details: validation.errors } };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: (validation.data as SignInInput).email,
        password: (validation.data as SignInInput).password,
      });

      if (error) {
        Sentry.captureException(error, { tags: { location: 'AuthContext.signIn' } });
        const errorInfo = getAuthErrorMessage(error, 'signin');
        toast({
          title: errorInfo.title,
          description: errorInfo.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updateProfile = async (updates: ProfileUpdateInput) => {
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }

    const validation = validate(profileUpdateSchema, updates);
    if (!validation.isValid) {
      return { error: { message: 'Invalid input data', details: validation.errors } };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(validation.data as ProfileUpdateInput)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Update Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        await loadUserData(user.id);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const assignRole = async (input: RoleAssignmentInput) => {
    const validation = validate(roleAssignmentSchema, input);
    if (!validation.isValid) {
      return { error: { message: 'Invalid input data', details: validation.errors } };
    }

    const { userId, role } = validation.data as RoleAssignmentInput;

    if (!user) {
      return { error: { message: 'Not authenticated' } };
    }

    try {
      // Privileged roles must go through the approve_role_request RPC which enforces
      // admin-only access via SECURITY DEFINER. Direct upsert is blocked by RLS for
      // everything except the initial 'user' role.
      const { error } = await supabase.rpc('approve_role_request', {
        _user_id: userId,
        _role: role,
        _admin_id: user?.id,
      });

      if (error) {
        toast({
          title: "Role Assignment Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Role Assigned",
          description: `${role} role has been assigned successfully.`,
        });

        if (userId === user?.id) {
          await loadUserData(user.id);
        }
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Role Assignment Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const verifyOtp = async (email: string, token: string, type: 'signup' | 'recovery' = 'signup') => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });

      if (error) {
        const errorInfo = getAuthErrorMessage(error, 'signin');
        toast({
          title: errorInfo.title,
          description: errorInfo.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message,
        variant: "destructive",
      });
      return { error, data: null };
    }
  };

  const resendOtp = async (email: string, type: 'signup' | 'recovery' = 'signup') => {
    try {
      const { error } = await supabase.auth.resend({
        type,
        email,
      });

      if (error) {
        toast({
          title: "Resend Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Resend Error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Helper functions for role checking - only check ACTIVE roles
  const hasRole = (role: 'admin' | 'moderator' | 'artist' | 'user' | 'designer') => {
    if (loading || !user || !userRoles || userRoles.length === 0) return false;
    return userRoles.some(userRole => userRole.role === role && userRole.status === 'active');
  };

  const getPrimaryRole = (): 'admin' | 'moderator' | 'artist' | 'user' | 'designer' | null => {
    const activeRoles = userRoles.filter(r => r.status === 'active');
    if (activeRoles.length === 0) return null;
    
    const priorities: Record<string, number> = { 
      admin: 1, moderator: 2, designer: 3, artist: 4, user: 5 
    };
    
    return [...activeRoles]
      .sort((a, b) => (priorities[a.role] || 999) - (priorities[b.role] || 999))[0]?.role || null;
  };

  const isAdmin = React.useMemo(() => hasRole('admin'), [user, userRoles, loading]);
  const isArtist = React.useMemo(() => hasRole('artist'), [user, userRoles, loading]);
  const isDesigner = React.useMemo(() => hasRole('designer'), [user, userRoles, loading]);


  const value: AuthContextType = {
    user,
    session,
    profile,
    userRoles,
    loading,
    hasRole,
    getPrimaryRole,
    isAdmin,
    isArtist,
    isDesigner,
    isSuperAdmin,
    signUp,
    signUpArtist,
    signUpDesigner,
    signIn,
    signOut,
    updateProfile,
    assignRole,
    verifyOtp,
    resendOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};