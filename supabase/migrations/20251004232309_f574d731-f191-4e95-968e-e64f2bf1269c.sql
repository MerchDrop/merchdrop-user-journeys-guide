-- Add account_status to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' 
CHECK (account_status IN ('active', 'suspended'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);

-- RLS policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- RLS policy: Suspended users have limited access
CREATE POLICY "Suspended users limited access"
ON profiles FOR SELECT
TO authenticated
USING (
  account_status = 'active' OR 
  id = auth.uid() OR 
  public.is_admin()
);