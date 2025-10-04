-- Drop the old check constraint if it exists
ALTER TABLE designer_profiles DROP CONSTRAINT IF EXISTS designer_profiles_status_check;

-- Add updated check constraint to allow pending, active, and inactive statuses
ALTER TABLE designer_profiles 
ADD CONSTRAINT designer_profiles_status_check 
CHECK (status IN ('pending', 'active', 'inactive'));

-- Also update artist_profiles to have consistent status values
ALTER TABLE artist_profiles DROP CONSTRAINT IF EXISTS artist_profiles_status_check;

ALTER TABLE artist_profiles 
ADD CONSTRAINT artist_profiles_status_check 
CHECK (status IN ('pending', 'approved', 'declined'));