
-- Fix 1: Remove overly permissive public-read on shipments.
-- Authenticated owners and admins keep their existing access through other policies.
DROP POLICY IF EXISTS "Anyone can read shipments by tracking number" ON public.shipments;

-- Provide a safe RPC for guest tracking lookups that returns only the
-- non-sensitive fields, scoped to the exact tracking number provided.
CREATE OR REPLACE FUNCTION public.get_shipment_by_tracking(p_tracking text)
RETURNS TABLE (
  tracking_number text,
  status text,
  origin text,
  destination text,
  eta text,
  progress integer,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.tracking_number, s.status, s.origin, s.destination, s.eta, s.progress, s.updated_at
  FROM public.shipments s
  WHERE s.tracking_number = p_tracking
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_shipment_by_tracking(text) TO anon, authenticated;

-- Fix 2: Lock down shipment_events. Replace blanket public read with
-- ownership/admin-scoped policies via the parent shipment.
DROP POLICY IF EXISTS "Anyone can read shipment events" ON public.shipment_events;

CREATE POLICY "Users can read events for their shipments"
ON public.shipment_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.shipments s
    WHERE s.id = shipment_events.shipment_id
      AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can read all shipment events"
ON public.shipment_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Provide a safe RPC for guest tracking lookups of events.
CREATE OR REPLACE FUNCTION public.get_shipment_events_by_tracking(p_tracking text)
RETURNS TABLE (
  status text,
  description text,
  location text,
  occurred_at timestamptz,
  sort_order integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.status, e.description, e.location, e.occurred_at, e.sort_order
  FROM public.shipment_events e
  JOIN public.shipments s ON s.id = e.shipment_id
  WHERE s.tracking_number = p_tracking
  ORDER BY e.sort_order ASC, e.occurred_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_shipment_events_by_tracking(text) TO anon, authenticated;

-- Fix 3: Stop exposing reviewer email on the public reviews feed.
-- Drop the broad public SELECT and replace with a view that omits the email.
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;

CREATE OR REPLACE VIEW public.public_reviews
WITH (security_invoker = true) AS
SELECT
  id,
  name,
  rating,
  content,
  role,
  approved_at,
  created_at
FROM public.reviews
WHERE status = 'approved';

GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- Allow authenticated users to read approved reviews from the base table too,
-- but ONLY through a narrowed policy that does not leak email when read via
-- the view. The view above is the recommended public surface; for any direct
-- reads we keep authors and admins' existing policies and grant nothing else.
-- (No new SELECT policy on public.reviews here — only the existing
-- "Users can view own reviews" and "Admins can manage reviews" remain.)

-- Fix 4: Set search_path on existing trigger function flagged by the linter.
CREATE OR REPLACE FUNCTION public.set_reviews_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
