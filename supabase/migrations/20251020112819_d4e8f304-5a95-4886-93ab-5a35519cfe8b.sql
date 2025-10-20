-- Create platform_settings table to store all configuration
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all settings
CREATE POLICY "Admins can manage all settings"
ON public.platform_settings
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Everyone can read public settings for display purposes
CREATE POLICY "Anyone can read settings"
ON public.platform_settings
FOR SELECT
TO public
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.platform_settings (key, value, category, description) VALUES
  ('app_name', '"MerchDrop"', 'app_config', 'Application name'),
  ('app_tagline', '"Creator Merchandise Platform"', 'app_config', 'Application tagline'),
  ('app_url', '"https://merchdrop.com"', 'app_config', 'Main application URL'),
  ('contact_email', '"support@merchdrop.com"', 'app_config', 'Contact email address'),
  ('support_email', '"help@merchdrop.com"', 'app_config', 'Support email address'),
  ('primary_color', '"#9b87f5"', 'branding', 'Primary brand color'),
  ('secondary_color', '"#7E69AB"', 'branding', 'Secondary brand color'),
  ('logo_url', '""', 'branding', 'Logo URL'),
  ('facebook_url', '""', 'social_media', 'Facebook profile URL'),
  ('twitter_url', '""', 'social_media', 'Twitter/X profile URL'),
  ('instagram_url', '""', 'social_media', 'Instagram profile URL'),
  ('linkedin_url', '""', 'social_media', 'LinkedIn profile URL'),
  ('enable_reviews', 'true', 'features', 'Enable product reviews'),
  ('enable_wishlist', 'true', 'features', 'Enable wishlist feature'),
  ('enable_notifications', 'true', 'features', 'Enable notifications'),
  ('default_currency', '"USD"', 'localization', 'Default currency code'),
  ('default_language', '"en"', 'localization', 'Default language code'),
  ('timezone', '"UTC"', 'localization', 'Default timezone')
ON CONFLICT (key) DO NOTHING;