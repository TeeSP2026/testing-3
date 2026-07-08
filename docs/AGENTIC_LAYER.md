# Agentic Layer

## Risk Levels & Actions

### Low — Auto-execute, log only
- Calculate points from purchase amount
- Assign / update membership category based on spend threshold
- Generate Member ID (MBR-XXXXX sequence)
- Generate Transaction No. and Redemption ID

### Medium — Show draft, staff confirms before write
- Award bonus points for a promotion event (draft → staff approves → INSERT)
- Bulk status update (e.g. mark inactive members after 12 months of no activity)

### High — Requires explicit approval workflow
- Redemption of rewards above 5,000 points (flag for supervisor sign-off)
- Manual point adjustment (add or subtract points outside a purchase)

### Critical — Human only, never automated
- Delete a member record
- Reverse a completed redemption / refund points
- Bulk data export of PII fields

## Named Tools (v1)
- `award_points(member_id, purchase_amount)` → calculates, writes, returns new balance
- `redeem_reward(member_id, reward_id)` → validates, deducts, writes redemption row
- `update_member_category(member_id)` → re-checks annual_spend, updates category if needed
- `toggle_member_status(member_id, new_status)` → writes status, logs action

## Audit Log Fields
Every tool call writes to `audit_logs`: `action`, `target_table`, `target_id`, `performed_by`, `before_state` (jsonb), `after_state` (jsonb), `created_at`.

## v1 vs Later
**v1:** All four named tools operational, all writes logged.
**Later:** Bulk-action tools, churn-risk flag, promotional bonus engine.
