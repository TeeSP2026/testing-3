# Security

## Secret Handling
- Supabase service-role key: server-side only (Next.js Route Handlers / `SUPABASE_SERVICE_KEY` env var). Never referenced in client code or `NEXT_PUBLIC_` variables.
- Anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is safe to expose — RLS is the guard.

## Permission Model (v1 → Lock-Down)
- **v1:** Open RLS policies on all tables — demo works without login.
- **Lock-Down sprint:** Replace with `auth.uid() = user_id` owner policies. Role column in a `staff_users` table gates write vs read-only surfaces.
- **Role matrix:**
  | Role | Members | Transactions | Redemptions | Reports | Admin |
  |---|---|---|---|---|---|
  | Administrator | R/W | R/W | R/W | R | R/W |
  | Customer Service | R/W | R/W | R/W | R | — |
  | Marketing | R | R | R | R | — |
  | Management | R | R | R | R | — |

## Approved Tools Rule
Only the four named tools in `AGENTIC_LAYER.md` may write to the database from application logic. No raw `run_any` or dynamic SQL construction from user input. All inputs validated and parameterised.

## Audit Principle
Every state-changing action (create, update, status toggle, points award, redemption) writes a row to `audit_logs` with before/after state. Audit rows are append-only — no DELETE policy on `audit_logs`.

## PII
Member PII (name, mobile, email, address) is stored in Postgres. No PII is logged to browser console, Vercel logs, or third-party services. Bulk export of PII is a Critical-level human-only action.
