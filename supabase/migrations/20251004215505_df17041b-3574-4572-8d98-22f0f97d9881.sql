-- Step 1: Sync existing designer_profiles with user_roles
-- Insert designer role for any user that has a designer_profiles entry but no designer role
INSERT INTO public.user_roles (user_id, role)
SELECT dp.user_id, 'designer'::app_role
FROM designer_profiles dp
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = dp.user_id AND ur.role = 'designer'
);

-- Step 3: Create trigger to maintain data consistency
-- Function to ensure user_roles entry when designer_profile is created
CREATE OR REPLACE FUNCTION public.ensure_designer_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert designer role if it doesn't exist
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'designer'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger that runs after designer_profile insert
CREATE TRIGGER ensure_designer_role_trigger
AFTER INSERT ON public.designer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_designer_role();