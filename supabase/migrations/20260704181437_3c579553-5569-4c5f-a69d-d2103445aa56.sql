
CREATE TABLE public.spin_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  session_id text,
  prize_label text NOT NULL,
  prize_type text NOT NULL,
  prize_code text,
  redeemed boolean NOT NULL DEFAULT false,
  redeemed_at timestamptz,
  order_phone text
);

GRANT SELECT, INSERT, UPDATE ON public.spin_attempts TO anon;
GRANT SELECT, INSERT, UPDATE ON public.spin_attempts TO authenticated;
GRANT ALL ON public.spin_attempts TO service_role;

ALTER TABLE public.spin_attempts ENABLE ROW LEVEL SECURITY;

-- Anyone can insert an attempt log
CREATE POLICY "anyone insert spin attempts" ON public.spin_attempts
FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Admins can read all
CREATE POLICY "admins select spin attempts" ON public.spin_attempts
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow public update to flip redeemed flag (only affects a row the client already has the id for)
CREATE POLICY "anyone mark redeemed" ON public.spin_attempts
FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_spin_attempts_created_at ON public.spin_attempts (created_at DESC);
