# Tasks & Sprints

## Sprint 1 — Database Foundation & Members CRUD
**Goal:** Schema live; members can be created, viewed, searched, and edited without login.

- [ ] Apply migration SQL to Supabase (all 5 tables + seed data)
- [ ] Verify seed rows visible via Supabase table editor
- [ ] `/members` list page: table with search (ID, name, mobile, email), status badge, pagination
- [ ] Member list loading / empty / error states handled
- [ ] `/members/new` form: all fields, auto-generate Member ID (MBR-XXXX), save to DB
- [ ] `/members/[id]` edit form: pre-populated, save changes, toggle Active/Inactive
- [ ] `/categories` list + edit form (name, thresholds, multiplier, benefits)
- [ ] All forms: validation errors shown inline; success confirmation shown

**Definition of Done:** A new member can be created and immediately appears in the search list after a hard refresh. Seed members visible on first load without login.

---

## Sprint 2 — Point Award & Redemption Engine ✦ v1 functional milestone
**Goal:** The core loyalty workflow works end-to-end against the live database.

- [ ] `/transactions/new` form: member picker, purchase amount field
- [ ] Server-side: fetch member's category multiplier, compute `points_earned = floor(amount × multiplier)`
- [ ] Atomic DB write: insert `transactions` row + increment `members.points_balance` + `members.annual_spend` in one Postgres transaction
- [ ] Insert `audit_log` row (action: `award_points`, risk: `low`)
- [ ] `/members/[id]` shows point-earning history (transactions table)
- [ ] `/redemptions/new` form: member picker, reward item, points to redeem
- [ ] Server-side: validate `points_redeemed <= points_balance`; reject with error if not
- [ ] Atomic DB write: insert `redemptions` row + decrement `members.points_balance`
- [ ] Insert `audit_log` row (action: `redeem_points`, risk: `medium`)
- [ ] `/members/[id]` shows redemption history
- [ ] Empty states: "No transactions yet" / "No redemptions yet"
- [ ] Error state: insufficient points shows inline error, does not write to DB

**Definition of Done:** Record a transaction for MBR-0002 → balance increases by correct amount. Redeem 200 points → balance decreases by 200. Both visible after hard refresh. Attempt to redeem more points than balance → blocked with error message.

---

## Sprint 3 — Dashboard & Reports
**Goal:** Management can see live KPIs and top-performer lists.

- [ ] `/` dashboard page (home, no login required)
- [ ] KPI cards: Total Members, Active Members, Total Points Issued, Total Points Redeemed
- [ ] Top 10 members by `annual_spend` table
- [ ] Members-by-category donut chart
- [ ] Monthly new member registrations bar chart
- [ ] Points earned vs redeemed summary table
- [ ] All widgets handle loading and empty data states

**Definition of Done:** Dashboard loads in under 3 s with seed data; all KPI values match direct Supabase queries.

---

## Sprint 4 — Automatic Category Engine
**Goal:** Category upgrades/downgrades happen automatically on each transaction.

- [ ] After atomic transaction write, run `suggest_category(annual_spend)` server-side
- [ ] If suggested category ≠ current category: update `members.category_id`, log `audit_log` (action: `category_change`, risk: `medium`)
- [ ] Member profile shows category badge; change reflected immediately
- [ ] Category expiry date set to `transaction_date + renewal_period_days`
- [ ] Manual override: admin can set category directly (logs override)

**Definition of Done:** MBR-0003 records a purchase that pushes annual_spend to RM1,000 → category automatically changes from Silver to Gold on their profile.

---

## Sprint 5 — Lock It Down (Auth & Role Permissions)
**Goal:** Real staff data is safe; actions are role-gated.

- [ ] Enable Supabase Auth; build `/login` page (email + password)
- [ ] Add `role` field to auth users metadata (Admin, Customer Service, Marketing, Management)
- [ ] Replace all v1 permissive RLS policies with `auth.uid() = user_id` + role checks
- [ ] Management role: read-only (no write policies)
- [ ] Customer Service: write on members, transactions, redemptions only
- [ ] Marketing: write on categories, read all
- [ ] Admin: full access
- [ ] Redemptions > 1,000 pts: set `approval_status = pending`; Admin sees approval queue
- [ ] Test: confirm unauthenticated user cannot write via Supabase client

**Definition of Done:** A logged-in Management user cannot create a transaction (button disabled + server rejects). An unauthenticated Supabase client insert returns a permissions error.

---

## Gantt (which sprint each task lands)
```
Sprint 1  [====]          DB + Members CRUD
Sprint 2       [====]     Point Award + Redemption  ← v1 functional
Sprint 3            [==]  Dashboard + Reports
Sprint 4              [==] Category Auto-Engine
Sprint 5                [====] Auth + Lock-Down
```
