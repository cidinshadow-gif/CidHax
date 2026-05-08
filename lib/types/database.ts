export interface Profile {
  id: string
  email: string | null
  username: string | null
  balance: number
  referral_code: string
  referred_by: string | null
  is_admin: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string | null
  is_active: boolean
  created_at: string
  stock_count?: number
}

export interface Key {
  id: string
  product_id: string
  key_value: string
  is_sold: boolean
  sold_to: string | null
  sold_at: string | null
  created_at: string
  product?: Product
}

export interface Deposit {
  id: string
  user_id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  bank_reference: string | null
  admin_note: string | null
  created_at: string
  processed_at: string | null
  user?: Profile
}

export interface Withdrawal {
  id: string
  user_id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  bank_name: string | null
  account_number: string | null
  account_name: string | null
  admin_note: string | null
  created_at: string
  processed_at: string | null
  user?: Profile
}

export interface Purchase {
  id: string
  user_id: string
  product_id: string
  key_id: string
  amount: number
  referral_commission: number
  referrer_id: string | null
  created_at: string
  product?: Product
  key?: Key
}

export interface ReferralEarning {
  id: string
  referrer_id: string
  referred_id: string
  purchase_id: string
  commission_amount: number
  created_at: string
  referred?: Profile
  purchase?: Purchase
}
