# Intelligence Layer

## Messy Inputs → Structured Data
| Raw Input | Auto-Structured As |
|---|---|
| Purchase amount entered by staff | Points = floor(amount) × category multiplier |
| Cumulative `annual_spend` crossing threshold | Category badge upgraded/downgraded |
| Redemption request | Balance validation → deduction → snapshot |

## Events to Track
- `purchase_logged` — member_id, amount, points_earned, category
- `points_redeemed` — member_id, reward_id, points_spent
- `category_changed` — member_id, from_category, to_category, trigger_spend
- `member_status_toggled` — member_id, old_status, new_status

## Scoring Rules (v1 — rule-based, no model)
```json
{
  "category_assignment": {
    "Silver": { "min_annual_spend": 0, "max_annual_spend": 999.99 },
    "Gold": { "min_annual_spend": 1000, "max_annual_spend": 4999.99 },
    "Platinum": { "min_annual_spend": 5000 }
  },
  "point_earning": {
    "base_rate": "1 point per RM1",
    "Silver_multiplier": 1,
    "Gold_multiplier": 1.5,
    "Platinum_multiplier": 2
  }
}
```

## What Gets Ranked (v1)
- Top 10 members by annual_spend (simple ORDER BY)
- Top redeemers by total points_redeemed (aggregate query)

## AI Fields (any future model output)
Store: `value`, `source` (model name), `confidence` (0–1 numeric), `review_status` (unreviewed / approved / rejected).

## Later
- Predict churn risk per member (low activity score)
- Recommend reward items based on redemption history
- Flag anomalous transaction amounts for review
