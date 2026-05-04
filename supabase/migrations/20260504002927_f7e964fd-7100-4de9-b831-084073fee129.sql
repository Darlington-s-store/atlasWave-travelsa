
-- 1. Expand applications table
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS reference_number text UNIQUE,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS passport_number text,
  ADD COLUMN IF NOT EXISTS passport_expiry date,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS destination_country text,
  ADD COLUMN IF NOT EXISTS intended_travel_date date,
  ADD COLUMN IF NOT EXISTS return_date date,
  ADD COLUMN IF NOT EXISTS purpose text,
  ADD COLUMN IF NOT EXISTS employer text,
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS fee_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

-- 2. Sequence + trigger for reference numbers
CREATE SEQUENCE IF NOT EXISTS public.application_ref_seq START 1;

CREATE OR REPLACE FUNCTION public.set_application_reference()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.reference_number IS NULL THEN
    NEW.reference_number := 'AW-' || to_char(now(), 'YYYY') || '-' || LPAD(nextval('public.application_ref_seq')::text, 6, '0');
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_applications_reference ON public.applications;
CREATE TRIGGER trg_applications_reference
BEFORE INSERT OR UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.set_application_reference();

-- 3. Application documents table
CREATE TABLE IF NOT EXISTS public.application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  doc_type text NOT NULL,
  label text,
  file_path text NOT NULL,
  file_name text,
  file_size integer,
  mime_type text,
  status text NOT NULL DEFAULT 'uploaded',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own application documents"
ON public.application_documents FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own application documents"
ON public.application_documents FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own application documents"
ON public.application_documents FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all application documents"
ON public.application_documents FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Storage bucket for application documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own application docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'application-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own application docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'application-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own application docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'application-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all application docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'application-documents'
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete all application docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'application-documents'
  AND has_role(auth.uid(), 'admin'::app_role)
);
