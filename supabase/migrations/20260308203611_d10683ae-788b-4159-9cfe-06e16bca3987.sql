
-- Create storage bucket for user documents
INSERT INTO storage.buckets (id, name, public) VALUES ('user-documents', 'user-documents', false);

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to read own documents
CREATE POLICY "Users can read own documents" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to delete own documents
CREATE POLICY "Users can delete own documents" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Admins can read all documents
CREATE POLICY "Admins can read all stored documents" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'user-documents' AND public.has_role(auth.uid(), 'admin'));
