-- Fix the setup_user_profile function to handle auth context properly
CREATE OR REPLACE FUNCTION public.setup_user_profile(_display_name text DEFAULT NULL::text, _user_type app_role DEFAULT 'user'::app_role)
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
  -- Get the authenticated user
  _user_id := auth.uid();
  
  -- Check if user is authenticated
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required: Please log in to continue' USING ERRCODE = 'P0001';
  END IF;
  
  -- Get user email from auth.users
  SELECT email INTO _user_email
  FROM auth.users 
  WHERE id = _user_id;
  
  IF _user_email IS NULL THEN
    RAISE EXCEPTION 'User email not found in auth system' USING ERRCODE = 'P0001';
  END IF;
  
  -- Create or update profile
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (_user_id, _user_email, COALESCE(_display_name, _user_email))
  ON CONFLICT (id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    updated_at = now();
  
  _result := jsonb_set(_result, '{profile_created}', 'true');
  
  -- Only create role if user doesn't have any roles yet
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _user_type);
    
    _result := jsonb_set(_result, '{role_created}', to_jsonb(_user_type::text));
    
    -- Create additional profile tables based on role
    IF _user_type = 'artist' THEN
      INSERT INTO public.artist_profiles (
        user_id, 
        artist_name, 
        artist_slug, 
        status
      )
      VALUES (
        _user_id,
        COALESCE(_display_name, _user_email),
        lower(regexp_replace(
          COALESCE(_display_name, _user_email),
          '[^a-zA-Z0-9\s]', '', 'g'
        )),
        'pending'
      )
      ON CONFLICT (user_id) DO NOTHING;
      
      _result := jsonb_set(_result, '{artist_profile_created}', 'true');
      
    ELSIF _user_type = 'designer' THEN
      INSERT INTO public.designer_profiles (
        user_id,
        designer_name,
        status
      )
      VALUES (
        _user_id,
        COALESCE(_display_name, _user_email),
        'active'
      )
      ON CONFLICT (user_id) DO NOTHING;
      
      _result := jsonb_set(_result, '{designer_profile_created}', 'true');
    END IF;
  ELSE
    _result := jsonb_set(_result, '{role_exists}', 'true');
  END IF;
  
  RETURN _result;
END;
$$;