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

      // Fetch profiles data
      const { data: profilesData, error: profilesError } = await supabase
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

      if (profilesError) {
        throw profilesError;
      }

      // Fetch user roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.warn('Could not fetch user roles:', rolesError);
      }

      // Combine profiles with roles
      const usersWithRoles = (profilesData || []).map(profile => ({
        ...profile,
        user_roles: rolesData?.filter(role => role.user_id === profile.id) || []
      }));

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
        .insert({ user_id: userId, role: newRole as 'admin' | 'moderator' | 'artist' | 'designer' | 'user' });

      if (error) throw error;

      // Create appropriate profile based on role
      if (newRole === 'artist') {
        // Get user profile for artist name
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', userId)
          .single();

        const artistName = profile?.display_name || profile?.email || 'New Artist';
        const artistSlug = artistName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

        // Check if artist profile already exists
        const { data: existingArtist } = await supabase
          .from('artist_profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (!existingArtist) {
          await supabase
            .from('artist_profiles')
            .insert({
              user_id: userId,
              artist_name: artistName,
              artist_slug: artistSlug + '-' + userId.slice(0, 8), // Add unique suffix
              status: 'pending'
            });
        }
      } else if (newRole === 'designer') {
        // Get user profile for designer name
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', userId)
          .single();

        const designerName = profile?.display_name || profile?.email || 'New Designer';

        // Check if designer profile already exists
        const { data: existingDesigner } = await supabase
          .from('designer_profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (!existingDesigner) {
          await supabase
            .from('designer_profiles')
            .insert({
              user_id: userId,
              designer_name: designerName,
              bio: 'New designer on the platform',
              status: 'active'
            });
        }
      }

      toast({
        title: "Success",
        description: `User role updated to ${newRole} successfully.`,
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