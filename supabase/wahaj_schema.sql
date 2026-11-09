-- WAHAJ | وهج — Supabase / PostgreSQL schema
-- Run in Supabase SQL Editor. All visitor writes go through server routes (service role).

create extension if not exists "pgcrypto";

-- Enums
create type bazaar_status as enum ('upcoming','active','ended');
create type booth_status  as enum ('available','reserved','occupied');
create type rent_status   as enum ('unpaid','partial','paid');

-- Admins (linked to Supabase Auth users; OTP login via Supabase Auth)
create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  contact text,
  created_at timestamptz default now()
);

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from admins where id = auth.uid()) $$;

create table bazaars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  location text,
  starts_on date not null,
  ends_on date not null,
  status bazaar_status not null default 'upcoming',
  is_archived boolean not null default false,
  created_at timestamptz default now(),
  check (ends_on >= starts_on)
);

create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  activity text,
  phone text,
  email text,
  instagram text,
  created_at timestamptz default now()
);

create table booths (
  id uuid primary key default gen_random_uuid(),
  bazaar_id uuid not null references bazaars(id) on delete cascade,
  store_id uuid references stores(id) on delete set null,
  number text not null,
  name text,
  status booth_status not null default 'available',
  rent_amount numeric(10,2),
  rent_status rent_status not null default 'unpaid',
  created_at timestamptz default now(),
  unique (bazaar_id, number),
  unique (bazaar_id, store_id)
);

create table qr_codes (
  id uuid primary key default gen_random_uuid(),
  bazaar_id uuid not null unique references bazaars(id) on delete cascade,
  code text not null unique default encode(gen_random_bytes(6),'hex'),
  created_at timestamptz default now()
);

-- Anonymous visitors / sessions / events
create table visitors (
  id uuid primary key default gen_random_uuid(),
  anon_id text not null unique,          -- random client id, no personal data
  first_seen timestamptz default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null references visitors(id) on delete cascade,
  bazaar_id uuid references bazaars(id) on delete set null,
  source text not null default 'direct' check (source in ('qr','direct')),
  is_bot boolean not null default false,
  started_at timestamptz default now(),
  last_seen_at timestamptz default now()
);

create table page_views (
  id bigserial primary key,
  session_id uuid not null references sessions(id) on delete cascade,
  bazaar_id uuid references bazaars(id) on delete set null,
  store_id uuid references stores(id) on delete set null,
  path text not null,
  created_at timestamptz default now()
);

create table interactions (
  id bigserial primary key,
  session_id uuid not null references sessions(id) on delete cascade,
  bazaar_id uuid references bazaars(id) on delete set null,
  store_id uuid references stores(id) on delete set null,
  type text not null check (type in
    ('select_store','view_rating_page','start_form','submit_rating')),
  created_at timestamptz default now()
);

-- Ratings
create table store_ratings (
  id uuid primary key default gen_random_uuid(),
  bazaar_id uuid not null references bazaars(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  visitor_id uuid references visitors(id) on delete set null,
  overall smallint not null check (overall between 1 and 5),
  product_quality smallint not null check (product_quality between 1 and 5),
  staff smallint not null check (staff between 1 and 5),
  service smallint not null check (service between 1 and 5),
  organization smallint not null check (organization between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  created_at timestamptz default now(),
  unique (bazaar_id, store_id, visitor_id)   -- one rating per visitor per store
);

create table visitor_ratings (
  id uuid primary key default gen_random_uuid(),
  bazaar_id uuid not null references bazaars(id) on delete cascade,
  visitor_id uuid references visitors(id) on delete set null,
  organization smallint not null check (organization between 1 and 5),
  store_variety smallint not null check (store_variety between 1 and 5),
  shopping_experience smallint not null check (shopping_experience between 1 and 5),
  location_services smallint not null check (location_services between 1 and 5),
  satisfaction smallint not null check (satisfaction between 1 and 5),
  would_recommend boolean not null,
  suggestions text check (char_length(suggestions) <= 1000),
  created_at timestamptz default now(),
  unique (bazaar_id, visitor_id)
);

-- Indexes
create index on booths (bazaar_id);
create index on booths (store_id);
create index on sessions (bazaar_id, started_at);
create index on sessions (visitor_id);
create index on page_views (session_id);
create index on page_views (bazaar_id, created_at);
create index on interactions (bazaar_id, type, created_at);
create index on store_ratings (store_id);
create index on store_ratings (bazaar_id);
create index on visitor_ratings (bazaar_id);

-- RLS
alter table admins          enable row level security;
alter table bazaars         enable row level security;
alter table stores          enable row level security;
alter table booths          enable row level security;
alter table qr_codes        enable row level security;
alter table visitors        enable row level security;
alter table sessions        enable row level security;
alter table page_views      enable row level security;
alter table interactions    enable row level security;
alter table store_ratings   enable row level security;
alter table visitor_ratings enable row level security;

-- Admin: full access everywhere
do $$
declare t text;
begin
  foreach t in array array['admins','bazaars','stores','booths','qr_codes','visitors',
    'sessions','page_views','interactions','store_ratings','visitor_ratings']
  loop
    execute format('create policy "admin all" on %I for all to authenticated
      using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- Public read: only what the rating pages need (no contact details via booths/bazaars)
create policy "public read bazaars" on bazaars for select to anon
  using (is_archived = false and status in ('active','upcoming'));
create policy "public read booths" on booths for select to anon
  using (store_id is not null and exists
    (select 1 from bazaars b where b.id = bazaar_id and b.status = 'active'));
create policy "public read qr" on qr_codes for select to anon using (true);

-- Public store list via a view exposing name + activity only
create view public_stores as
  select s.id, s.name, s.activity, b.bazaar_id
  from stores s join booths b on b.store_id = s.id
  join bazaars z on z.id = b.bazaar_id and z.status = 'active' and not z.is_archived;
grant select on public_stores to anon;

-- Anonymous visitors have NO direct write access to ratings or analytics.
-- Those inserts happen in Next.js route handlers (service role) after rate-limit/bot checks.

-- Analytics summary (real data, one call per dashboard filter)
create or replace function analytics_summary(p_bazaar uuid, p_from timestamptz, p_to timestamptz)
returns json language sql security definer stable set search_path = public as $$
  with s as (
    select * from sessions
    where not is_bot and started_at between p_from and p_to
      and (p_bazaar is null or bazaar_id = p_bazaar)
  ), i as (
    select * from interactions
    where created_at between p_from and p_to
      and (p_bazaar is null or bazaar_id = p_bazaar)
  )
  select case when not is_admin() then null else json_build_object(
    'total_visits',        (select count(*) from s),
    'unique_visitors',     (select count(distinct visitor_id) from s),
    'engaged_visitors',    (select count(distinct s.visitor_id) from s join i on i.session_id = s.id),
    'viewed_rating_pages', (select count(distinct session_id) from i where type = 'view_rating_page'),
    'started_forms',       (select count(distinct session_id) from i where type = 'start_form'),
    'submitted_ratings',   (select count(distinct session_id) from i where type = 'submit_rating'),
    'qr_visits',           (select count(*) from s where source = 'qr'),
    'direct_visits',       (select count(*) from s where source = 'direct')
  ) end;
$$;
revoke execute on function public.analytics_summary(uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.analytics_summary(uuid, timestamptz, timestamptz) to authenticated;
