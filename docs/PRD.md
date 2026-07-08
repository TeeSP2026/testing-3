# PRD — Membership Management System

## Problem
The team manages member records, loyalty points, category upgrades, and redemptions across disconnected spreadsheets and chat. There is no single source of truth, causing errors in point balances and missed category upgrades.

## Target Users
Customer Service staff (daily data entry), Marketing (category & reward config), Management (read-only reporting), Administrator (full access).

## Core Objects
- **Member** — profile, points balance, annual spend, category, status
- **Membership Category** — Silver / Gold / Platinum with spend thresholds and point multipliers
- **Transaction** — purchase record that auto-awards points
- **Redemption** — points-for-reward record that deducts balance
- **Audit Log** — immutable record of every state change

## MVP Must-Haves (v1)
- [ ] Add / edit member; set Active/Inactive; search by ID, name, mobile, email
- [ ] Record purchase transaction → auto-calculate and credit points (RM1 = 1 pt × category multiplier)
- [ ] Redeem points form → validate balance, deduct, log redemption
- [ ] View point-earning history and redemption history per member
- [ ] Membership categories CRUD (name, spend thresholds, multiplier, benefits)
- [ ] Operational dashboard: total members, active, points issued, points redeemed, top 10 spenders
- [ ] Seed demo data visible without login

## Non-Goals (v1)
- User authentication and role enforcement
- Automatic category upgrade/downgrade engine
- Point expiry
- CSV export / POS API integration

## Definition of Done
A new purchase transaction recorded for MBR-0002 awards the correct Gold-multiplied points, the member's balance updates immediately on their profile page, and a redemption for that member correctly deducts 200 points and shows the new balance — all persisted to the database and visible after a hard refresh.
