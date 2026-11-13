-- BAZARIYAA products in Supabase.
-- Run once in Supabase > SQL Editor > New query > paste > Run.
-- The admin email appears 6 times below. Change all 6 if the shop account uses a different email.

create table if not exists public.products (
  id            text primary key,
  position      integer,
  name          text not null,
  name_hi       text default '',
  name_gu       text default '',
  description   text default '',
  category      text default '',
  base_price    numeric,
  price         numeric not null default 0,
  images        text[] not null default '{}',
  in_stock      boolean not null default true,
  popular       boolean not null default false,
  most_ordered  integer,
  updated_at    timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

alter table public.products enable row level security;

-- Anyone can read the catalogue.
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select to anon, authenticated using (true);

-- Only the shop's admin account can add, change or delete.
drop policy if exists "owner writes products" on public.products;
create policy "owner writes products" on public.products
  for all to authenticated
  using (lower(auth.jwt() ->> 'email') = 'bazariyaasurat@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'bazariyaasurat@gmail.com');

-- Product photos: public to view, only the admin can upload or remove.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "owner uploads photos" on storage.objects;
create policy "owner uploads photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = 'bazariyaasurat@gmail.com');

drop policy if exists "owner changes photos" on storage.objects;
create policy "owner changes photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = 'bazariyaasurat@gmail.com');

drop policy if exists "owner deletes photos" on storage.objects;
create policy "owner deletes photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = 'bazariyaasurat@gmail.com');

drop policy if exists "owner reads photo list" on storage.objects;
create policy "owner reads photo list" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images' and lower(auth.jwt() ->> 'email') = 'bazariyaasurat@gmail.com');
