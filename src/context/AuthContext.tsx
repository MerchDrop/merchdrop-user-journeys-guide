import React, { createContext, useContext, useEffect, useState } from 'react';
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
  created_at: string;
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
  signUp: (input: SignUpInput) => Promise<{ error: any }>;
  signUpArtist: (input: SignUpInput) => Promise<{ error: any }>;
  signUpDesigner: (input: SignUpInput) => Promise<{ error: any }>;
  signIn: (input: SignInInput) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: ProfileUpdateInput) => Promise<{ error: any }>;
  assignRole: (input: RoleAssignmentInput) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Validation hook
  const { validate } = useAuthValidation();

  // Core data fetching functions
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
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

      if (error) {
        console.error('AuthContext: Error fetching user roles:', error);
        return [];
      }

      console.log('AuthContext: Fetched user roles:', data);
      return data || [];
    } catch (error) {
      console.error('AuthContext: Error fetching user roles:', error);  
      return [];
    }
  };

  // User setup function using new secure RPC
  const setupUserProfile = async (userId: string, userType: 'user' | 'artist' | 'designer' = 'user') => {
    try {
      console.log('AuthContext: Setting up user profile for:', userId, 'type:', userType);
      
      // Use the new secure RPC function
      const { data: setupResult, error: rpcError } = await supabase.rpc(
        'setup_user_profile',
        { 
          _display_name: null,
          _user_type: userType 
        }
      );

      if (rpcError) {
        console.error('AuthContext: Profile setup RPC error:', rpcError);
        // Only fall back to manual setup for auth errors, not other errors
        if (rpcError.code === 'P0001' || rpcError.message?.includes('not authenticated')) {
          console.log('AuthContext: Falling back to manual setup due to auth error');
          return await manualUserSetup(userId, userType);
        }
        return false;
      }

      console.log('AuthContext: Profile setup result:', setupResult);
      return true;
    } catch (error) {
      console.error('AuthContext: Error in setupUserProfile:', error);
      return await manualUserSetup(userId, userType);
    }
  };

  // Fallback manual setup
  const manualUserSetup = async (userId: string, userType: 'user' | 'artist' | 'designer') => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return false;

      // Create profile
      await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: currentUser.email,
          display_name: currentUser.email
        });

      // Check if user has roles before creating
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (!existingRoles || existingRoles.length === 0) {
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: userType });
      }

      return true;
    } catch (error) {
      console.error('AuthContext: Manual setup error:', error);
      return false;
    }
  };

  // Load user data
  const loadUserData = async (userId: string) => {
    try {
      const [profileData, rolesData] = await Promise.all([
        fetchProfile(userId),
        fetchUserRoles(userId)
      ]);

      setProfile(profileData);
      setUserRoles(rolesData);
      
      console.log('AuthContext: User data loaded - Profile:', !!profileData, 'Roles:', rolesData.length, 'Role data:', rolesData);
    } catch (error) {
      console.error('AuthContext: Error loading user data:', error);
    }
  };

  // Auth state listener
  useEffect(() => {
    let isMounted = true;
    let isSetupInProgress = false;
    let isSetupComplete = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthContext: Auth state change:', event, session?.user?.id);
        
        if (!isMounted) return;

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setUserRoles([]);
          setLoading(false);
          isSetupInProgress = false;
          isSetupComplete = false;
          return;
        }

        // Handle token refresh - only update session/user, no setup needed
        if (event === 'TOKEN_REFRESHED') {
          setSession(session);
          setUser(session?.user ?? null);
          return;
        }

        // Handle sign in and initial session - full setup required
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user && !isSetupInProgress && !isSetupComplete) {
            isSetupInProgress = true;
            
            // Defer data loading to avoid auth state deadlocks and ensure auth context is ready
            setTimeout(async () => {
              if (!isMounted || !session?.user) {
                isSetupInProgress = false;
                return;
              }
              
              try {
                // Only run setup if we don't already have profile/roles
                if (!profile || userRoles.length === 0) {
                  const userType = session.user.user_metadata?.user_type || 'user';
                  await setupUserProfile(session.user.id, userType);
                }
                
                await loadUserData(session.user.id);
                isSetupComplete = true;
              } catch (error) {
                console.error('AuthContext: Error in deferred setup:', error);
              } finally {
                if (isMounted) {
                  setLoading(false);
                  isSetupInProgress = false;
                }
              }
            }, 100); // Reduced delay since we're being more selective
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

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      
      if (session?.user && !isSetupInProgress && !isSetupComplete) {
        setSession(session);
        setUser(session.user);
        isSetupInProgress = true;
        
        setTimeout(async () => {
          if (!isMounted || !session?.user) {
            isSetupInProgress = false;
            return;
          }
          
          try {
            // Only run setup if we don't already have profile/roles
            if (!profile || userRoles.length === 0) {
              const userType = session.user.user_metadata?.user_type || 'user';
              await setupUserProfile(session.user.id, userType);
            }
            
            await loadUserData(session.user.id);
            isSetupComplete = true;
          } catch (error) {
            console.error('AuthContext: Error in initial setup:', error);
          } finally {
            if (isMounted) {
              setLoading(false);
              isSetupInProgress = false;
            }
          }
        }, 100);
      } else {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      isSetupInProgress = false;
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
        const errorInfo = getAuthErrorMessage(error, 'signup');
        toast({
          title: errorInfo.title,
          description: errorInfo.message,
          variant: "destructive",
        });
      } else {
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
      const redirectUrl = `${window.location.origin}/email-confirmation`;
      
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
        const errorInfo = getAuthErrorMessage(error, 'signup');
        toast({
          title: errorInfo.title,
          description: errorInfo.message,
          variant: "destructive",
        });
      } else {
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
      const redirectUrl = `${window.location.origin}/email-confirmation`;
      
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
        const errorInfo = getAuthErrorMessage(error, 'signup');
        toast({
          title: errorInfo.title,
          description: errorInfo.message,
          variant: "destructive",
        });
      } else {
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

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: (validation.data as RoleAssignmentInput).userId, 
          role: (validation.data as RoleAssignmentInput).role 
        }, { 
          onConflict: 'user_id,role' 
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
          description: `${(validation.data as RoleAssignmentInput).role} role has been assigned successfully.`,
        });
        
        // Refresh roles if it's the current user
        if ((validation.data as RoleAssignmentInput).userId === user?.id) {
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

  // Helper functions for role checking
  const hasRole = (role: 'admin' | 'moderator' | 'artist' | 'user' | 'designer') => {
    // Return false during loading or when no user
    if (loading || !user || !userRoles || userRoles.length === 0) return false;

    // Admin users should have access to everything (except other admin checks)
    if (role !== 'admin' && userRoles.some(userRole => userRole.role === 'admin')) {
      return true;
    }

    return userRoles.some(userRole => userRole.role === role);
  };

  const getPrimaryRole = (): 'admin' | 'moderator' | 'artist' | 'user' | 'designer' | null => {
    if (!userRoles || userRoles.length === 0) return null;
    
    // Role priority order (admin > moderator > artist > designer > user)
    const priorities: Record<string, number> = { 
      admin: 1, 
      moderator: 2, 
      artist: 3, 
      designer: 4, 
      user: 5 
    };
    
    // Clone array before sorting to avoid mutating state
    return [...userRoles]
      .sort((a, b) => (priorities[a.role] || 999) - (priorities[b.role] || 999))[0]?.role || null;
  };

  const isAdmin = hasRole('admin');
  const isArtist = hasRole('artist');
  const isDesigner = hasRole('designer');

  // Debug logging for role checking
  React.useEffect(() => {
    if (user) {
      console.log('AuthContext: Role check - userRoles:', userRoles, 'isAdmin:', isAdmin, 'isArtist:', isArtist);
    }
  }, [userRoles, isAdmin, isArtist, user]);

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
    signUp,
    signUpArtist,
    signUpDesigner,
    signIn,
    signOut,
    updateProfile,
    assignRole,
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