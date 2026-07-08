# PRD — Loyalty Membership System

## Problem
The team manages member records, purchase points, and redemptions across spreadsheets and chat. There is no single source of truth — balances drift, category upgrades are missed, and reports require manual collation.

## Target Users
Internal team: Customer Service (daily data entry), Marketing (category management, reports), Management (read-only reporting), Administrator (full access).

## Core Objects
- **Member** — profile, status, points balance, annual spend, category
- **Membership Category** — Silver / Gold / Platinum, spending thresholds, point multiplier
- **Point Transaction** — purchase amount → auto-calculated points → balance update
- **Reward** — catalogue item with points cost
- **Redemption** — member redeeming a reward, points deducted, history kept
- **Audit Log** — every write action recorded

## MVP Must-Haves
- [ ] Add / edit / deactivate members with auto-generated Member ID
- [ ] Log a purchase → auto-calculate points (RM1 = 1 pt × multiplier) → update balance
- [ ] Redeem points against a reward → validate balance → deduct → record history
- [ ] Dashboard: total members, active count, total points issued, total redeemed
- [ ] Search members by name, ID, mobile, email
- [ ] Seed data visible without login

## Non-Goals (v1)
- Point expiry engine
- PDF/CSV export
- Email/SMS notifications
- Multi-tenant or public sign-up
- Login wall (deferred to Lock-Down sprint)

## Success Criteria
A staff member opens the app, searches for member MBR-00002, logs a RM300 purchase, confirms 450 points (Gold × 1.5) are added to the balance, then redeems an RM10 Voucher — the balance updates correctly and the redemption appears in history. All steps persist after a hard refresh.
