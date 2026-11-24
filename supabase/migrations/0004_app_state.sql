create table if not exists app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_state enable row level security;

drop policy if exists "app_state_v1_read" on app_state;
create policy "app_state_v1_read" on app_state for select using (true);
drop policy if exists "app_state_v1_write" on app_state;
create policy "app_state_v1_write" on app_state for all using (true) with check (true);
