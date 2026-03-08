
-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS on user_roles: only admins can read roles
CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies on profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies on applications
CREATE POLICY "Admins can read all applications"
  ON public.applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all applications"
  ON public.applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies on bookings
CREATE POLICY "Admins can read all bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies on shipments
CREATE POLICY "Admins can read all shipments"
  ON public.shipments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all shipments"
  ON public.shipments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies on payments
CREATE POLICY "Admins can read all payments"
  ON public.payments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Consultations table
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  topic TEXT,
  duration INTEGER NOT NULL DEFAULT 45,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'GMT+0',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  price NUMERIC(10,2) NOT NULL,
  notes TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own consultations"
  ON public.consultations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own consultations"
  ON public.consultations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own consultations"
  ON public.consultations FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all consultations"
  ON public.consultations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all consultations"
  ON public.consultations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Make shipments publicly readable by tracking number (for guest tracking)
CREATE POLICY "Anyone can read shipments by tracking number"
  ON public.shipments FOR SELECT TO anon
  USING (true);
