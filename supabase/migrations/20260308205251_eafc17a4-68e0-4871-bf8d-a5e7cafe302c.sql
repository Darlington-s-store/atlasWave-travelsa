
-- Fix consultations policies: drop restrictive, create permissive
DROP POLICY IF EXISTS "Users can read own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can insert own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can update own consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins can read all consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins can update all consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins can insert consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admins can delete consultations" ON public.consultations;

CREATE POLICY "Users can read own consultations" ON public.consultations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own consultations" ON public.consultations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own consultations" ON public.consultations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can read all consultations" ON public.consultations FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all consultations" ON public.consultations FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert consultations" ON public.consultations FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete consultations" ON public.consultations FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix applications policies
DROP POLICY IF EXISTS "Users can read own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON public.applications;
DROP POLICY IF EXISTS "Users can update own applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can read all applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can update all applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can insert applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can delete applications" ON public.applications;

CREATE POLICY "Users can read own applications" ON public.applications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own applications" ON public.applications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can read all applications" ON public.applications FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all applications" ON public.applications FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert applications" ON public.applications FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete applications" ON public.applications FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix bookings policies
DROP POLICY IF EXISTS "Users can read own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can read all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;

CREATE POLICY "Users can read own bookings" ON public.bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own bookings" ON public.bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can read all bookings" ON public.bookings FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all bookings" ON public.bookings FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert bookings" ON public.bookings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete bookings" ON public.bookings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix payments policies
DROP POLICY IF EXISTS "Users can read own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can read all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can delete payments" ON public.payments;

CREATE POLICY "Users can read own payments" ON public.payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can read all payments" ON public.payments FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all payments" ON public.payments FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert payments" ON public.payments FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete payments" ON public.payments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix documents policies
DROP POLICY IF EXISTS "Users can read own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can read all documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON public.documents;

CREATE POLICY "Users can read own documents" ON public.documents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Admins can read all documents" ON public.documents FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete documents" ON public.documents FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix shipments policies
DROP POLICY IF EXISTS "Users can read own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Users can insert own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Admins can read all shipments" ON public.shipments;
DROP POLICY IF EXISTS "Admins can update all shipments" ON public.shipments;
DROP POLICY IF EXISTS "Anyone can read shipments by tracking number" ON public.shipments;
DROP POLICY IF EXISTS "Admins can insert shipments" ON public.shipments;
DROP POLICY IF EXISTS "Admins can delete shipments" ON public.shipments;

CREATE POLICY "Users can read own shipments" ON public.shipments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own shipments" ON public.shipments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can read all shipments" ON public.shipments FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all shipments" ON public.shipments FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can read shipments by tracking number" ON public.shipments FOR SELECT USING (true);
CREATE POLICY "Admins can insert shipments" ON public.shipments FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete shipments" ON public.shipments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix user_roles policies
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
