# Tasks & Sprints

## Sprint 1 — Database & Seed Data
**Goal:** All tables exist, RLS open, demo data visible without login.
- [ ] Write and apply migration SQL (members, categories, point_transactions, rewards, redemptions, audit_logs)
- [ ] Seed 5 members across Silver/Gold/Platinum
- [ ] Seed 6 point transactions and 3 redemptions
- [ ] Verify all tables readable via Supabase anon key
- [ ] Confirm no service-role key in client bundle

**Definition of Done:** `select * from members` returns 5 rows; `select * from point_transactions` returns 6 rows; RLS policies present on all 6 tables.

---

## Sprint 2 — Member Management CRUD
**Goal:** Staff can add, edit, search, and deactivate members in the UI.
- [ ] `/members` list page: table with Member ID, Name, Category badge, Points, Status
- [ ] Loading skeleton, empty state ("No members yet — add one"), error banner
- [ ] "Add Member" form: all profile fields, auto-generated Member ID (MBR-XXXXX)
- [ ] "Edit Member" drawer/modal: pre-filled, saves on submit
- [ ] Active/Inactive toggle button with confirmation dialog
- [ ] Search bar: filters by name, member_id, mobile_number, email_address client-side
- [ ] All writes persist to Supabase and survive hard refresh

**Definition of Done:** Add a new member → reload page → member appears in list with correct data.

---

## Sprint 3 — Point Award Engine ✅ v1 functional milestone
**Goal:** Logging a purchase correctly awards points, updates balance, and triggers category check.
- [ ] "Log Purchase" form on member detail page (amount, remarks)
- [ ] Route Handler `POST /api/award-points`: compute points = floor(amount) × multiplier, atomic write to point_transactions + members (balance + annual_spend)
- [ ] Category upgrade check after each purchase (update category_id if threshold crossed)
- [ ] Purchase history table on member detail page
- [ ] Dashboard page: KPI cards (Total Members, Active Members, Total Points Issued, Total Redeemed)
- [ ] Dashboard: Top 10 members by annual_spend
- [ ] All states: loading, empty ("No transactions yet"), error
- [ ] Audit log row written for every award

**Definition of Done:** Log RM300 purchase for Gold member → 450 points added → balance updates → history row appears → dashboard totals update. Hard refresh preserves all values.

---

## Sprint 4 — Redemption Management
**Goal:** Staff can redeem points for rewards; balance is deducted and history is kept.
- [ ] Rewards catalogue page: list active rewards with points cost
- [ ] Add / edit reward form (Admin)
- [ ] "Redeem" action on member detail: select reward → show points cost + balance after → confirm
- [ ] Route Handler `POST /api/redeem`: validate balance ≥ points_required AND ≥ minimum_redemption_points; atomic deduct + insert redemption row
- [ ] Return 400 with clear message if balance insufficient
- [ ] Redemption history tab on member detail
- [ ] Audit log row written for every redemption

**Definition of Done:** Attempt redemption with insufficient points → error message shown. Successful redemption → balance decreases → redemption row in history → survives refresh.

---

## Sprint 5 — Reports & Category Management
**Goal:** Management can view meaningful aggregates; categories are configurable.
- [ ] Members-by-category summary (count per category)
- [ ] Points earned vs redeemed totals (bar or stat cards)
- [ ] Monthly new-member registrations (group by registration_date month)
- [ ] Top 10 redeemers (sum points_redeemed per member)
- [ ] Category management page: edit name, thresholds, multiplier
- [ ] Re-run category assignment for all members on threshold change (batch Route Handler)

**Definition of Done:** Reports page loads with correct counts matching database; editing Gold threshold to RM1,200 and triggering re-assignment moves affected members.

---

## Sprint 6 — Lock It Down (Auth & Role Permissions)
**Goal:** Real staff log in; data is owner/role-scoped; Management sees no write controls.
- [ ] Supabase Auth: email/password sign-in page at `/login`
- [ ] `staff_users` table: user_id, role (Administrator / Customer Service / Marketing / Management)
- [ ] Replace v1 RLS policies with role-scoped policies
- [ ] Hide write controls (Add, Edit, Redeem buttons) for Management role
- [ ] Protect all Route Handlers: verify session before executing writes
- [ ] Test: Management user cannot POST to `/api/award-points`

**Definition of Done:** Unauthenticated POST to `/api/award-points` returns 401. Management-role user sees reports but no Add/Edit buttons.

---

## Gantt (Sprint → Feature)
```
Sprint 1  ████ Schema + Seed
Sprint 2  ████ Member CRUD
Sprint 3  ████ Point Engine (v1 functional ✅)
Sprint 4       ████ Redemptions
Sprint 5            ████ Reports + Categories
Sprint 6                 ████ Auth Lock-Down
```
