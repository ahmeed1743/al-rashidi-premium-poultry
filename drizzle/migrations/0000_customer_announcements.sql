CREATE TABLE public.customer_announcements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL DEFAULT '',
 body text NOT NULL DEFAULT '',
 is_active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.customer_announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_announcements TO authenticated;
GRANT ALL ON public.customer_announcements TO service_role;
ALTER TABLE public.customer_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public active announcements" ON public.customer_announcements FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Admins manage announcements" ON public.customer_announcements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX customer_announcements_created_at_idx ON public.customer_announcements(created_at DESC);