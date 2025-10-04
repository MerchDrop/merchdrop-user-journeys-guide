import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

type AppRole = 'admin' | 'artist' | 'designer' | 'moderator' | 'user';

export interface PendingRoleRequest {
  user_id: string;
  role: AppRole;
  created_at: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
}

export function useRoleApproval() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const approveRole = async (userId: string, role: AppRole) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('approve_role_request', {
        _user_id: userId,
        _role: role,
        _admin_id: user.id,
      });

      if (error) throw error;

      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} role approved successfully`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      
      return data;
    } catch (error: any) {
      console.error('Error approving role:', error);
      toast.error(error.message || 'Failed to approve role');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rejectRole = async (userId: string, role: AppRole, reason?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('reject_role_request', {
        _user_id: userId,
        _role: role,
        _admin_id: user.id,
        _reason: reason || null,
      });

      if (error) throw error;

      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} role rejected`);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      
      return data;
    } catch (error: any) {
      console.error('Error rejecting role:', error);
      toast.error(error.message || 'Failed to reject role');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPendingRoles = async (): Promise<PendingRoleRequest[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at,
          profiles:user_id (
            display_name,
            email,
            avatar_url
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(item => ({
        user_id: item.user_id,
        role: item.role as AppRole,
        created_at: item.created_at,
        display_name: (item.profiles as any)?.display_name,
        email: (item.profiles as any)?.email,
        avatar_url: (item.profiles as any)?.avatar_url,
      })) || [];
    } catch (error: any) {
      console.error('Error fetching pending roles:', error);
      toast.error('Failed to fetch pending approvals');
      return [];
    }
  };

  return {
    approveRole,
    rejectRole,
    getPendingRoles,
    loading,
  };
}
