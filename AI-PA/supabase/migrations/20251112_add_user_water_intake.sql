-- Create table for manual water intake tracking per user per day
-- Requires RLS; users can only access their own records

create table if not exists public.user_water_intake (
  water_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  amount_ml integer not null check (amount_ml > 0),
  created_at timestamptz not null default now()
);

alter table public.user_water_intake enable row level security;

-- Index to speed up lookups for a user's entries for a specific date
create index if not exists idx_user_water_intake_user_date
  on public.user_water_intake (user_id, date);

-- RLS policies: users can read/insert/delete their own entries
create policy if not exists "Water: select own"
  on public.user_water_intake
  for select
  using (auth.uid() = user_id);

create policy if not exists "Water: insert own"
  on public.user_water_intake
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Water: delete own"
  on public.user_water_intake
  for delete
  using (auth.uid() = user_id);

