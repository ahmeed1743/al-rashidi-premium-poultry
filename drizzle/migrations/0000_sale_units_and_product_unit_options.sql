CREATE TABLE public.sale_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  display_format text,
  unit_kind text NOT NULL DEFAULT 'other' CHECK (unit_kind IN ('weight', 'count', 'other')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sale_units_name_nonempty CHECK (length(btrim(name_ar)) > 0)
);
GRANT SELECT ON public.sale_units TO anon, authenticated;
GRANT INSERT, UPDATE ON public.sale_units TO authenticated;
GRANT ALL ON public.sale_units TO service_role;
ALTER TABLE public.sale_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "active sale units are public" ON public.sale_units FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "admins view all sale units" ON public.sale_units FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins insert sale units" ON public.sale_units FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update sale units" ON public.sale_units FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE UNIQUE INDEX sale_units_name_ar_unique ON public.sale_units (lower(btrim(name_ar)));
CREATE TRIGGER sale_units_updated_at BEFORE UPDATE ON public.sale_units FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_sale_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  unit_id uuid NOT NULL REFERENCES public.sale_units(id) ON DELETE RESTRICT,
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_sale_units_product_unit_unique UNIQUE (product_id, unit_id)
);
GRANT SELECT ON public.product_sale_units TO anon, authenticated;
GRANT INSERT, UPDATE ON public.product_sale_units TO authenticated;
GRANT ALL ON public.product_sale_units TO service_role;
ALTER TABLE public.product_sale_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "active product sale units are public" ON public.product_sale_units FOR SELECT TO anon, authenticated USING (
  is_active
  AND EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.sale_units u ON u.id = product_sale_units.unit_id
    WHERE p.id = product_sale_units.product_id AND p.is_active AND u.is_active
  )
);
CREATE POLICY "admins view all product sale units" ON public.product_sale_units FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins insert product sale units" ON public.product_sale_units FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update product sale units" ON public.product_sale_units FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE UNIQUE INDEX product_sale_units_single_default ON public.product_sale_units (product_id) WHERE is_default AND is_active;
CREATE INDEX product_sale_units_product_idx ON public.product_sale_units (product_id, is_active);
CREATE TRIGGER product_sale_units_updated_at BEFORE UPDATE ON public.product_sale_units FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();