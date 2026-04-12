export type User = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  referral_code: string;
  upline_id: string | null;
  balance: number;
  pending_balance: number;
  task_balance: number;
  referral_balance: number;
  indirect_balance: number;
  total_referrals: number;
  referrals_since_withdrawal: number;
  is_verified: boolean;
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  platform: string;
  reward: number;
  content: string | null;
  is_active: boolean;
  created_at: string;
};

export type TaskCompletion = {
  id: string;
  user_id: string;
  task_id: string;
  date: string;
  proof: string | null;
  status: string;
  completed_at: string;
};

export type Referral = {
  id: string;
  upline_id: string;
  downline_id: string;
  amount: number;
  created_at: string;
};

export type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: string;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  is_used: boolean;
  used_by: string | null;
  created_at: string;
};