-- Create the group-covers storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'group-covers',
  'group-covers',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view group covers (public bucket)
CREATE POLICY "Group covers are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'group-covers');

-- Group admins can upload covers (path: {group_id}/cover.jpg)
CREATE POLICY "Group admins can upload covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'group-covers'
    AND EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = (storage.foldername(name))[1]::uuid
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
        AND gm.status = 'active'
    )
  );

-- Group admins can replace (upsert) covers
CREATE POLICY "Group admins can update covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'group-covers'
    AND EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = (storage.foldername(name))[1]::uuid
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
        AND gm.status = 'active'
    )
  );

-- Group admins can delete covers
CREATE POLICY "Group admins can delete covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'group-covers'
    AND EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = (storage.foldername(name))[1]::uuid
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
        AND gm.status = 'active'
    )
  );
