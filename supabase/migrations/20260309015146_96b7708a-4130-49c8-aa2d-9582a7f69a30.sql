-- Create storage bucket for CMS images
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms-images', 'cms-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view CMS images (public bucket)
CREATE POLICY "Anyone can view CMS images"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms-images');

-- Only admins can upload/update/delete CMS images
CREATE POLICY "Admins can upload CMS images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update CMS images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete CMS images"
ON storage.objects FOR DELETE
USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));