create table if not exists membership_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  name text not null,
  min_annual_spend numeric not null default 0,
  max_annual_spend numeric,
  point_multiplier numeric not null default 1,
  benefits text,
  renewal_period_days int not null default 365
);

alter table membership_categories enable row level security;
drop policy if exists "membership_categories_v1_read" on membership_categories;
create policy "membership_categories_v1_read" on membership_categories for select using (true);
drop policy if exists "membership_categories_v1_write" on membership_categories;
create policy "membership_categories_v1_write" on membership_categories for all using (true) with check (true);

insert into membership_categories (id, name, min_annual_spend, max_annual_spend, point_multiplier, benefits) values
  ('a1000000-0000-0000-0000-000000000001', 'Silver', 0, 999, 1, 'Basic Membership'),
  ('a1000000-0000-0000-0000-000000000002', 'Gold', 1000, 4999, 1.5, 'Bonus Points'),
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
  points_balance numeric not null default 0,
  annual_spend numeric not null default 0,
  status text not null default 'Active',
  category_expiry_date date,
  category_assigned_source text,
  category_assigned_confidence numeric,
  category_assigned_review_status text default 'unreviewed'
);

alter table members enable row level security;
drop policy if exists "members_v1_read" on members;
create policy "members_v1_read" on members for select using (true);
drop policy if exists "members_v1_write" on members;
create policy "members_v1_write" on members for all using (true) with check (true);

insert into members (id, member_id, full_name, gender, date_of_birth, mobile_number, email_address, address, registration_date, category_id, points_balance, annual_spend, status, category_expiry_date) values
  ('b1000000-0000-0000-0000-000000000001', 'MBR-0001', 'Ahmad Faris bin Razali', 'Male', '1988-04-12', '0123456781', 'ahmad.faris@email.com', '12 Jalan Maju, Kuala Lumpur', '2023-01-15', 'a1000000-0000-0000-0000-000000000003', 8450, 6200, 'Active', '2025-01-15'),
  ('b1000000-0000-0000-0000-000000000002', 'MBR-0002', 'Siti Norzahra binti Hamid', 'Female', '1993-09-22', '0123456782', 'siti.norzahra@email.com', '45 Lorong Damai, Petaling Jaya', '2023-03-08', 'a1000000-0000-0000-0000-000000000002', 3120, 2400, 'Active', '2025-03-08'),
  ('b1000000-0000-0000-0000-000000000003', 'MBR-0003', 'Rajesh Kumar s/o Muthu', 'Male', '1979-11-05', '0123456783', 'rajesh.kumar@email.com', '8 Taman Indah, Shah Alam', '2023-06-20', 'a1000000-0000-0000-0000-000000000001', 540, 380, 'Active', '2025-06-20'),
  ('b1000000-0000-0000-0000-000000000004', 'MBR-0004', 'Nurul Aini binti Zulkifli', 'Female', '1995-02-14', '0123456784', 'nurul.aini@email.com', '3 Persiaran Utama, Subang Jaya', '2023-07-11', 'a1000000-0000-0000-0000-000000000002', 1870, 1550, 'Active', '2025-07-11'),
  ('b1000000-0000-0000-0000-000000000005', 'MBR-0005', 'Lim Wei Xiang', 'Male', '1985-06-30', '0123456785', 'lim.weixiang@email.com', '22 Jalan Kenanga, Cheras', '2022-11-01', 'a1000000-0000-0000-0000-000000000001', 120, 210, 'Inactive', '2024-11-01')
on conflict (id) do nothing;

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  transaction_no text unique not null,
  transaction_date timestamptz not null default now(),
  member_id uuid not null references members(id),
  purchase_amount numeric not null,
  points_earned numeric not null,
  remarks text,
  points_earned_source text,
  points_earned_confidence numeric,
  points_earned_review_status text default 'unreviewed'
);

alter table transactions enable row level security;
drop policy if exists "transactions_v1_read" on transactions;
create policy "transactions_v1_read" on transactions for select using (true);
drop policy if exists "transactions_v1_write" on transactions;
create policy "transactions_v1_write" on transactions for all using (true) with check (true);

insert into transactions (id, transaction_no, transaction_date, member_id, purchase_amount, points_earned, remarks) values
  ('c1000000-0000-0000-0000-000000000001', 'TXN-20240101-001', '2024-01-10 10:30:00+08', 'b1000000-0000-0000-0000-000000000001', 1200.00, 2400, 'Platinum multiplier applied'),
  ('c1000000-0000-0000-0000-000000000002', 'TXN-20240102-002', '2024-01-15 14:20:00+08', 'b1000000-0000-0000-0000-000000000002', 850.00, 1275, 'Gold multiplier applied'),
  ('c1000000-0000-0000-0000-000000000003', 'TXN-20240103-003', '2024-01-18 09:00:00+08', 'b1000000-0000-0000-0000-000000000003', 380.00, 380, 'Silver rate'),
  ('c1000000-0000-0000-0000-000000000004', 'TXN-20240104-004', '2024-02-05 16:45:00+08', 'b1000000-0000-0000-0000-000000000001', 600.00, 1200, 'Platinum multiplier applied'),
  ('c1000000-0000-0000-0000-000000000005', 'TXN-20240105-005', '2024-02-12 11:10:00+08', 'b1000000-0000-0000-0000-000000000004', 450.00, 675, 'Gold multiplier applied')
on conflict (id) do nothing;

create table if not exists redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  redemption_id text unique not null,
  redemption_date timestamptz not null default now(),
  member_id uuid not null references members(id),
  reward_item text not null,
  points_redeemed numeric not null,
  remaining_balance numeric not null,
  approval_status text not null default 'approved',
  approved_by text,
  remarks text
);

alter table redemptions enable row level security;
drop policy if exists "redemptions_v1_read" on redemptions;
create policy "redemptions_v1_read" on redemptions for select using (true);
drop policy if exists "redemptions_v1_write" on redemptions;
create policy "redemptions_v1_write" on redemptions for all using (true) with check (true);

insert into redemptions (id, redemption_id, redemption_date, member_id, reward_item, points_redeemed, remaining_balance, approval_status) values
  ('d1000000-0000-0000-0000-000000000001', 'RDM-20240201-001', '2024-02-01 13:00:00+08', 'b1000000-0000-0000-0000-000000000001', 'RM50 Shopping Voucher', 500, 7950, 'approved'),
  ('d1000000-0000-0000-0000-000000000002', 'RDM-20240210-002', '2024-02-10 15:30:00+08', 'b1000000-0000-0000-0000-000000000002', 'Free Delivery Voucher', 200, 2920, 'approved'),
  ('d1000000-0000-0000-0000-000000000003', 'RDM-20240215-003', '2024-02-15 10:00:00+08', 'b1000000-0000-0000-0000-000000000004', 'RM20 Discount Coupon', 200, 1670, 'approved')
on conflict (id) do nothing;

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  actor text,
  action text not null,
  object_type text not null,
  object_id text,
  before_state jsonb,
  after_state jsonb,
  risk_level text not null default 'low',
  ip_address text
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);