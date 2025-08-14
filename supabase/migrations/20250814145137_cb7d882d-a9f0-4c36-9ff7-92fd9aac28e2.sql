-- Create the missing trigger to call handle_new_user() when users sign up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert an admin role for the first user (you can change the email to match your account)
-- This will help you bootstrap the first admin user
-- Replace 'your-email@example.com' with your actual email address
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'your-email@example.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.users.id AND role = 'admin'
);

-- Alternative: If you want to make the first registered user an admin automatically
-- Uncomment the following lines:
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::app_role
-- FROM auth.users 
-- ORDER BY created_at ASC
-- LIMIT 1
-- ON CONFLICT (user_id, role) DO NOTHING;