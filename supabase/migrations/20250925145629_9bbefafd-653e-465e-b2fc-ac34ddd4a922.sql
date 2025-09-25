-- First, let's check the current state
-- Remove duplicate/unnecessary roles and keep only the primary role for each user

-- For the user with multiple roles, we'll keep only 'admin' since admin typically includes all permissions
DELETE FROM user_roles 
WHERE user_id = '2ee9f29a-c354-4826-82ac-540b3912faf9' 
AND role IN ('moderator', 'artist', 'user');

-- Add a unique constraint to prevent duplicate role assignments per user
-- This will ensure each user can only have one instance of each role
ALTER TABLE user_roles 
ADD CONSTRAINT unique_user_role 
UNIQUE (user_id, role);

-- Create a function to get the primary role for a user (highest priority role they have)
CREATE OR REPLACE FUNCTION public.get_primary_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'moderator' THEN 2  
      WHEN 'artist' THEN 3
      WHEN 'user' THEN 4
    END
  LIMIT 1;
$$;

-- Update the existing has_role function to be more efficient
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;