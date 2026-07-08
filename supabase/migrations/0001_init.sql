create table if not exists membership_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  name text not null,
  min_annual_spend numeric not null default 0,
  max_annual_spend numeric,
  point_multiplier numeric not null default 1,
  benefits text
);

alter table membership_categories enable row level security;
drop policy if exists "membership_categories_v1_read" on membership_categories;
create policy "membership_categories_v1_read" on membership_categories for select using (true);
drop policy if exists "membership_categories_v1_write" on membership_categories;
create policy "membership_categories_v1_write" on membership_categories for all using (true) with check (true);

insert into membership_categories (id, name, min_annual_spend, max_annual_spend, point_multiplier, benefits) values
  ('a1000000-0000-0000-0000-000000000001', 'Silver', 0, 999.99, 1, 'Basic Membership'),
  ('a1000000-0000-0000-0000-000000000002', 'Gold', 1000, 4999.99, 1.5, 'Bonus Points'),
  ('a1000000-0000-0000-0000-000000000003', 'Platinum', 5000, null, 2, 'Premium Benefits')
on conflict (id) do nothing;

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  member_id text unique not null,
  full_name text not null,
  gender text,
  date_of_birth date,
  mobile_number text,
  email_address text,
  address text,
  registration_date date not null default current_date,
  category_id uuid references membership_categories(id),
  current_points_balance numeric not null default 0,
  annual_spend numeric not null default 0,
  status text not null default 'Active'
);

alter table members enable row level security;
drop policy if exists "members_v1_read" on members;
create policy "members_v1_read" on members for select using (true);
drop policy if exists "members_v1_write" on members;
create policy "members_v1_write" on members for all using (true) with check (true);

insert into members (id, member_id, full_name, gender, date_of_birth, mobile_number, email_address, address, registration_date, category_id, current_points_balance, annual_spend, status) values
  ('b1000000-0000-0000-0000-000000000001', 'MBR-00001', 'Ahmad Faris bin Zakaria', 'Male', '1988-03-15', '0123456789', 'ahmad.faris@email.com', 'No 12, Jalan Melati, Kuala Lumpur', '2024-01-10', 'a1000000-0000-0000-0000-000000000003', 4200, 6800, 'Active'),
  ('b1000000-0000-0000-0000-000000000002', 'MBR-00002', 'Siti Nurhaliza binti Hassan', 'Female', '1992-07-22', '0187654321', 'siti.nura@email.com', 'Unit 3A, Taman Bunga, Petaling Jaya', '2024-02-14', 'a1000000-0000-0000-0000-000000000002', 1350, 2100, 'Active'),
  ('b1000000-0000-0000-0000-000000000003', 'MBR-00003', 'Raj Kumar a/l Selvam', 'Male', '1985-11-05', '0112233445', 'rajkumar@email.com', '45 Lorong Damai, Georgetown, Penang', '2024-03-01', 'a1000000-0000-0000-0000-000000000001', 540, 430, 'Active'),
  ('b1000000-0000-0000-0000-000000000004', 'MBR-00004', 'Lim Wei Ling', 'Female', '1995-05-30', '0199887766', 'weilingLim@email.com', '88 Jalan Kenanga, Johor Bahru', '2024-04-20', 'a1000000-0000-0000-0000-000000000002', 875, 1580, 'Active'),
  ('b1000000-0000-0000-0000-000000000005', 'MBR-00005', 'Mohd Hafiz bin Nordin', 'Male', '1990-09-18', '0134455667', 'hafiz.nordin@email.com', 'Blok C-12, Residensi Harmoni, Shah Alam', '2024-05-05', 'a1000000-0000-0000-0000-000000000001', 120, 95, 'Inactive')
on conflict (id) do nothing;

create table if not exists point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  transaction_no text unique not null,
  transaction_date timestamptz not null default now(),
  member_id uuid not null references members(id),
  purchase_amount numeric not null,
  points_earned numeric not null,
  multiplier_applied numeric not null default 1,
  remarks text,
  category_at_time text
);

alter table point_transactions enable row level security;
drop policy if exists "point_transactions_v1_read" on point_transactions;
create policy "point_transactions_v1_read" on point_transactions for select using (true);
drop policy if exists "point_transactions_v1_write" on point_transactions;
create policy "point_transactions_v1_write" on point_transactions for all using (true) with check (true);

