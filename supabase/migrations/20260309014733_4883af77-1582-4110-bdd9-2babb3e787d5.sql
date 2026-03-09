-- Create site_content table for CMS
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(section, key)
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content (public website)
CREATE POLICY "Anyone can read site content"
  ON public.site_content FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert site content"
  ON public.site_content FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site content"
  ON public.site_content FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site content"
  ON public.site_content FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default content
INSERT INTO public.site_content (section, key, value) VALUES
  ('hero', 'main', '{"title": "Your Gateway to Global Opportunities", "subtitle": "Expert immigration, travel, and logistics services across Africa and beyond", "cta_text": "Get Started", "cta_link": "/consultation"}'::jsonb),
  ('services', 'travel', '{"title": "Travel Services", "description": "Flight bookings, hotel accommodations, and complete visa assistance for seamless journeys.", "icon": "Plane"}'::jsonb),
  ('services', 'immigration', '{"title": "Immigration Services", "description": "Work permits, credential evaluations, and immigration support for major destinations.", "icon": "Globe"}'::jsonb),
  ('services', 'logistics', '{"title": "Logistics", "description": "Reliable shipping, customs clearance, and real-time tracking for your cargo.", "icon": "Package"}'::jsonb),
  ('contact', 'info', '{"email": "info@africanwaves.com", "phone": "+233 XX XXX XXXX", "address": "Accra, Ghana", "hours": "Mon-Fri: 9AM-6PM"}'::jsonb)
ON CONFLICT (section, key) DO NOTHING;