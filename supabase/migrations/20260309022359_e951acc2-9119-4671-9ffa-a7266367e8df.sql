
DROP POLICY "Anyone can read visible videos" ON public.videos;
CREATE POLICY "Anyone can read visible videos"
  ON public.videos FOR SELECT
  USING (visible = true);

DROP POLICY "Admins can manage videos" ON public.videos;
CREATE POLICY "Admins can manage videos"
  ON public.videos FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
