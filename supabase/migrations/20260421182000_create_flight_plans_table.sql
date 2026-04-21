create table if not exists public.flight_plans (
  id uuid primary key default gen_random_uuid(),
  aircraft_type text not null,
  registration text not null,
  from_icao text not null,
  to_icao text not null,
  flight_date date not null,
  pilots text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.flight_plans enable row level security;

drop policy if exists "flight_plans_select_all" on public.flight_plans;
create policy "flight_plans_select_all"
on public.flight_plans
for select
using (true);

drop policy if exists "flight_plans_insert_all" on public.flight_plans;
create policy "flight_plans_insert_all"
on public.flight_plans
for insert
with check (true);

drop policy if exists "flight_plans_update_all" on public.flight_plans;
create policy "flight_plans_update_all"
on public.flight_plans
for update
using (true)
with check (true);

create or replace function public.set_flight_plans_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_flight_plans_updated_at on public.flight_plans;
create trigger trg_set_flight_plans_updated_at
before update on public.flight_plans
for each row
execute procedure public.set_flight_plans_updated_at();

