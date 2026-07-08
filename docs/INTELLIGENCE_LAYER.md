# Intelligence Layer

## Messy Inputs Today
- Staff manually picks membership category for each member
- Category upgrades forgotten or applied inconsistently
- Point multipliers miscalculated on spreadsheets

## Auto-Structure Schema (example event)
```json
{
  "member_id": "MBR-0002",
  "annual_spend": 2400,
  "current_category": "Gold",
  "suggested_category": "Gold",
  "suggestion_source": "spend_threshold_rule",
  "confidence": 1.0,
  "review_status": "unreviewed"
}
```

## Events to Track
- Transaction recorded (amount, member, multiplier applied)
- Redemption completed (points deducted, reward item)
- Category change (old → new, trigger reason)
- Member status toggled

## Scoring Rules (rule-based v1)
- `suggested_category` = first category where `annual_spend >= min_annual_spend AND (max_annual_spend IS NULL OR annual_spend <= max_annual_spend)`
- `points_earned = floor(purchase_amount × category.point_multiplier)`
- Member "activity score" = transactions in last 90 days × avg purchase amount (used for top-spenders ranking)

## What Gets Ranked
- Top 10 members by `annual_spend` → dashboard widget
- Top redeemers by total `points_redeemed`

## v1 vs Later
**v1:** All rules are deterministic arithmetic; no ML.
**Later:** Churn risk score (AI), recommended reward for member profile (AI, stored with source + confidence + review_status), anomaly detection on redemptions.
