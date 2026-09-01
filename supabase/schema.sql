-- Esquema del formulario de contingencia.
-- Ejecutar en el SQL Editor de Supabase. Es idempotente.
--
-- ATENCIÓN: el primer bloque elimina las tablas del esquema anterior en español.
-- El bucket 'evidencias' hay que borrarlo desde Storage en el dashboard: Postgres
-- no permite eliminar buckets ni objetos por SQL.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.crear_perfil();
drop table if exists public.pedidos_contingencia;
drop table if exists public.perfiles;

drop policy if exists "evidencias_subida_propia" on storage.objects;
drop policy if exists "evidencias_actualizacion_propia" on storage.objects;
drop policy if exists "evidencias_lectura_propia" on storage.objects;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text not null default 'Transportista',
  zone text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, zone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'Transportista'),
    coalesce(new.raw_user_meta_data ->> 'zone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.contingency_orders (
  id uuid primary key,
  order_number text not null,
  customer text not null,
  address text not null,
  result text not null check (result in ('delivered', 'failed')),
  reason text,
  comment text,
  recorded_at timestamptz not null,
  queued_at timestamptz not null,
  user_id uuid not null references auth.users (id),
  user_name text not null,
  photo_paths text[] not null default '{}',
  synced_at timestamptz not null default now()
);

-- Migración desde la versión de una sola foto.
alter table public.contingency_orders drop column if exists photo_path;
alter table public.contingency_orders add column if not exists photo_paths text[] not null default '{}';

create index if not exists contingency_orders_user_idx
  on public.contingency_orders (user_id, recorded_at desc);

create index if not exists contingency_orders_number_idx
  on public.contingency_orders (order_number);

alter table public.contingency_orders enable row level security;

drop policy if exists "contingency_orders_select_own" on public.contingency_orders;
create policy "contingency_orders_select_own" on public.contingency_orders
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "contingency_orders_insert_own" on public.contingency_orders;
create policy "contingency_orders_insert_own" on public.contingency_orders
  for insert to authenticated with check (auth.uid() = user_id);

-- Necesaria para que el reintento de la cola use upsert sin duplicar.
drop policy if exists "contingency_orders_update_own" on public.contingency_orders;
create policy "contingency_orders_update_own" on public.contingency_orders
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

drop policy if exists "evidence_insert_own" on storage.objects;
create policy "evidence_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "evidence_update_own" on storage.objects;
create policy "evidence_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "evidence_select_own" on storage.objects;
create policy "evidence_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'evidence' and (storage.foldername(name))[1] = auth.uid()::text);
