-- Ensure super admin user has admin role
-- First, let's make sure the profiles table has the super admin
DO $$
DECLARE
    super_admin_id uuid;
BEGIN
    -- Check if there's a user with the super admin email in auth.users and get their ID
    SELECT id INTO super_admin_id 
    FROM auth.users 
    WHERE email = 'merchdrop.live@gmail.com' 
    LIMIT 1;
    
    -- If the user exists, ensure they have a profile and admin role
    IF super_admin_id IS NOT NULL THEN
        -- Insert or update profile for super admin
        INSERT INTO public.profiles (id, email, display_name)
        VALUES (super_admin_id, 'merchdrop.live@gmail.com', 'Super Admin')
        ON CONFLICT (id) 
        DO UPDATE SET 
            email = EXCLUDED.email,
            display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
            updated_at = now();
        
        -- Ensure super admin has admin role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (super_admin_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Super admin setup completed for user ID: %', super_admin_id;
    ELSE
        RAISE NOTICE 'Super admin user not found in auth.users. They need to sign up first.';
    END IF;
END $$;