# Agentic Layer

## Risk Levels & Actions

### Low — Auto-execute, log only
- Award points after transaction insert (compute + write `points_balance`)
- Suggest membership category based on `annual_spend` threshold
- Tag transaction with multiplier source

### Medium — Draft shown to staff, one-click approve
- Upgrade or downgrade member category (system drafts, staff confirms)
- Flag member as Inactive after N days of no transactions

### High — Always requires explicit approval
- Process a redemption above 1,000 points (approval_status = pending → staff approves)
- Reverse / void a transaction

### Critical — Human only, no agent action
- Permanent deletion of a member record
- Bulk point adjustment across multiple members
- Any action with financial/legal consequence

## Named Tools (v1)
- `calculate_points(purchase_amount, multiplier)` → integer
- `update_member_balance(member_id, delta)` → updated balance
- `log_audit_event(actor, action, object_type, object_id, before, after, risk_level)`
- `suggest_category(annual_spend)` → category_id

## Audit Log Fields
`actor, action, object_type, object_id, before_state (jsonb), after_state (jsonb), risk_level, created_at, ip_address`

## v1 vs Later
**v1:** Only low-risk auto-actions (point calculation, balance update) run automatically. All others are manual.
**Later:** Category upgrade agent with draft UI, churn-risk alert agent.
