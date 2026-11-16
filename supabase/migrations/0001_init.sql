-- Power Lunch — basis-schema
-- Draai dit in Supabase: SQL Editor → plakken → Run.

create type lunch_status as enum (
  'voorgesteld',   -- A heeft een lunch voorgesteld aan B
  'geaccepteerd',  -- B is akkoord; reservering moet nog gemaakt worden
  'gereserveerd',  -- tafel bevestigd door het restaurant
  'afgewezen',
  'geannuleerd'
);

-- Profiel per gebruiker (1-op-1 met auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  role text not null default '',
  company text not null default '',
  linkedin_picture text,
  sector text,
  city text,
  target_sectors text[] not null default '{}',
  topics text[] not null default '{}',
  goals text[] not null default '{}',
  diet text[] not null default '{}',
  -- Vrije tekst over allergieën. Gezondheidsgegeven (AVG): alleen opslaan met toestemming,
  -- alleen delen met het restaurant, verwijderen na de lunch.
  diet_note text,
  diet_note_consent boolean not null default false,
  prompt_1 text,
  prompt_2 text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lunchmomenten waarop iemand kan (één rij per tijdslot)
create table public.availability (
  user_id uuid not null references public.profiles on delete cascade,
  starts_at timestamptz not null,
  primary key (user_id, starts_at)
);

create table public.restaurants (
  id bigint generated always as identity primary key,
  city text not null,
  name text not null,
  area text not null default '',
  icon text not null default '🍽',
  topics text[] not null default '{}',
  diet_tags text[] not null default '{}',
  -- Koppeling met reserveringssysteem: 'handmatig' | 'zenchef' | 'formitable' | 'thefork'
  booking_system text not null default 'handmatig',
  booking_ref text,            -- restaurant-ID in dat systeem
  contact_email text,          -- voor handmatige bevestiging
  is_partner boolean not null default false,
  active boolean not null default true
);

create table public.lunches (
  id bigint generated always as identity primary key,
  from_user uuid not null references public.profiles on delete cascade,
  to_user uuid not null references public.profiles on delete cascade,
  prompt_index smallint,                 -- op welk antwoord gereageerd werd
  starts_at timestamptz not null,
  restaurant_id bigint references public.restaurants,
  status lunch_status not null default 'voorgesteld',
  booking_ref text,                      -- reserveringsnummer na bevestiging
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_user <> to_user)
);
create index on public.lunches (to_user, status);
create index on public.lunches (from_user, status);

-- Overgeslagen profielen, zodat ze niet terugkomen
create table public.skips (
  user_id uuid not null references public.profiles on delete cascade,
  skipped_user uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, skipped_user)
);

-- Profiel automatisch aanmaken na eerste login (naam + foto uit LinkedIn)
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, linkedin_picture)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'picture'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────── Row Level Security ─────────
alter table public.profiles enable row level security;
alter table public.availability enable row level security;
alter table public.restaurants enable row level security;
alter table public.lunches enable row level security;
alter table public.skips enable row level security;

-- Profielen: de tabel zelf is alleen voor de eigenaar (bevat dieet/allergie-gegevens).
create policy "eigen profiel lezen" on public.profiles for select using (auth.uid() = id);
create policy "eigen profiel wijzigen" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Andere gebruikers zien alleen deze view: zonder dieet, allergie of e-mail.
create view public.public_profiles as
  select id, name, role, company, linkedin_picture, sector, city, target_sectors,
         topics, goals, prompt_1, prompt_2
  from public.profiles where onboarded;
revoke all on public.public_profiles from anon, public;
grant select on public.public_profiles to authenticated;

create policy "beschikbaarheid lezen" on public.availability for select
  using (auth.role() = 'authenticated');
create policy "eigen beschikbaarheid beheren" on public.availability for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "restaurants lezen" on public.restaurants for select
  using (auth.role() = 'authenticated' and active);

create policy "eigen lunches lezen" on public.lunches for select
  using (auth.uid() in (from_user, to_user));
create policy "lunch voorstellen" on public.lunches for insert
  with check (auth.uid() = from_user and status = 'voorgesteld');
-- Ontvanger mag accepteren/afwijzen/annuleren; afzender mag alleen annuleren.
-- Reserveren (status 'gereserveerd') gebeurt server-side met de service-key.
create policy "lunch beantwoorden" on public.lunches for update
  using (auth.uid() = to_user)
  with check (auth.uid() = to_user and status in ('geaccepteerd', 'afgewezen', 'geannuleerd'));
create policy "lunch annuleren" on public.lunches for update
  using (auth.uid() = from_user)
  with check (auth.uid() = from_user and status = 'geannuleerd');
-- Gebruikers mogen alleen de status wijzigen, niet tijd of restaurant.
revoke update on public.lunches from authenticated;
grant update (status, updated_at) on public.lunches to authenticated;

create policy "eigen skips" on public.skips for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
