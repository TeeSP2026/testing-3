# Security

## Secret Handling
- Supabase service-role key is **never** in frontend code or committed to git.
- Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (read-only, RLS-governed) are exposed to the browser.
- All write operations that require elevated trust run in Next.js API routes using the service role key from `process.env` (server-only).

## Permission Model (v1 → lock-down)
- **v1:** Permissive RLS (`using (true)`) — demo-safe, no real user data.
- **Lock-down sprint:** Replace with `auth.uid() = user_id` owner policies. Add role column to users table; enforce: Admin = full CRUD, Customer Service = members + transactions + redemptions write, Marketing = categories write + read all, Management = read-only on all tables.

## Approved-Tools Rule
- Agents may only call the four named tools in `AGENTIC_LAYER.md`.
- No `run_any_sql`, `send_any_request`, or free-form shell execution.
- Every tool call appends a row to `audit_logs` before returning.

## Audit Principle
- Every state-changing action (create, update, delete, point award, redemption) writes an `audit_log` row with `before_state` and `after_state`.
- Audit rows are insert-only; no update or delete policy is granted on `audit_logs`.
- Before adding real staff data: run lock-down sprint, confirm RLS policies with `SELECT * FROM pg_policies`, rotate any dev credentials.
