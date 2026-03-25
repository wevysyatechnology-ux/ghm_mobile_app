-- Create profile-photos storage bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880,  -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- RLS: allow authenticated users to upload only into their own user-id folder
CREATE POLICY "Users can upload their own profile photo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS: allow authenticated users to update their own photo
CREATE POLICY "Users can update their own profile photo"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS: allow authenticated users to delete their own photo
CREATE POLICY "Users can delete their own profile photo"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS: allow anyone (including anon) to read/view profile photos (public bucket)
CREATE POLICY "Profile photos are publicly viewable"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');
