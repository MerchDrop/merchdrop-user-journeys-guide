-- Migration: Fix Artist Profiles Creation and Data Integrity (Fixed)

-- First, let's update the handle_new_user function to ensure artist_profiles are created for artists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
  ELSE
    -- Default to 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create a function to repair existing users with artist role but missing profiles
CREATE OR REPLACE FUNCTION public.repair_missing_artist_profiles()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  missing_profile_count INTEGER := 0;
  user_record RECORD;
  artist_name_var TEXT;
  artist_slug_var TEXT;
  counter INTEGER;
  result jsonb := '{}';
BEGIN
  -- Find users with artist role but no artist_profiles
  FOR user_record IN 
    SELECT ur.user_id, p.display_name, p.email
    FROM user_roles ur
    JOIN profiles p ON ur.user_id = p.id
    LEFT JOIN artist_profiles ap ON ur.user_id = ap.user_id
    WHERE ur.role = 'artist' AND ap.id IS NULL
  LOOP
    missing_profile_count := missing_profile_count + 1;
    
    -- Use display_name or email as artist_name
    artist_name_var := COALESCE(user_record.display_name, user_record.email);
    
    -- Generate artist_slug
    artist_slug_var := lower(regexp_replace(artist_name_var, '[^a-zA-Z0-9\s]', '', 'g'));
    artist_slug_var := regexp_replace(artist_slug_var, '\s+', '-', 'g');
    artist_slug_var := trim(both '-' from artist_slug_var);
    
    -- Ensure unique slug
    counter := 0;
    WHILE EXISTS(SELECT 1 FROM artist_profiles ap WHERE ap.artist_slug = artist_slug_var) LOOP
      counter := counter + 1;
      artist_slug_var := artist_slug_var || '-' || counter;
    END LOOP;
    
    -- Create the missing artist profile
    INSERT INTO public.artist_profiles (
      user_id,
      artist_name,
      artist_slug,
      status
    )
    VALUES (
      user_record.user_id,
      artist_name_var,
      artist_slug_var,
      'pending'
    );
  END LOOP;
  
  result := jsonb_build_object(
    'repaired_profiles', missing_profile_count,
    'message', 'Repaired ' || missing_profile_count || ' missing artist profiles'
  );
  
  RETURN result;
END;
$$;

-- Run the repair function immediately to fix existing data
SELECT public.repair_missing_artist_profiles();