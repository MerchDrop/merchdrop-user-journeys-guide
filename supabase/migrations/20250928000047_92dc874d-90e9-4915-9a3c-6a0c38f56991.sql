-- Allow users to self-assign designer role during initial signup
DROP POLICY IF EXISTS "Users can self-assign initial role" ON public.user_roles;

CREATE POLICY "Users can self-assign initial role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) 
  AND (role = ANY (ARRAY['user'::app_role, 'artist'::app_role, 'designer'::app_role])) 
  AND (NOT EXISTS (
    SELECT 1 
    FROM user_roles ur 
    WHERE ur.user_id = auth.uid()
  ))
);

-- Allow users to insert designer profiles for themselves
CREATE POLICY "Users can create designer profile" 
ON public.designer_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);