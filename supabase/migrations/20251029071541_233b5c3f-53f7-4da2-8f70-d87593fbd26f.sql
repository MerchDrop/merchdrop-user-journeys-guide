-- Add notification_settings column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{
  "email_orders": true,
  "email_payouts": true,
  "email_marketing": false,
  "push_orders": true,
  "push_payouts": true,
  "push_marketing": false
}'::jsonb;

COMMENT ON COLUMN profiles.notification_settings IS 'User notification preferences stored as JSON';