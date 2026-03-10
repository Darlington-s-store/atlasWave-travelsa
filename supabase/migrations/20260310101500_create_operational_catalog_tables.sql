CREATE TABLE public.flight_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airline text NOT NULL,
  logo text,
  origin text NOT NULL,
  destination text NOT NULL,
  departure_time text NOT NULL,
  arrival_time text NOT NULL,
  duration text NOT NULL,
  stops integer NOT NULL DEFAULT 0,
  stop_city text,
  price numeric NOT NULL,
  cabin text NOT NULL DEFAULT 'Economy',
  baggage text,
  refundable boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.flight_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active flight offers"
  ON public.flight_offers FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage flight offers"
  ON public.flight_offers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.hotel_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  rating integer NOT NULL DEFAULT 4,
  reviews integer NOT NULL DEFAULT 0,
  price numeric NOT NULL,
  original_price numeric,
  amenities text[] NOT NULL DEFAULT '{}',
  room_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hotel_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active hotel offers"
  ON public.hotel_offers FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage hotel offers"
  ON public.hotel_offers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status text NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shipment events"
  ON public.shipment_events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage shipment events"
  ON public.shipment_events FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  refund_id text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  email text NOT NULL,
  phone text,
  service text NOT NULL,
  original_amount numeric NOT NULL DEFAULT 0,
  refund_amount numeric NOT NULL DEFAULT 0,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  method text NOT NULL,
  transaction_reference text,
  admin_note text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own refund requests"
  ON public.refund_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own refund requests"
  ON public.refund_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage refund requests"
  ON public.refund_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
