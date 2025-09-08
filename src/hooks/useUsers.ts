import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  created_at: string;
  user_roles: {
    role: string;
  }[];
}

export const useUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          display_name,
          first_name,
          last_name,
          avatar_url,
          created_at
        `)
        .order('created_at', { ascending: false });

      // Fetch user roles separately
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Combine profiles with roles
      const usersWithRoles = (data || []).map(profile => ({
        ...profile,
        user_roles: rolesData?.filter(role => role.user_id === profile.id) || []
      }));

      if (error) throw error;

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      // Remove existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Add new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole as 'admin' | 'moderator' | 'artist' | 'user' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully.",
      });

      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      // In a real implementation, you might have a status field in profiles
      // For now, we'll just show a toast
      toast({
        title: "Action Required",
        description: "User suspension feature needs to be implemented in the database schema.",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Error suspending user:', err);
    }
  };

  const activateUser = async (userId: string) => {
    try {
      // In a real implementation, you might have a status field in profiles
      toast({
        title: "Action Required", 
        description: "User activation feature needs to be implemented in the database schema.",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Error activating user:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUserRole,
    suspendUser,
    activateUser,
  };
};