# Data Model

## membership_categories
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | owner scope (lock-down) |
| name | text | Silver / Gold / Platinum |
| min_annual_spend | numeric | lower bound |
| max_annual_spend | numeric nullable | null = no cap |
| point_multiplier | numeric | e.g. 1, 1.5, 2 |
| benefits | text | |
| created_at | timestamptz | |

## members
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| member_id | text UNIQUE | auto-generated MBR-XXXXX |
| full_name | text | |
| gender | text | |
| date_of_birth | date | |
| mobile_number | text | |
| email_address | text | |
| address | text | |
| registration_date | date | |
| category_id | uuid FK → membership_categories | |
| current_points_balance | numeric default 0 | |
| annual_spend | numeric default 0 | |
| status | text | Active / Inactive |
| created_at | timestamptz | |

## point_transactions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| transaction_no | text UNIQUE | TXN-YYYYMMDD-NNN |
| transaction_date | timestamptz | |
| member_id | uuid FK → members | |
| purchase_amount | numeric | |
| points_earned | numeric | computed server-side |
| multiplier_applied | numeric | snapshot at time of purchase |
| category_at_time | text | snapshot |
| remarks | text | |
| user_id | uuid nullable | |
| created_at | timestamptz | |

## rewards
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| description | text | |
| points_required | numeric | |
| minimum_redemption_points | numeric default 100 | enforced in Route Handler |
| is_active | boolean | |
| user_id | uuid nullable | |
| created_at | timestamptz | |

## redemptions
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| redemption_id | text UNIQUE | RDM-YYYYMMDD-NNN |
| redemption_date | timestamptz | |
| member_id | uuid FK → members | |
| reward_id | uuid FK → rewards | |
| points_redeemed | numeric | |
| points_balance_after | numeric | snapshot |
| status | text | Approved / Pending |
| processed_by | text | staff name |
| user_id | uuid nullable | |
| created_at | timestamptz | |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| action | text | e.g. AWARD_POINTS, REDEEM, EDIT_MEMBER |
| target_table | text | |
| target_id | uuid | |
| performed_by | text | staff name / system |
| before_state | jsonb | |
| after_state | jsonb | |
| ip_address | text | |
| user_id | uuid nullable | |
| created_at | timestamptz | |

## RLS
All tables: open v1 read + write policies. Lock-down sprint replaces with `auth.uid() = user_id`.
