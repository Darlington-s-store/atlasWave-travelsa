
-- Migration: Add specialized visa application fields to the applications table
-- This allows for better filtering and reporting in the admin dashboard

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS sponsor text,
  ADD COLUMN IF NOT EXISTS bank_balance text,
  ADD COLUMN IF NOT EXISTS income_source text,
  ADD COLUMN IF NOT EXISTS previous_refusals text,
  ADD COLUMN IF NOT EXISTS criminal_history text,
  ADD COLUMN IF NOT EXISTS immigration_violations text,
  ADD COLUMN IF NOT EXISTS health_issues text,
  ADD COLUMN IF NOT EXISTS duration_of_stay text,
  ADD COLUMN IF NOT EXISTS accommodation_address text;

-- Add comment to explain the purpose of these columns
COMMENT ON COLUMN public.applications.sponsor IS 'Trip sponsor details from multi-step visa form';
COMMENT ON COLUMN public.applications.bank_balance IS 'Self-reported bank balance from visa form';
COMMENT ON COLUMN public.applications.income_source IS 'Reported source of income';
COMMENT ON COLUMN public.applications.previous_refusals IS 'Yes/No for previous visa refusals';
COMMENT ON COLUMN public.applications.criminal_history IS 'Security check response for criminal history';
COMMENT ON COLUMN public.applications.immigration_violations IS 'Security check response for immigration violations';
COMMENT ON COLUMN public.applications.health_issues IS 'Security check response for serious health issues';
