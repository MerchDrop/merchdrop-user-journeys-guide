-- Update all pending artist profiles to approved status so they can access dashboard
UPDATE artist_profiles 
SET status = 'approved', updated_at = NOW() 
WHERE status = 'pending';