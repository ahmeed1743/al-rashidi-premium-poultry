
-- Roles enum + table + has_role function
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users see own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "admins manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Products table
create table public.products (
  id text primary key,
  name text not null,
  description text not null default '',
  price numeric not null default 0,
  old_price numeric,
  image_url text not null default '',
  category text not null,
  badge text,
  customization text not null default 'none',
  note text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;

create policy "anyone can view active products" on public.products
  for select using (is_active = true);
create policy "admins view all products" on public.products
  for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins insert products" on public.products
  for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admins update products" on public.products
  for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins delete products" on public.products
  for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- Storage bucket for product images
insert into storage.buckets (id, name, public) values ('product-images','product-images', true)
  on conflict (id) do nothing;

create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "admins upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "admins update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "admins delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));

-- Seed products (image_url left empty; the frontend will fall back to bundled assets via id mapping)
insert into public.products (id,name,description,price,old_price,image_url,category,badge,customization,note,sort_order) values
('white-chicken','فراخ بيضاء طازجة','فراخ بيضاء فريش، نظافة تامة وجودة ممتازة.',95,null,'','white',null,'size-cut',null,10),
('baladi-chicken','فراخ بلدي','فراخ بلدي مذاق أصلي وطعم لا يُقاوم.',165,null,'','baladi',null,'size-cut',null,20),
('baladi-hor','بلدي حر','بلدي حر صغير، طعم تقليدي وأصيل.',220,null,'','baladi-hor',null,'baladi-hor',null,30),
('rabbit','أرانب طازجة','أرانب طازجة مختارة بعناية.',240,null,'','rabbit',null,'size-cut',null,40),
('duck','بط فلاحي / مسكوفي','بط طازج بأنواعه، فلاحي ومسكوفي.',280,null,'','duck',null,'duck',null,50),
('turkey','رومي طازج','رومي طازج بحجم مميز.',230,null,'','turkey',null,'cut-only',null,60),
('breast-bone','صدور بالعظم','صدور بالعظم — أبيض أو بلدي.',110,null,'','breast-bone',null,'type-cut','الطلب بالعدد',70),
('thigh-bone','وراك بالعظم','وراك بالعظم — أبيض أو بلدي.',105,null,'','thigh-bone',null,'type-cut-simple',null,80),
('thigh-turkey','وراك رومي','وراك رومي طازج وممتاز.',260,null,'','thigh-turkey',null,'cut-only','الطلب بالعدد - وزن الورك من 1.5 كيلو إلى 2 كيلو',90),
('rosto-turkey','روستو رومي','روستو رومي مميز للشوي.',270,null,'','rosto-turkey',null,'cut-only','الطلب بالعدد - الوزن من 1.5 كيلو إلى 2 كيلو',100),
('duck-cubes','مكعبات بط','مكعبات بط جاهزة للطبخ.',320,null,'','duck-cubes',null,'none','ميكس صدور ووراك',110),
('turkey-cubes','مكعبات رومي','مكعبات رومي جاهزة للطبخ.',290,null,'','turkey-cubes',null,'none','ميكس صدور ووراك',120),
('marinated-shawerma','متبل شاورما','صدور دجاج متبلة شاورما بنكهة مميزة.',145,null,'','marinated',null,'none',null,130),
('marinated-grill','متبل مشوي','قطع دجاج متبلة جاهزة للشواء.',140,null,'','marinated',null,'none',null,140),
('offer-family','عرض العيلة','فرختين بيضاء + كيلو متبل + توابل مجانية.',280,340,'','offers','وفّر 60ج','none',null,150),
('meal-grill','واجبة ربع مشوي','ربع فرخة مشوية + أرز + سلطة + خبز.',95,null,'','meals',null,'none',null,160),
('meal-half','واجبة نص فرخة','نص فرخة مشوية + أرز + سلطة + خبز + مشروب.',165,null,'','meals',null,'none',null,170);
