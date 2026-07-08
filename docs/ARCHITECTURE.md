# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) on Vercel
- **Database + API:** Supabase (Postgres + RLS + Realtime)
- **Styling:** Tailwind CSS + shadcn/ui

## What to Build Now vs Later
**Now:** Members CRUD, Transactions (point award engine), Redemptions (point deduction), Categories config, Dashboard KPIs.
**Later:** Auth + role-scoped RLS, auto category engine, point expiry, export, POS webhook.

## Key User Action — Record a Purchase Transaction
1. Staff opens "Record Transaction" form, picks member (search by ID/name).
2. Enters purchase amount; system reads member's category multiplier from `membership_categories`.
3. On submit: `points_earned = floor(amount × multiplier)` computed server-side.
4. Supabase function (or Next.js API route) inserts row into `transactions` AND increments `members.points_balance` and `members.annual_spend` atomically inside a Postgres transaction.
5. Inserts row into `audit_logs` (action: `award_points`, risk: `low`).
6. UI refreshes member profile — updated balance confirmed from DB.

## Layer Plan
1. **Data layer first** — schema, constraints, RLS policies, seed data.
2. **App logic** — server-side point calculation, atomic balance updates, redemption validation.
3. **Smart features later** — category auto-upgrade rule engine, spending trend scoring.

## Core Without AI
Point calculation is pure arithmetic (RM1 × multiplier). Category rules are threshold comparisons. The system is fully operational with no AI component.
