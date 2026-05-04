-- Enable realtime updates for notifications and related admin inbox tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'contact_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
  END IF;
END $$;

ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.contact_messages REPLICA IDENTITY FULL;

-- Attach missing triggers to the functions already present in the database
DROP TRIGGER IF EXISTS notify_admin_on_contact_message_trigger ON public.contact_messages;
CREATE TRIGGER notify_admin_on_contact_message_trigger
AFTER INSERT ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_on_contact_message();

DROP TRIGGER IF EXISTS notify_admin_on_booking_trigger ON public.bookings;
CREATE TRIGGER notify_admin_on_booking_trigger
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_on_booking();

DROP TRIGGER IF EXISTS notify_admin_on_application_trigger ON public.applications;
CREATE TRIGGER notify_admin_on_application_trigger
AFTER INSERT ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_on_application();

DROP TRIGGER IF EXISTS notify_on_new_profile_trigger ON public.profiles;
CREATE TRIGGER notify_on_new_profile_trigger
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_profile();