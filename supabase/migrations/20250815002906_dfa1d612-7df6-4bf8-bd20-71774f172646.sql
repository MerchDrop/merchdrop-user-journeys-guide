-- Assign all available roles to merchdrop.live@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id,
  role_enum.role
FROM profiles p
CROSS JOIN (
  SELECT unnest(enum_range(NULL::app_role)) as role
) role_enum
WHERE p.email = 'merchdrop.live@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Create a super admin function for maximum privileges
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.id = ur.user_id
    WHERE p.id = auth.uid() 
    AND p.email = 'merchdrop.live@gmail.com'
    AND ur.role = 'admin'
  );
$$;

-- Grant super admin full access to user_roles table
CREATE POLICY "Super admin can manage all user roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());