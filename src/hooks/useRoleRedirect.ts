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

    // Get only ACTIVE roles
    const activeRoles = userRoles.filter(r => r.status === 'active').map(r => r.role);
    const pendingRoles = userRoles.filter(r => r.status === 'pending');

    console.log('🔀 Role redirect check - Active roles:', activeRoles, 'Pending roles:', pendingRoles);

    // Check for pending artist/designer roles FIRST
    const pendingArtist = pendingRoles.find(r => r.role === 'artist');
    const pendingDesigner = pendingRoles.find(r => r.role === 'designer');

    // If user has pending artist role, redirect to artist dashboard
    if (pendingArtist) {
      console.log('⏳ Pending artist detected, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }

    // If user has pending designer role, redirect to designer dashboard
    if (pendingDesigner) {
      console.log('⏳ Pending designer detected, redirecting to designer dashboard');
      navigate('/designer/dashboard');
      return;
    }

    // Role priority for ACTIVE roles: admin > designer > artist > user
    if (activeRoles.includes('admin')) {
      console.log('👑 Admin detected, redirecting to /admin');
      navigate('/admin');
    } else if (activeRoles.includes('designer')) {
      console.log('🎨 Designer detected, redirecting to /designer/dashboard');
      navigate('/designer/dashboard');
    } else if (activeRoles.includes('artist')) {
      console.log('🎤 Artist detected, redirecting to /dashboard');
      navigate('/dashboard');
    } else if (pendingRoles.length > 0) {
      // For other pending roles (e.g., pending admin), show pending approval page
      console.log('⏳ User has other pending roles, redirecting to approval page');
      navigate('/pending-approval');
    } else {
      // Regular user or no specific role
      console.log('👤 Regular user, redirecting to:', defaultPath);
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
