
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent','fixed')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO service_role;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read coupons for validation"
  ON public.coupons FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION public.redeem_coupon(_code TEXT)
RETURNS TABLE(ok BOOLEAN, message TEXT, discount_type TEXT, discount_value NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.coupons%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE upper(code) = upper(_code) LIMIT 1;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'كوبون غير صحيح', NULL::TEXT, NULL::NUMERIC; RETURN;
  END IF;
  IF NOT c.active THEN
    RETURN QUERY SELECT false, 'الكوبون غير مفعل', NULL::TEXT, NULL::NUMERIC; RETURN;
  END IF;
  IF c.used_count >= c.max_uses THEN
    RETURN QUERY SELECT false, 'انتهت صلاحية الكوبون', NULL::TEXT, NULL::NUMERIC; RETURN;
  END IF;
  UPDATE public.coupons SET used_count = used_count + 1, updated_at = now() WHERE id = c.id;
  RETURN QUERY SELECT true, 'تم تطبيق الكوبون', c.discount_type, c.discount_value;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_coupon(_code TEXT)
RETURNS TABLE(ok BOOLEAN, message TEXT, discount_type TEXT, discount_value NUMERIC)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.coupons%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE upper(code) = upper(_code) LIMIT 1;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'كوبون غير صحيح', NULL::TEXT, NULL::NUMERIC; RETURN;
  END IF;
  IF NOT c.active THEN
    RETURN QUERY SELECT false, 'الكوبون غير مفعل', NULL::TEXT, NULL::NUMERIC; RETURN;
  END IF;
  IF c.used_count >= c.max_uses THEN
    RETURN QUERY SELECT false, 'انتهت صلاحية الكوبون', NULL::TEXT, NULL::NUMERIC; RETURN;
  END IF;
  RETURN QUERY SELECT true, 'كوبون صالح', c.discount_type, c.discount_value;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_coupon(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_coupon(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER coupons_set_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount NUMERIC NOT NULL DEFAULT 0;
