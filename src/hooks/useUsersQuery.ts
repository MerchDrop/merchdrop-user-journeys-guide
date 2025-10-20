import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { handleQueryError, handleQuerySuccess, createOptimisticUpdate } from '@/lib/queryUtils';

export interface UserRoleDetail {
  id: string;
  role: string;
  status: string;
  requested_role?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  account_status?: string;
  roles: string[];
  user_roles: UserRoleDetail[];
}

// Fetch users with their roles (excluding designers)
async function fetchUsers(): Promise<UserProfile[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) throw profilesError;

  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('id, user_id, role, status, requested_role, approved_by, approved_at, rejection_reason, created_at');

  if (rolesError) throw rolesError;

  // Fetch artist and designer profiles to reconcile status
  const { data: artistProfiles } = await supabase
    .from('artist_profiles')
    .select('user_id, status');

  const { data: designerProfiles } = await supabase
    .from('designer_profiles')
    .select('user_id, status');

  // Create status maps for quick lookup
  const artistStatusMap = (artistProfiles || []).reduce((acc, ap) => {
    acc[ap.user_id] = ap.status;
    return acc;
  }, {} as Record<string, string>);

  const designerStatusMap = (designerProfiles || []).reduce((acc, dp) => {
    acc[dp.user_id] = dp.status;
    return acc;
  }, {} as Record<string, string>);

  // Helper to reconcile status from profile tables
  const getReconciledStatus = (userId: string, role: string, roleStatus: string): string => {
    if (role === 'artist' && artistStatusMap[userId]) {
      // Map artist_profiles status to user_roles status
      const artistStatus = artistStatusMap[userId];
      if (artistStatus === 'approved') return 'active';
      if (artistStatus === 'declined') return 'rejected';
      if (artistStatus === 'pending') return 'pending';
    }
    
    if (role === 'designer' && designerStatusMap[userId]) {
      // Map designer_profiles status to user_roles status
      const designerStatus = designerStatusMap[userId];
      if (designerStatus === 'active') return 'active';
      if (designerStatus === 'inactive') return 'rejected';
      if (designerStatus === 'pending') return 'pending';
    }
    
    return roleStatus; // Use original status if no profile match
  };

  // Group roles by user_id with reconciled status
  const rolesByUser = userRoles.reduce((acc, roleData) => {
    if (!acc[roleData.user_id]) acc[roleData.user_id] = [];
    
    const reconciledStatus = getReconciledStatus(
      roleData.user_id,
      roleData.role,
      roleData.status
    );
    
    acc[roleData.user_id].push({
      id: roleData.id,
      role: roleData.role,
      status: reconciledStatus,
      requested_role: roleData.requested_role,
      approved_by: roleData.approved_by,
      approved_at: roleData.approved_at,
      rejection_reason: roleData.rejection_reason,
      created_at: roleData.created_at
    });
    return acc;
  }, {} as Record<string, UserRoleDetail[]>);

  // Filter out users who have designer role (any status)
  return profiles
    .filter(profile => {
      const userRolesList = rolesByUser[profile.id] || [];
      const hasDesignerRole = userRolesList.some(r => r.role === 'designer');
      return !hasDesignerRole;
    })
    .map(profile => ({
      ...profile,
      roles: rolesByUser[profile.id]?.map(r => r.role) || ['user'],
      user_roles: rolesByUser[profile.id] || []
    }));
}

// Update user role
async function updateUserRole(userId: string, newRole: string): Promise<void> {
  // Remove existing roles
  await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  // Add new role
  const { error } = await supabase
    .from('user_roles')
    .insert([{ user_id: userId, role: newRole as any }]);

  if (error) throw error;

  // Create associated profiles based on role
  if (newRole === 'artist') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', userId)
      .single();

    const artistName = profile?.display_name || profile?.email || 'Artist';
    const artistSlug = artistName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');

    await supabase
      .from('artist_profiles')
      .upsert({
        user_id: userId,
        artist_name: artistName,
        artist_slug: artistSlug,
        status: 'pending'
      });
  } else if (newRole === 'designer') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', userId)
      .single();

    const designerName = profile?.display_name || profile?.email || 'Designer';

    await supabase
      .from('designer_profiles')
      .upsert({
        user_id: userId,
        designer_name: designerName,
        status: 'active'
      });
  }
}

// React Query hooks
export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, newRole }: { userId: string; newRole: string }) =>
      updateUserRole(userId, newRole),
    onMutate: async ({ userId, newRole }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.list() });

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData<UserProfile[]>(queryKeys.users.list());

      // Optimistically update
      if (previousUsers) {
        const optimisticUsers = createOptimisticUpdate(
          previousUsers,
          { id: userId, roles: [newRole] },
          'update'
        );
        queryClient.setQueryData(queryKeys.users.list(), optimisticUsers);
      }

      return { previousUsers };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users.list(), context.previousUsers);
      }
      handleQueryError(error, 'Failed to update user role');
    },
    onSuccess: () => {
      handleQuerySuccess('User role updated successfully');
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

// Legacy hook wrapper for backward compatibility
export function useUsers() {
  const { data: users = [], isLoading: loading, error } = useUsersQuery();
  const updateUserRoleMutation = useUpdateUserRoleMutation();
  const queryClient = useQueryClient();

  const updateUserRole = (userId: string, newRole: string) => {
    return updateUserRoleMutation.mutateAsync({ userId, newRole });
  };

  const suspendUser = async (userId: string) => {
    try {
      // Update profile account status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ account_status: 'suspended' })
        .eq('id', userId);
      
      if (profileError) throw profileError;

      // Update all active roles to rejected
      const { error: rolesError } = await supabase
        .from('user_roles')
        .update({ status: 'rejected' })
        .eq('user_id', userId)
        .eq('status', 'active');
      
      if (rolesError) throw rolesError;

      // Update associated profiles
      await supabase.from('artist_profiles')
        .update({ status: 'declined' })
        .eq('user_id', userId);
        
      await supabase.from('designer_profiles')
        .update({ status: 'inactive' })
        .eq('user_id', userId);

      handleQuerySuccess('User suspended successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    } catch (error) {
      handleQueryError(error, 'Failed to suspend user');
    }
  };

  const activateUser = async (userId: string) => {
    try {
      // Update profile account status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ account_status: 'active' })
        .eq('id', userId);
      
      if (profileError) throw profileError;

      // Update all pending/rejected roles to active
      const { error: rolesError } = await supabase
        .from('user_roles')
        .update({ status: 'active' })
        .eq('user_id', userId)
        .in('status', ['pending', 'rejected']);
      
      if (rolesError) throw rolesError;

      // Update associated profiles
      await supabase.from('artist_profiles')
        .update({ status: 'approved' })
        .eq('user_id', userId)
        .in('status', ['pending', 'declined']);
        
      await supabase.from('designer_profiles')
        .update({ status: 'active' })
        .eq('user_id', userId)
        .in('status', ['pending', 'inactive']);

      handleQuerySuccess('User activated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    } catch (error) {
      handleQueryError(error, 'Failed to activate user');
    }
  };

  return {
    users,
    loading,
    error: error?.message || null,
    fetchUsers: () => {}, // No longer needed with React Query
    updateUserRole,
    suspendUser,
    activateUser,
  };
}