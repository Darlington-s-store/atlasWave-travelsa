
-- Videos table for CMS-managed videos
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_type TEXT NOT NULL DEFAULT 'embed', -- 'embed' or 'upload'
  video_url TEXT, -- YouTube/Vimeo URL for embeds
  file_path TEXT, -- Storage path for uploads
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- 'hero', 'services', 'gallery', 'about'
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read visible videos" ON public.videos
  FOR SELECT USING (visible = true);

-- Admin full access
CREATE POLICY "Admins can manage videos" ON public.videos
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;

-- Video uploads storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('video-uploads', 'video-uploads', true);

-- Storage policies for video-uploads
CREATE POLICY "Anyone can read video uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'video-uploads');

CREATE POLICY "Admins can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'video-uploads' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update video uploads" ON storage.objects
  FOR UPDATE USING (bucket_id = 'video-uploads' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete video uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'video-uploads' AND has_role(auth.uid(), 'admin'::app_role));
