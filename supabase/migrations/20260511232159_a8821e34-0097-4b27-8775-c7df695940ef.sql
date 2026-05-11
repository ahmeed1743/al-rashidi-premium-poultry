
-- Extend products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS customization_config jsonb,
  ADD COLUMN IF NOT EXISTS pair_unit boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS subcategory text;

-- Saved addresses (by phone, no auth)
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  customer_name text,
  region text,
  street text,
  floor_apt text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read addresses" ON public.customer_addresses FOR SELECT USING (true);
CREATE POLICY "anyone insert addresses" ON public.customer_addresses FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone update addresses" ON public.customer_addresses FOR UPDATE USING (true) WITH CHECK (true);

CREATE TRIGGER customer_addresses_updated_at
  BEFORE UPDATE ON public.customer_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  customer_name text,
  mode text NOT NULL,                  -- 'delivery' | 'pickup'
  region text,
  street text,
  floor_apt text,
  branch text,                         -- pickup branch
  time_slot text,                      -- e.g. 'asap' | '11:00 ص' ...
  items jsonb NOT NULL,                -- array of {name, qty, options, notes, price, total}
  total numeric NOT NULL DEFAULT 0,
  notes text,
  whatsapp_number text,                -- which number was used
  status text NOT NULL DEFAULT 'new',  -- new | confirmed | done | cancelled
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "admins view orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete orders" ON public.orders FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_phone_idx ON public.orders (phone);

-- Visit events
CREATE TABLE IF NOT EXISTS public.visit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.visit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone insert visits" ON public.visit_events FOR INSERT WITH CHECK (true);
CREATE POLICY "admins view visits" ON public.visit_events FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS visit_events_created_at_idx ON public.visit_events (created_at DESC);
CREATE INDEX IF NOT EXISTS visit_events_path_idx ON public.visit_events (path);
