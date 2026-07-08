# Test Plan

## v1 Success Scenario (manual walkthrough)

### 1. View demo data without login
- Open `/members` — confirm 5 seed members visible.
- Open `/categories` — confirm Silver, Gold, Platinum rows.
- Open `/` dashboard — confirm KPI cards show non-zero values.
- **Pass:** No login prompt; data renders in under 3 s.

### 2. Add a new member
- Go to `/members/new`, fill all required fields, submit.
- **Pass:** New member appears in `/members` list after hard refresh with a unique MBR-XXXX ID.
- **Empty state check:** Open `/members/new` and submit with blank required fields — inline validation errors appear, no DB write.

### 3. Record a purchase transaction (core engine)
- Open `/transactions/new`, select MBR-0002 (Gold, multiplier 1.5), enter RM200.
- **Pass:** `points_earned = 300`; MBR-0002 `points_balance` increases by 300; transaction row visible in member's history after refresh.
- **Error case:** Enter a negative purchase amount — form rejects with error, no DB write.

### 4. Redeem points
- Open `/redemptions/new`, select MBR-0002, enter reward "RM30 Voucher", points 300.
- **Pass:** Redemption row created; MBR-0002 balance decreases by 300; redemption history shows new row.
- **Error case:** Enter points > current balance — inline error "Insufficient points balance"; no DB write; balance unchanged after refresh.

### 5. Edit member status
- Open MBR-0005 (Inactive), toggle to Active, save.
- **Pass:** Status badge shows Active on member list after hard refresh.

### 6. Dashboard accuracy
- Record a new transaction (step 3). Check dashboard "Total Points Issued" KPI.
- **Pass:** KPI value increases by the points just awarded.

## Empty / Error States Checklist
| Screen | Empty state | Error state |
|---|---|---|
| Members list | "No members found" message | DB error toast |
| Member history | "No transactions yet" | DB error toast |
| Redemption history | "No redemptions yet" | DB error toast |
| Dashboard widgets | "No data" placeholder | Widget-level error |
| Transaction form | — | Negative amount rejected; unknown member rejected |
| Redemption form | — | Insufficient points rejected |
