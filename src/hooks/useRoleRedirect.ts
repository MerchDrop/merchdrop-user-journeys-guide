import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to handle role-based redirects with priority:
 * admin > designer > artist > user
 * Only considers ACTIVE roles, ignores pending ones
 */
export function useRoleRedirect(options?: {
  skipRedirect?: boolean;
  defaultPath?: string;
}) {
  const navigate = useNavigate();
  const { user, loading, userRoles } = useAuth();
  const { skipRedirect = false, defaultPath = '/' } = options || {};

  useEffect(() => {
    // Wait for auth to initialize
    if (loading || skipRedirect) return;

    // If no user, redirect to home
    if (!user) {
      navigate(defaultPath);
      return;
    }

    const activeRoles = userRoles.filter(r => r.status === 'active').map(r => r.role);
    const pendingRoles = userRoles.filter(r => r.status === 'pending');

    const pendingArtist = pendingRoles.find(r => r.role === 'artist');
    const pendingDesigner = pendingRoles.find(r => r.role === 'designer');

    if (pendingArtist) {
      navigate('/dashboard');
      return;
    }

    if (pendingDesigner) {
      navigate('/designer/dashboard');
      return;
    }

    // Priority: admin > designer > artist > user
    if (activeRoles.includes('admin')) {
      navigate('/admin');
    } else if (activeRoles.includes('designer')) {
      navigate('/designer/dashboard');
    } else if (activeRoles.includes('artist')) {
      navigate('/dashboard');
    } else if (pendingRoles.length > 0) {
      navigate('/pending-approval');
    } else {
      navigate(defaultPath);
    }
  }, [user, loading, userRoles, navigate, skipRedirect, defaultPath]);

  return {
    user,
    loading,
    activeRoles: userRoles.filter(r => r.status === 'active'),
    pendingRoles: userRoles.filter(r => r.status === 'pending'),
  };
}
