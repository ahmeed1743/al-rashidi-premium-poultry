
-- Admin RLS policies for coupons table
CREATE POLICY "admins insert coupons" ON public.coupons
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update coupons" ON public.coupons
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete coupons" ON public.coupons
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