insert into point_transactions (id, transaction_no, transaction_date, member_id, purchase_amount, points_earned, multiplier_applied, remarks, category_at_time) values
  ('c1000000-0000-0000-0000-000000000001', 'TXN-20240610-001', '2024-06-10 10:30:00+08', 'b1000000-0000-0000-0000-000000000001', 500.00, 1000, 2, 'In-store purchase', 'Platinum'),
  ('c1000000-0000-0000-0000-000000000002', 'TXN-20240612-002', '2024-06-12 14:15:00+08', 'b1000000-0000-0000-0000-000000000002', 300.00, 450, 1.5, 'Online purchase', 'Gold'),
  ('c1000000-0000-0000-0000-000000000003', 'TXN-20240615-003', '2024-06-15 09:00:00+08', 'b1000000-0000-0000-0000-000000000003', 180.00, 180, 1, 'Walk-in purchase', 'Silver'),
  ('c1000000-0000-0000-0000-000000000004', 'TXN-20240618-004', '2024-06-18 16:45:00+08', 'b1000000-0000-0000-0000-000000000001', 1200.00, 2400, 2, 'Corporate order', 'Platinum'),
  ('c1000000-0000-0000-0000-000000000005', 'TXN-20240620-005', '2024-06-20 11:00:00+08', 'b1000000-0000-0000-0000-000000000004', 250.00, 375, 1.5, 'In-store purchase', 'Gold'),
  ('c1000000-0000-0000-0000-000000000006', 'TXN-20240622-006', '2024-06-22 13:30:00+08', 'b1000000-0000-0000-0000-000000000002', 600.00, 900, 1.5, 'Special promotion', 'Gold')
on conflict (id) do nothing;

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  name text not null,
  description text,
  points_required numeric not null,
  minimum_redemption_points numeric not null default 100,
  is_active boolean not null default true
);

alter table rewards enable row level security;
drop policy if exists "rewards_v1_read" on rewards;
create policy "rewards_v1_read" on rewards for select using (true);
drop policy if exists "rewards_v1_write" on rewards;
create policy "rewards_v1_write" on rewards for all using (true) with check (true);

insert into rewards (id, name, description, points_required, minimum_redemption_points, is_active) values
  ('d1000000-0000-0000-0000-000000000001', 'RM10 Voucher', 'Redeemable in-store or online', 500, 500, true),
  ('d1000000-0000-0000-0000-000000000002', 'RM50 Voucher', 'Redeemable in-store or online', 2500, 500, true),
  ('d1000000-0000-0000-0000-000000000003', 'Free Gift Set', 'Exclusive member gift set', 1000, 500, true),
  ('d1000000-0000-0000-0000-000000000004', 'RM100 Voucher', 'Premium members only', 5000, 500, true)
on conflict (id) do nothing;

create table if not exists redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  redemption_id text unique not null,
  redemption_date timestamptz not null default now(),
  member_id uuid not null references members(id),
  reward_id uuid not null references rewards(id),
  points_redeemed numeric not null,
  points_balance_after numeric not null,
  status text not null default 'Approved',
  processed_by text
);

alter table redemptions enable row level security;
drop policy if exists "redemptions_v1_read" on redemptions;
create policy "redemptions_v1_read" on redemptions for select using (true);
drop policy if exists "redemptions_v1_write" on redemptions;
create policy "redemptions_v1_write" on redemptions for all using (true) with check (true);

insert into redemptions (id, redemption_id, redemption_date, member_id, reward_id, points_redeemed, points_balance_after, status, processed_by) values
  ('e1000000-0000-0000-0000-000000000001', 'RDM-20240611-001', '2024-06-11 11:00:00+08', 'b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 2500, 4200, 'Approved', 'Staff: Amirah'),
  ('e1000000-0000-0000-0000-000000000002', 'RDM-20240619-002', '2024-06-19 15:30:00+08', 'b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 500, 1350, 'Approved', 'Staff: Rizwan'),
  ('e1000000-0000-0000-0000-000000000003', 'RDM-20240621-003', '2024-06-21 10:15:00+08', 'b1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000003', 1000, 875, 'Approved', 'Staff: Amirah')
on conflict (id) do nothing;

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  action text not null,
  target_table text not null,
  target_id uuid,
  performed_by text,
  before_state jsonb,
  after_state jsonb,
  ip_address text
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);