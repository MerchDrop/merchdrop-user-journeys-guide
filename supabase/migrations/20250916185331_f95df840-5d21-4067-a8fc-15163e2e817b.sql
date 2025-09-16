-- Create RPC function to ensure profile and role exist for user
CREATE OR REPLACE FUNCTION public.ensure_profile_and_role(
  user_type text DEFAULT 'user'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  profile_exists boolean;
  role_exists boolean;
  result jsonb := '{}';
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = current_user_id) INTO profile_exists;
  
  -- Check if user has any roles
  SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = current_user_id) INTO role_exists;
  
  -- Create profile if it doesn't exist
  IF NOT profile_exists THEN
    INSERT INTO profiles (id, email, display_name)
    SELECT 
      current_user_id,
      au.email,
      COALESCE(au.raw_user_meta_data->>'display_name', au.email)
    FROM auth.users au
    WHERE au.id = current_user_id;
    
    result := jsonb_set(result, '{profile_created}', 'true');
  END IF;
  
  -- Create role if it doesn't exist
  IF NOT role_exists THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (current_user_id, user_type::app_role);
    
    result := jsonb_set(result, '{role_created}', to_jsonb(user_type));
  END IF;
  
  RETURN result;
END;
$$;

-- Add RLS policy to allow users to self-assign initial roles
CREATE POLICY "Users can self-assign initial role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role IN ('user', 'artist')
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid()
  )
);