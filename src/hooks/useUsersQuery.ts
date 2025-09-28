import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { handleQueryError, handleQuerySuccess, createOptimisticUpdate } from '@/lib/queryUtils';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  roles: string[];
  user_roles?: Array<{ role: string }>;
}

// Fetch users with their roles
async function fetchUsers(): Promise<UserProfile[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) throw profilesError;

  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role');

  if (rolesError) throw rolesError;

  // Group roles by user_id
  const rolesByUser = userRoles.reduce((acc, { user_id, role }) => {
    if (!acc[user_id]) acc[user_id] = [];
    acc[user_id].push(role);
    return acc;
  }, {} as Record<string, string[]>);

  return profiles.map(profile => ({
    ...profile,
    roles: rolesByUser[profile.id] || ['user'],
    user_roles: (rolesByUser[profile.id] || ['user']).map(role => ({ role }))
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

  const updateUserRole = (userId: string, newRole: string) => {
    return updateUserRoleMutation.mutateAsync({ userId, newRole });
  };

  const suspendUser = (userId: string) => {
    handleQueryError(null, 'User suspension functionality not implemented yet');
  };

  const activateUser = (userId: string) => {
    handleQueryError(null, 'User activation functionality not implemented yet');
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