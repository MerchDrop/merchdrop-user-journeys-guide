-- Backfill existing approved artist/designer profiles with active user_roles
-- This fixes mismatches where profiles are approved but user_roles are still pending

-- 1. Activate artist roles for approved artist profiles
UPDATE public.user_roles ur
SET status = 'active'::role_status, approved_at = now()
FROM public.artist_profiles ap
WHERE ur.user_id = ap.user_id
  AND ur.role = 'artist'::app_role
  AND ur.status = 'pending'::role_status
  AND ap.status = 'approved';

-- 2. Activate designer roles for active designer profiles
UPDATE public.user_roles ur
SET status = 'active'::role_status, approved_at = now()
FROM public.designer_profiles dp
WHERE ur.user_id = dp.user_id
  AND ur.role = 'designer'::app_role
  AND ur.status = 'pending'::role_status
  AND dp.status = 'active';

-- 3. Create trigger function to sync artist_profiles approval to user_roles
CREATE OR REPLACE FUNCTION public.sync_artist_role_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When artist profile is approved, activate the artist role
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.user_roles
    SET status = 'active'::role_status, approved_at = now()
    WHERE user_id = NEW.user_id
      AND role = 'artist'::app_role;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Create trigger on artist_profiles
DROP TRIGGER IF EXISTS on_artist_profile_approved ON public.artist_profiles;
CREATE TRIGGER on_artist_profile_approved
  AFTER UPDATE OF status ON public.artist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_artist_role_on_approval();

-- 5. Create trigger function to sync designer_profiles activation to user_roles
CREATE OR REPLACE FUNCTION public.sync_designer_role_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When designer profile is set to active, activate the designer role
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    UPDATE public.user_roles
    SET status = 'active'::role_status, approved_at = now()
    WHERE user_id = NEW.user_id
      AND role = 'designer'::app_role;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Create trigger on designer_profiles
DROP TRIGGER IF EXISTS on_designer_profile_approved ON public.designer_profiles;
CREATE TRIGGER on_designer_profile_approved
  AFTER UPDATE OF status ON public.designer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_designer_role_on_approval();