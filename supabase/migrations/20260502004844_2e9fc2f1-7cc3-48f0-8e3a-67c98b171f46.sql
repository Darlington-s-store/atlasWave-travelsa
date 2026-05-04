
-- Notifications table for in-app bell (users + admins)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  audience text NOT NULL DEFAULT 'user' CHECK (audience IN ('user','admin','all')),
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  link text,
  read boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_audience ON public.notifications(audience);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert notifications targeted at admin or themselves
CREATE POLICY "Anyone can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (
    (audience = 'all') OR
    (audience = 'user' AND user_id = auth.uid()) OR
    (audience = 'admin' AND public.has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (
    (audience = 'user' AND user_id = auth.uid()) OR
    (audience = 'admin' AND public.has_role(auth.uid(), 'admin'::app_role)) OR
    (audience = 'all')
  );

CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- App settings (maintenance mode etc.)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NULL
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app settings"
  ON public.app_settings FOR SELECT USING (true);

CREATE POLICY "Admins can insert app settings"
  ON public.app_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update app settings"
  ON public.app_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.app_settings(key, value)
VALUES ('maintenance_mode', '{"enabled": false, "message": "We are performing scheduled maintenance. Please check back shortly."}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Reply columns on contact_messages
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS reply text,
  ADD COLUMN IF NOT EXISTS replied_at timestamptz NULL;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Trigger: on new contact_messages, create admin notification
CREATE OR REPLACE FUNCTION public.notify_admin_on_contact_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (audience, title, body, type, link, metadata)
  VALUES (
    'admin',
    'New contact message from ' || COALESCE(NEW.name, 'Visitor'),
    LEFT(COALESCE(NEW.subject, '') || ' — ' || COALESCE(NEW.message, ''), 240),
    'inquiry',
    '/admin/messages',
    jsonb_build_object('contact_id', NEW.id, 'email', NEW.email)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_on_contact_message ON public.contact_messages;
CREATE TRIGGER trg_notify_admin_on_contact_message
AFTER INSERT ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_on_contact_message();

-- Trigger: on new bookings, notify admins
CREATE OR REPLACE FUNCTION public.notify_admin_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (audience, title, body, type, link, metadata)
  VALUES (
    'admin',
    'New ' || COALESCE(NEW.type, 'booking') || ' booking',
    COALESCE(NEW.route, '') || ' — ' || COALESCE(NEW.date, ''),
    'booking',
    CASE WHEN NEW.type = 'flight' THEN '/admin/flights'
         WHEN NEW.type = 'hotel' THEN '/admin/hotels'
         ELSE '/admin/applications' END,
    jsonb_build_object('booking_id', NEW.id, 'user_id', NEW.user_id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_on_booking ON public.bookings;
CREATE TRIGGER trg_notify_admin_on_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_on_booking();

-- Trigger: on new applications, notify admins
CREATE OR REPLACE FUNCTION public.notify_admin_on_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (audience, title, body, type, link, metadata)
  VALUES (
    'admin',
    'New ' || COALESCE(NEW.type, 'application'),
    COALESCE(NEW.title, ''),
    'application',
    '/admin/applications',
    jsonb_build_object('application_id', NEW.id, 'user_id', NEW.user_id)
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_on_application ON public.applications;
CREATE TRIGGER trg_notify_admin_on_application
AFTER INSERT ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_on_application();

-- Trigger: on new user signup (profile insert), notify admins + welcome user
CREATE OR REPLACE FUNCTION public.notify_on_new_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Welcome the user
  INSERT INTO public.notifications (audience, user_id, title, body, type, link)
  VALUES ('user', NEW.id, 'Welcome to AtlasWave 👋', 'Your account is ready. Explore travel, visas, and more from your dashboard.', 'success', '/dashboard');

  -- Tell admins
  INSERT INTO public.notifications (audience, title, body, type, link, metadata)
  VALUES ('admin', 'New user registered', COALESCE(NEW.full_name, 'New user') || ' just created an account.', 'user', '/admin/users',
    jsonb_build_object('user_id', NEW.id));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_new_profile ON public.profiles;
CREATE TRIGGER trg_notify_on_new_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_profile();
