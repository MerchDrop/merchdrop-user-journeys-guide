-- Create enum for role approval status
CREATE TYPE public.role_status AS ENUM ('active', 'pending', 'rejected');

-- Add approval tracking columns to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS status public.role_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS requested_role public.app_role,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Update existing roles to be active
UPDATE public.user_roles SET status = 'active' WHERE status IS NULL;

-- Update handle_new_user to set pending status for artist/designer roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, display_name, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
  -- Assign role based on user_type metadata
  IF NEW.raw_user_meta_data->>'user_type' = 'artist' THEN
    -- Insert user role first (active)
    INSERT INTO public.user_roles (user_id, role, status)
    VALUES (NEW.id, 'user', 'active');
    
    -- Insert artist role with pending status
    INSERT INTO public.user_roles (user_id, role, status, requested_role)
    VALUES (NEW.id, 'artist', 'pending', 'artist');
    
    -- Create artist profile with pending status
    INSERT INTO public.artist_profiles (
      user_id, 
      artist_name, 
      artist_slug, 
      status
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
      lower(regexp_replace(
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        '[^a-zA-Z0-9\s]', '', 'g'
      )),
      'pending'
    );
  ELSIF NEW.raw_user_meta_data->>'user_type' = 'designer' THEN
    -- Insert user role first (active)
    INSERT INTO public.user_roles (user_id, role, status)
    VALUES (NEW.id, 'user', 'active');
    
    -- Insert designer role with pending status
    INSERT INTO public.user_roles (user_id, role, status, requested_role)
    VALUES (NEW.id, 'designer', 'pending', 'designer');
    
    -- Create designer profile with pending status
    INSERT INTO public.designer_profiles (
      user_id,
      designer_name,
      bio,
      status
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
      NEW.raw_user_meta_data->>'bio',
      'pending'
    );
  ELSE
    -- Default to 'user' role with active status
    INSERT INTO public.user_roles (user_id, role, status)
    VALUES (NEW.id, 'user', 'active');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create function to get user's pending roles
CREATE OR REPLACE FUNCTION public.get_user_pending_roles(_user_id uuid)
RETURNS TABLE(role app_role, requested_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role, created_at
  FROM public.user_roles
  WHERE user_id = _user_id
    AND status = 'pending'::role_status;
$$;

-- Create function to approve role request
CREATE OR REPLACE FUNCTION public.approve_role_request(
  _user_id uuid,
  _role app_role,
  _admin_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb := '{}';
BEGIN
  -- Check if admin has permission
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve role requests' USING ERRCODE = 'P0001';
  END IF;
  
  -- Update the role to active
  UPDATE public.user_roles
  SET 
    status = 'active'::role_status,
    approved_by = _admin_id,
    approved_at = now()
  WHERE user_id = _user_id AND role = _role AND status = 'pending'::role_status;
  
  -- Update artist profile if artist role
  IF _role = 'artist' THEN
    UPDATE public.artist_profiles
    SET status = 'approved', approval_date = now()
    WHERE user_id = _user_id;
  END IF;
  
  -- Update designer profile if designer role
  IF _role = 'designer' THEN
    UPDATE public.designer_profiles
    SET status = 'active'
    WHERE user_id = _user_id;
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Role approved successfully',
    'user_id', _user_id,
    'role', _role
  );
  
  RETURN result;
END;
$function$;

-- Create function to reject role request
CREATE OR REPLACE FUNCTION public.reject_role_request(
  _user_id uuid,
  _role app_role,
  _admin_id uuid,
  _reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb := '{}';
BEGIN
  -- Check if admin has permission
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject role requests' USING ERRCODE = 'P0001';
  END IF;
  
  -- Update the role to rejected
  UPDATE public.user_roles
  SET 
    status = 'rejected'::role_status,
    approved_by = _admin_id,
    approved_at = now(),
    rejection_reason = _reason
  WHERE user_id = _user_id AND role = _role AND status = 'pending'::role_status;
  
  -- Update artist profile if artist role
  IF _role = 'artist' THEN
    UPDATE public.artist_profiles
    SET status = 'declined'
    WHERE user_id = _user_id;
  END IF;
  
  -- Update designer profile if designer role
  IF _role = 'designer' THEN
    UPDATE public.designer_profiles
    SET status = 'inactive'
    WHERE user_id = _user_id;
  END IF;
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Role request rejected',
    'user_id', _user_id,
    'role', _role,
    'reason', _reason
  );
  
  RETURN result;
END;
$function$;

-- Update has_role function to only consider active roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND status = 'active'::role_status
  )
$$;