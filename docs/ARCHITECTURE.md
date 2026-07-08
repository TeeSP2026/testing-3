# Architecture

## Stack
- **Frontend:** Next.js 14 (App Router) on Vercel
- **Database + Auth:** Supabase (Postgres + RLS + Auth)
- **Styling:** Tailwind CSS + shadcn/ui

## Build Sequence
**Now:** Schema → Member CRUD → Point Award engine → Redemption engine → Dashboard KPIs
**Next:** Category auto-upgrade logic → search/filter → role-based UI guards
**Later:** Point expiry, report exports, email notifications, full auth lock-down

## Key Action Flow — Log a Purchase
1. Staff selects a member (lookup by name/ID)
2. Form captures purchase amount + remarks
3. App reads member's current category multiplier from `membership_categories`
4. Points = `floor(purchase_amount) × multiplier` computed server-side (Next.js Route Handler)
5. Supabase transaction: INSERT `point_transactions` row + UPDATE `members.current_points_balance` + UPDATE `members.annual_spend`
6. Category upgrade check: if new `annual_spend` crosses a threshold, UPDATE `members.category_id`
7. UI re-fetches member card — updated balance and category badge shown instantly
8. Audit log row written

## Layer Plan
1. **Data layer** — Postgres tables + RLS policies (all rules enforced here)
2. **App logic** — Route Handlers for point calculation, redemption validation, atomic writes
3. **Smart features** — category auto-assignment (rule-based, no AI needed); later: AI spending-pattern insights

## Core Without AI
Point calculation, category assignment, and redemption validation are pure arithmetic rules. The system is fully operational with AI features off.
