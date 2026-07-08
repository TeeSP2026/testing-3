# Test Plan

## Success Scenario (end-to-end)
1. Open `/members` — confirm 5 seeded members visible, no login required.
2. Search "Siti" — only MBR-00002 appears.
3. Click member → detail page shows current balance (1350 pts), category Gold.
4. Click "Log Purchase" → enter RM300 → submit.
5. Confirm: points_earned = 450 (300 × 1.5 Gold multiplier); balance = 1800 pts.
6. Hard-refresh member detail page → balance still 1800.
7. Click "Redeem" → select "RM10 Voucher" (500 pts) → confirm.
8. Confirm: balance = 1300 pts; redemption row appears in history.
9. Hard-refresh → balance still 1300.
10. Open Dashboard → "Total Points Issued" includes new transaction.

## Empty States
- New member with 0 transactions → purchase history shows "No purchases yet."
- Rewards catalogue empty → shows "No rewards configured — add one."
- Dashboard with only seed data → KPI cards show correct seeded totals, not zero.

## Error Cases
- Log purchase with amount = 0 → form validation error, no DB write.
- Redeem when balance < points_required → API returns 400, error message shown in UI, balance unchanged, no redemption row created.
- Redeem when points < minimum_redemption_points → same 400 path.
- Submit "Add Member" with duplicate mobile number → show DB error gracefully, no duplicate row.
- Network offline during purchase submit → loading state clears, error banner appears, retry button present.

## Permission Check (Sprint 6)
- Unauthenticated request to `POST /api/award-points` → 401 response.
- Management-role session: no "Log Purchase", "Add Member", or "Redeem" buttons rendered.
- Customer Service session: all write buttons visible and functional.
