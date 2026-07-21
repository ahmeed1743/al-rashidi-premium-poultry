
ALTER TABLE public.spin_attempts
  ADD COLUMN IF NOT EXISTS device_id text,
  ADD COLUMN IF NOT EXISTS cart_total numeric,
  ADD COLUMN IF NOT EXISTS cooldown_end timestamptz;

CREATE INDEX IF NOT EXISTS idx_spin_attempts_device_id ON public.spin_attempts(device_id);
CREATE INDEX IF NOT EXISTS idx_spin_attempts_phone ON public.spin_attempts(order_phone);

-- Allow anyone to read their own spin attempts by device/phone for cooldown checks
DROP POLICY IF EXISTS "anon read for cooldown" ON public.spin_attempts;
CREATE POLICY "anon read for cooldown"
  ON public.spin_attempts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin delete
DROP POLICY IF EXISTS "admins delete spin attempts" ON public.spin_attempts;
CREATE POLICY "admins delete spin attempts"
  ON public.spin_attempts FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.spin_attempts TO anon, authenticated;
GRANT ALL ON public.spin_attempts TO service_role;
