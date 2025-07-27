-- Create storage buckets for team logos and player images
-- Run this in the Supabase SQL editor

-- Create the team logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create the player images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('players', 'players', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for public read access
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id IN ('logos', 'players'));

-- Create policies for authenticated users to upload
CREATE POLICY "Authenticated users can upload logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can upload player images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'players' AND
    auth.uid() IS NOT NULL
  );

-- Create policies for authenticated users to update
CREATE POLICY "Authenticated users can update logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can update player images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'players' AND
    auth.uid() IS NOT NULL
  );

-- Create policies for authenticated users to delete
CREATE POLICY "Authenticated users can delete logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Authenticated users can delete player images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'players' AND
    auth.uid() IS NOT NULL
  );