-- Update handle_new_user to support designer user_type
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
    -- Insert artist role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'artist');
    
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
    -- Insert designer role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'designer');
    
    -- Create designer profile with active status
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
      'active'
    );
  ELSE
    -- Default to 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create repair function for existing designers with wrong roles
CREATE OR REPLACE FUNCTION public.repair_missing_designer_roles()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  fixed_count INTEGER := 0;
  user_record RECORD;
  result jsonb := '{}';
BEGIN
  -- Find users with designer_profiles but no designer role
  FOR user_record IN 
    SELECT dp.user_id, p.display_name, p.email
    FROM designer_profiles dp
    JOIN profiles p ON dp.user_id = p.id
    LEFT JOIN user_roles ur ON dp.user_id = ur.user_id AND ur.role = 'designer'
    WHERE ur.id IS NULL
  LOOP
    fixed_count := fixed_count + 1;
    
    -- Remove the incorrect 'user' role if it exists
    DELETE FROM user_roles 
    WHERE user_id = user_record.user_id AND role = 'user';
    
    -- Add the correct 'designer' role
    INSERT INTO user_roles (user_id, role)
    VALUES (user_record.user_id, 'designer')
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
  
  result := jsonb_build_object(
    'fixed_roles', fixed_count,
    'message', 'Fixed ' || fixed_count || ' designer users with incorrect roles'
  );
  
  RETURN result;
END;
$function$;