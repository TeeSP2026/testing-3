alter table members add column if not exists nickname text;
alter table members add column if not exists ic_number text;
alter table members add column if not exists state text;
alter table members add column if not exists town_area text;
alter table members add column if not exists referred_by text;
alter table members add column if not exists consent boolean not null default false;
