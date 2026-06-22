-- ZEIB SHOES Supabase schema
-- TODO: Run this in Supabase SQL Editor after creating the project.
-- TODO: Review RLS policies before production launch.

create extension if not exists "pgcrypto";

create table if not exists public.customers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  category_id uuid references public.categories(id),
  price numeric(12, 2) not null check (price >= 0),
  old_price numeric(12, 2) check (old_price >= 0),
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  is_new boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist (
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_address text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled')),
  total numeric(12, 2) not null check (total >= 0),
  whatsapp_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  size text not null,
  color text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (customer_id, product_id, size, color)
);

alter table public.customers enable row level security;
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where admin_users.id = auth.uid()
  );
$$;

create policy "Public can read active products" on public.products
for select using (active = true);

create policy "Public can read categories" on public.categories
for select using (true);

create policy "Public can read product images" on public.product_images
for select using (true);

create policy "Public can read approved reviews" on public.reviews
for select using (approved = true);

create policy "Customers can manage their own profile" on public.customers
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Customers can manage their wishlist" on public.wishlist
for all using (auth.uid() = customer_id) with check (auth.uid() = customer_id);

create policy "Customers can manage their cart" on public.cart_items
for all using (auth.uid() = customer_id) with check (auth.uid() = customer_id);

create policy "Customers can create reviews" on public.reviews
for insert with check (auth.uid() = customer_id);

create policy "Customers can read their orders" on public.orders
for select using (auth.uid() = customer_id);

create policy "Customers can read their order items" on public.order_items
for select using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.customer_id = auth.uid()
  )
);

create policy "Admins manage products" on public.products
for all using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage product images" on public.product_images
for all using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage orders" on public.orders
for all using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage order items" on public.order_items
for all using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage reviews" on public.reviews
for all using (public.is_admin()) with check (public.is_admin());

insert into public.categories (name, slug)
values
  ('Slippers', 'slippers'),
  ('Slides', 'slides'),
  ('Sandals', 'sandals'),
  ('Shoes', 'shoes')
on conflict (slug) do nothing;

-- TODO: Create a Supabase Storage bucket named product-images, or configure Cloudinary upload signatures.
-- TODO: Add an auth trigger to copy auth.users metadata into public.customers on signup.
