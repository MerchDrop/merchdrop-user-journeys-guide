-- Create comprehensive RLS policies for user_roles
CREATE POLICY "rls_user_roles_super_admin_all"
ON public.user_roles
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "rls_user_roles_admin_manage"
ON public.user_roles
FOR ALL
USING (public.can_manage_user_roles())
WITH CHECK (public.can_manage_user_roles());

CREATE POLICY "rls_user_roles_view_own"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "rls_user_roles_self_assign_initial"
ON public.user_roles  
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND role IN ('user', 'artist', 'designer')
  AND public.can_self_assign_initial_role()
);

-- Create comprehensive RLS policies for profiles
CREATE POLICY "rls_profiles_view_all"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "rls_profiles_insert_own"
ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "rls_profiles_update_own"  
ON public.profiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Create the secure profile setup function
CREATE OR REPLACE FUNCTION public.setup_user_profile(
  _display_name text DEFAULT NULL,
  _user_type app_role DEFAULT 'user'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _user_email text;
  _result jsonb := '{}';
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  SELECT email INTO _user_email
  FROM auth.users 
  WHERE id = _user_id;
  
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (_user_id, _user_email, COALESCE(_display_name, _user_email))
  ON CONFLICT (id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    updated_at = now();
  
  _result := jsonb_set(_result, '{profile_created}', 'true');
  
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _user_type);
    
    _result := jsonb_set(_result, '{role_created}', to_jsonb(_user_type::text));
  END IF;
  
  RETURN _result;
END;
$$;