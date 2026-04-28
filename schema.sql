-- Home Organizer - Schemat bazy danych
-- Wklej w SQL Editor swojego projektu Supabase

create extension if not exists "pgcrypto";

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'Box',
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  name text not null,
  quantity numeric not null default 0,
  unit text not null default 'szt',
  total_capacity numeric,
  type text not null default 'count', -- 'count' | 'weight' | 'liquid'
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists items_location_id_idx on public.items(location_id);

-- Aplikacja jest prywatna i u\u017cywa anon key. W\u0142\u0105czamy RLS i otwieramy dost\u0119p anon.
alter table public.locations enable row level security;
alter table public.items enable row level security;

drop policy if exists "anon all locations" on public.locations;
create policy "anon all locations" on public.locations
  for all using (true) with check (true);

drop policy if exists "anon all items" on public.items;
create policy "anon all items" on public.items
  for all using (true) with check (true);
