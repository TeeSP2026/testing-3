export interface MembershipCategory {
  id: string;
  name: string;
  min_annual_spend: number;
  max_annual_spend: number | null;
  point_multiplier: number;
  benefits: string | null;
  created_at: string;
}

export interface Member {
  id: string;
  member_id: string;
  full_name: string;
  nickname: string | null;
  gender: string | null;
  date_of_birth: string | null;
  mobile_number: string | null;
  email_address: string | null;
  address: string | null;
  ic_number: string | null;
  state: string | null;
  town_area: string | null;
  referred_by: string | null;
  consent: boolean;
  registration_date: string;
  category_id: string | null;
  current_points_balance: number;
  annual_spend: number;
  status: "Active" | "Inactive" | "Pending";
  created_at: string;
}

export interface MemberWithCategory extends Member {
  membership_categories: MembershipCategory | null;
}

export interface PointTransaction {
  id: string;
  transaction_no: string;
  transaction_date: string;
  member_id: string;
  purchase_amount: number;
  points_earned: number;
  multiplier_applied: number;
  category_at_time: string | null;
  remarks: string | null;
  created_at: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  minimum_redemption_points: number;
  is_active: boolean;
  created_at: string;
}

export interface Redemption {
  id: string;
  redemption_id: string;
  redemption_date: string;
  member_id: string;
  reward_id: string;
  points_redeemed: number;
  points_balance_after: number;
  status: string;
  processed_by: string | null;
  created_at: string;
}

export interface RedemptionWithReward extends Redemption {
  rewards: Reward | null;
}

export interface AuditLog {
  id: string;
  action: string;
  target_table: string;
  target_id: string | null;
  performed_by: string | null;
  before_state: unknown;
  after_state: unknown;
  created_at: string;
}
