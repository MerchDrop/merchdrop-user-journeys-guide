-- Create design-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-files', 'design-files', true);

-- RLS policy: Designers can upload design files
CREATE POLICY "Designers can upload design files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'design-files' AND
  EXISTS (
    SELECT 1 FROM designer_profiles dp
    WHERE dp.user_id = auth.uid()
  )
);

-- RLS policy: Anyone can view design files (public bucket for review)
CREATE POLICY "Anyone can view design files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'design-files');

-- RLS policy: Designers can update own design files
CREATE POLICY "Designers can update own design files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'design-files' AND
  EXISTS (
    SELECT 1 FROM designer_profiles dp
    WHERE dp.user_id = auth.uid()
  )
);

-- RLS policy: Designers can delete own design files
CREATE POLICY "Designers can delete own design files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'design-files' AND
  EXISTS (
    SELECT 1 FROM designer_profiles dp
    WHERE dp.user_id = auth.uid()
  )
);

-- RLS policy: Admins can manage all design files
CREATE POLICY "Admins can manage all design files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'design-files' AND
  public.is_admin()
);