-- Grant admin role to specific user
INSERT INTO public.user_roles (user_id, role)
VALUES ('2ee9f29a-c354-4826-82ac-540b3912faf9', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;