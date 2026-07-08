# Data Model

## membership_categories
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | owner scope (lock-down sprint) |
| name | text | Silver / Gold / Platinum |
| min_annual_spend | numeric | |
| max_annual_spend | numeric nullable | null = no upper limit |
| point_multiplier | numeric | e.g. 1, 1.5, 2 |
| benefits | text | |
| renewal_period_days | int | default 365 |

## members
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| member_id | text unique | auto-generated e.g. MBR-0042 |
| full_name, gender, date_of_birth | text/date | |
| mobile_number, email_address, address | text | |
| registration_date | date | |
| category_id | uuid FK → membership_categories | |
| points_balance | numeric default 0 | source of truth |
| annual_spend | numeric default 0 | drives category engine |
| status | text | Active / Inactive |
| category_expiry_date | date | |
| category_assigned_source | text | AI field: source |
| category_assigned_confidence | numeric | AI field: 0–1 |
| category_assigned_review_status | text | default 'unreviewed' |

## transactions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| transaction_no | text unique | TXN-YYYYMMDD-NNN |
| transaction_date | timestamptz | |
| member_id | uuid FK → members | |
| purchase_amount | numeric | |
| points_earned | numeric | computed: amount × multiplier |
| remarks | text | |
| points_earned_source / confidence / review_status | text/numeric/text | AI provenance |

## redemptions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| redemption_id | text unique | RDM-YYYYMMDD-NNN |
| redemption_date | timestamptz | |
| member_id | uuid FK → members | |
| reward_item | text | |
| points_redeemed | numeric | |
| remaining_balance | numeric | snapshot at time of redemption |
| approval_status | text | approved / pending / rejected |
| approved_by | text | |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| actor | text | username or 'system' |
| action | text | e.g. award_points, redeem_points, edit_member |
| object_type | text | members / transactions / redemptions |
| object_id | text | |
| before_state / after_state | jsonb | |
| risk_level | text | low / medium / high / critical |

**RLS:** All tables have permissive v1 policies (select + all = true). Lock-down sprint replaces with `auth.uid() = user_id`.
