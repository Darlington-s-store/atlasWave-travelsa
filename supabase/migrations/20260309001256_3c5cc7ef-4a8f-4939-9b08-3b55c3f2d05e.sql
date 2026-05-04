-- Fix consultations RLS policies: change from RESTRICTIVE to PERMISSIVE

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can read own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can insert own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can update own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins can read all consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins can update all consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins can insert consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins can delete consultations" ON public.consultations;

-- Recreate as PERMISSIVE policies (default behavior, allows OR logic)
CREATE POLICY "Users can read own consultations"
  ON public.consultations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own consultations"
  ON public.consultations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all consultations"
  ON public.consultations FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all consultations"
  ON public.consultations FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete consultations"
  ON public.consultations FOR DELETE
  USING (has_role(auth.uid(), 'admin'));