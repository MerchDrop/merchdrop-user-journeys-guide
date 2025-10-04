import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { handleQueryError, handleQuerySuccess } from '@/lib/queryUtils';

interface ArtistProfile {
  id: string;
  artist_name: string;
  artist_slug: string;
  status: string;
  brand_colors?: any;
  commission_rate?: number;
  approval_date?: string;
  total_sales?: number;
  total_earnings?: number;
  created_at: string;
  updated_at: string;
}

interface DesignerProfile {
  id: string;
  designer_name: string;
  bio?: string;
  status: string;
  total_designs: number;
  approved_designs: number;
  pending_designs: number;
  declined_designs: number;
  total_earnings?: number;
  created_at: string;
  updated_at: string;
}

interface UserDetailsData {
  profile: any;
  artistProfile?: ArtistProfile;
  designerProfile?: DesignerProfile;
}

// Fetch complete user details including artist/designer profiles
async function fetchUserDetails(userId: string): Promise<UserDetailsData> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

  // Fetch artist profile if exists
  const { data: artistProfile } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Fetch designer profile if exists
  const { data: designerProfile } = await supabase
    .from('designer_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return {
    profile,
    artistProfile: artistProfile || undefined,
    designerProfile: designerProfile || undefined
  };
}

// Reset user password via Supabase Auth Admin API
async function resetUserPassword(userId: string, email: string) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: email,
  });

  if (error) throw error;
  return data;
}

// Delete user account
async function deleteUserAccount(userId: string) {
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw error;
}

// Verify user email
async function verifyUserEmail(userId: string) {
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    email_confirm: true
  });
  if (error) throw error;
}

// Update user profile
async function updateUserProfile(userId: string, updates: any) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) throw error;
}

export function useUserDetails(userId: string | null) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['userDetails', userId],
    queryFn: () => fetchUserDetails(userId!),
    enabled: !!userId,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, email }: { userId: string; email: string }) => 
      resetUserPassword(userId, email),
    onSuccess: () => {
      handleQuerySuccess('Password reset email sent successfully');
    },
    onError: (error) => {
      handleQueryError(error, 'Failed to send password reset email');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: () => {
      handleQuerySuccess('User account deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error) => {
      handleQueryError(error, 'Failed to delete user account');
    }
  });

  const verifyEmailMutation = useMutation({
    mutationFn: verifyUserEmail,
    onSuccess: () => {
      handleQuerySuccess('User email verified successfully');
      queryClient.invalidateQueries({ queryKey: ['userDetails', userId] });
    },
    onError: (error) => {
      handleQueryError(error, 'Failed to verify user email');
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: any }) => 
      updateUserProfile(userId, updates),
    onSuccess: () => {
      handleQuerySuccess('User profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['userDetails', userId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error) => {
      handleQueryError(error, 'Failed to update user profile');
    }
  });

  return {
    userDetails: data,
    isLoading,
    error,
    resetPassword: (email: string) => resetPasswordMutation.mutateAsync({ userId: userId!, email }),
    deleteUser: () => deleteUserMutation.mutateAsync(userId!),
    verifyEmail: () => verifyEmailMutation.mutateAsync(userId!),
    updateProfile: (updates: any) => updateProfileMutation.mutateAsync({ userId: userId!, updates }),
    isResettingPassword: resetPasswordMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending
  };
}
