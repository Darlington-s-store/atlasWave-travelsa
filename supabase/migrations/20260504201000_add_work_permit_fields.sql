
-- Migration: Add work permit specific fields to applications table
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS qualification text,
  ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '{}'::jsonb;

-- Add comments
COMMENT ON COLUMN public.applications.qualification IS 'Highest educational or professional qualification for work permit applications';
COMMENT ON COLUMN public.applications.documents IS 'JSON object storing requirement names and uploaded filenames';
