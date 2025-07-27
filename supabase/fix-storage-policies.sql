-- Fix storage policies to allow public uploads since the app doesn't use authentication

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload player images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update player images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete player images" ON storage.objects;

-- Create public upload policies for logos bucket
CREATE POLICY "Public can upload logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Public can update logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'logos');

CREATE POLICY "Public can delete logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'logos');

-- Create public upload policies for players bucket
CREATE POLICY "Public can upload player images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'players');

CREATE POLICY "Public can update player images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'players');

CREATE POLICY "Public can delete player images" ON storage.objects
  FOR DELETE USING (bucket_id = 'players');

-- Ensure buckets are public
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('logos', 'players');