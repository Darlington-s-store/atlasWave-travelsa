
-- Create destinations table for admin-managed travel destinations
CREATE TABLE public.destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  description text,
  image_url text,
  category text NOT NULL DEFAULT 'travel',
  price_from numeric,
  currency text NOT NULL DEFAULT 'GHS',
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  highlights text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Anyone can read active destinations
CREATE POLICY "Anyone can read active destinations" ON public.destinations
  FOR SELECT USING (active = true);

-- Admins can manage destinations
CREATE POLICY "Admins can manage destinations" ON public.destinations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add realtime for destinations
ALTER PUBLICATION supabase_realtime ADD TABLE public.destinations;
