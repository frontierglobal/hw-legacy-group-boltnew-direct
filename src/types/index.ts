export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  is_verified: boolean;
  kyc_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

export interface Role {
  id: string;
  name: string;
  created_at: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  roi: number;
  image_url: string;
  type: 'residential' | 'commercial';
  status: 'draft' | 'published' | 'archived';
  available_units: number;
  total_units: number;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  sector: string;
  location: string;
  investment_required: number;
  roi: number;
  image_url: string;
  status: 'draft' | 'published' | 'archived';
  available_investment: number;
  total_investment: number;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  amount: number;
  type: 'property' | 'business';
  target_id: string;
  start_date: string;
  end_date: string;
  interest_rate: number;
  status: 'pending' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
  property?: Property;
  business?: Business;
}

export interface Document {
  id: string;
  user_id: string;
  investment_id: string;
  name: string;
  type: 'contract' | 'kyc' | 'investment';
  status: 'pending' | 'completed';
  file_url: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  investment_id: string;
  user_id: string;
  amount: number;
  type: 'investment' | 'interest' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}