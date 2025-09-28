-- Explicit admin policies for managing user roles
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (public.is_admin());