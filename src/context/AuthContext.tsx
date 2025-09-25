import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Profile {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
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
  role: 'admin' | 'moderator' | 'artist' | 'user';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRoles: UserRole[];
  loading: boolean;
  hasRole: (role: 'admin' | 'moderator' | 'artist' | 'user') => boolean;
  getPrimaryRole: () => 'admin' | 'moderator' | 'artist' | 'user' | null;
  isAdmin: boolean;
  isArtist: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signUpArtist: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  assignRole: (userId: string, role: 'admin' | 'moderator' | 'artist' | 'user') => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const ensureUserSetup = async (userId: string, userType: string = 'user') => {
    try {
      console.log('AuthContext: Starting ensureUserSetup for user:', userId, 'type:', userType);
      
      // Call RPC to ensure profile and role exist
      const { data: setupResult, error: rpcError } = await supabase.rpc(
        'ensure_profile_and_role',
        { user_type: userType }
      );

      if (rpcError) {
        console.error('AuthContext: RPC error:', rpcError);
        throw rpcError;
      }

      console.log('AuthContext: User setup result:', setupResult);

      // Fetch updated profile and roles in parallel
      const [profileResult, rolesResult] = await Promise.all([
        fetchProfile(userId),
        fetchUserRoles(userId)
      ]);
      
      console.log('AuthContext: Setup complete for user:', userId);
      return { profileResult, rolesResult };
    } catch (error) {
      console.error('AuthContext: Error ensuring user setup:', error);
      throw error;
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }

      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthContext: Auth state change:', event, session?.user?.id);
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Get user type from metadata or default to 'user'
          const userType = session.user.user_metadata?.user_type || 'user';
          
          // Fetch user data without setTimeout to prevent race conditions
          ensureUserSetup(session.user.id, userType)
            .catch((error) => {
              console.error('AuthContext: Failed to ensure user setup:', error);
            })
            .finally(() => {
              if (isMounted) {
                setLoading(false);
              }
            });
        } else {
          setProfile(null);
          setUserRoles([]);
          setLoading(false);
        }
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      
      console.log('AuthContext: Initial session check:', session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userType = session.user.user_metadata?.user_type || 'user';
        ensureUserSetup(session.user.id, userType)
          .catch((error) => {
            console.error('AuthContext: Failed to ensure user setup on mount:', error);
          })
          .finally(() => {
            if (isMounted) {
              setLoading(false);
            }
          });
      } else {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      const redirectUrl = `${window.location.origin}/email-confirmation`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { ...metadata, user_type: 'user' }
        }
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
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

  const signUpArtist = async (email: string, password: string, metadata = {}) => {
    try {
      const redirectUrl = `${window.location.origin}/email-confirmation`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { ...metadata, user_type: 'artist' }
        }
      });

      if (error) {
        toast({
          title: "Artist Sign Up Error",
          description: error.message,
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

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
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

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Update Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Refresh profile data
        await fetchProfile(user.id);
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

  const assignRole = async (userId: string, role: 'admin' | 'moderator' | 'artist' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: role 
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
          description: `${role} role has been assigned successfully.`,
        });
        // Refresh roles if it's the current user
        if (userId === user?.id) {
          await fetchUserRoles(userId);
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
  const hasRole = (role: 'admin' | 'moderator' | 'artist' | 'user') => {
    // Don't return false immediately if loading - wait for the actual role data
    if (!user) {
      console.log('AuthContext: hasRole - no user');
      return false;
    }
    
    // If still loading but we have some roles, check them
    if (loading && userRoles.length === 0) {
      console.log('AuthContext: hasRole - still loading and no roles yet');
      return false;
    }
    
    const result = userRoles.some(userRole => userRole.role === role);
    console.log(`AuthContext: hasRole(${role}) = ${result}, userRoles:`, userRoles);
    
    // Admin users should have access to everything
    if (role !== 'admin' && userRoles.some(userRole => userRole.role === 'admin')) {
      console.log(`AuthContext: User is admin, granting ${role} access`);
      return true;
    }
    
    return result;
  };

  // Get the primary role for the user (highest priority role)
  const getPrimaryRole = (): 'admin' | 'moderator' | 'artist' | 'user' | null => {
    if (!userRoles || userRoles.length === 0) return null;
    
    // Role priority order (admin > moderator > artist > user)
    const priorities = { admin: 1, moderator: 2, artist: 3, user: 4 };
    
    return userRoles
      .sort((a, b) => priorities[a.role] - priorities[b.role])[0]?.role || null;
  };

  const isAdmin = hasRole('admin');
  const isArtist = hasRole('artist');

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
    signUp,
    signUpArtist,
    signIn,
    signOut,
    updateProfile,
    assignRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};