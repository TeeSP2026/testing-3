create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

alter table user_profiles enable row level security;

drop policy if exists "user_profiles_v1_self_read" on user_profiles;
create policy "user_profiles_v1_self_read" on user_profiles for select using (auth.uid() = id);
