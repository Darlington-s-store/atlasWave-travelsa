ALTER TABLE public.application_documents
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid,
  ADD COLUMN IF NOT EXISTS admin_note text;

-- status already defaults to 'uploaded'; allowed values: uploaded | verified | rejected