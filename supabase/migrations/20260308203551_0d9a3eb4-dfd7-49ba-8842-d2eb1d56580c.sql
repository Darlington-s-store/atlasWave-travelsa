
-- Create documents table for user document uploads
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  file_type text NOT NULL DEFAULT 'PDF',
  file_size text,
  file_path text,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Users can CRUD own documents
CREATE POLICY "Users can read own documents" ON public.documents FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Admins can read all documents
CREATE POLICY "Admins can read all documents" ON public.documents FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete documents" ON public.documents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add user_id policies for bookings so users can insert
-- (already have admin policies, need user update)
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (user_id = auth.uid());
