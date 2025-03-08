/*
  # Complete Schema Setup

  1. Custom Types
    - user_kyc_status: Status of user KYC verification
    - property_type: Type of property (residential/commercial)
    - property_status: Status of property listing
    - business_status: Status of business listing
    - investment_type: Type of investment
    - investment_status: Status of investment
    - document_type: Type of document
    - document_status: Status of document
    - transaction_type: Type of transaction
    - transaction_status: Status of transaction
    - audit_log_status: Status of audit log entry

  2. Tables
    - properties: Property listings
    - businesses: Business listings
    - investments: User investments
    - documents: User and investment documents
    - transactions: Investment transactions
    - audit_logs: System audit logs

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Create custom types if they don't exist
DO $$ BEGIN
  CREATE TYPE user_kyc_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE property_type AS ENUM ('residential', 'commercial');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE property_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE business_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE investment_type AS ENUM ('property', 'business');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE investment_status AS ENUM ('pending', 'active', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM ('contract', 'kyc', 'investment');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('pending', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('investment', 'interest', 'withdrawal');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE audit_log_status AS ENUM ('success', 'warning', 'error');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create properties table if it doesn't exist
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  roi numeric NOT NULL CHECK (roi > 0),
  image_url text,
  type property_type NOT NULL,
  status property_status DEFAULT 'draft',
  available_units integer NOT NULL DEFAULT 0,
  total_units integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create businesses table if it doesn't exist
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sector text NOT NULL,
  location text NOT NULL,
  investment_required numeric NOT NULL CHECK (investment_required > 0),
  roi numeric NOT NULL CHECK (roi > 0),
  image_url text,
  status business_status DEFAULT 'draft',
  available_investment numeric NOT NULL DEFAULT 0,
  total_investment numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create investments table if it doesn't exist
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  type investment_type NOT NULL,
  target_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  interest_rate numeric NOT NULL CHECK (interest_rate > 0),
  status investment_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id uuid REFERENCES investments(id) ON DELETE CASCADE,
  name text NOT NULL,
  type document_type NOT NULL,
  status document_status DEFAULT 'pending',
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_id uuid REFERENCES investments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type transaction_type NOT NULL,
  status transaction_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details text,
  ip_address text,
  user_agent text,
  status audit_log_status DEFAULT 'success',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read published properties" ON properties;
  DROP POLICY IF EXISTS "Admins can CRUD properties" ON properties;
  DROP POLICY IF EXISTS "Anyone can read published businesses" ON businesses;
  DROP POLICY IF EXISTS "Admins can CRUD businesses" ON businesses;
  DROP POLICY IF EXISTS "Users can read own investments" ON investments;
  DROP POLICY IF EXISTS "Users can create investments" ON investments;
  DROP POLICY IF EXISTS "Users can read own documents" ON documents;
  DROP POLICY IF EXISTS "Users can create documents" ON documents;
  DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
  DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
END $$;

-- Create policies for properties
CREATE POLICY "Anyone can read published properties" ON properties
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can CRUD properties" ON properties
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ));

-- Create policies for businesses
CREATE POLICY "Anyone can read published businesses" ON businesses
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can CRUD businesses" ON businesses
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ));

-- Create policies for investments
CREATE POLICY "Users can read own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for documents
CREATE POLICY "Users can read own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Users can read own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Create policies for audit logs
CREATE POLICY "Admins can read audit logs" ON audit_logs
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin'
  ));

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
  DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
  DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
  DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
  
  CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
    
  CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
    
  CREATE TRIGGER update_investments_updated_at
    BEFORE UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
    
  CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
END $$;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id uuid,
  p_action text,
  p_details text,
  p_ip_address text,
  p_user_agent text,
  p_status audit_log_status DEFAULT 'success'
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    details,
    ip_address,
    user_agent,
    status
  ) VALUES (
    p_user_id,
    p_action,
    p_details,
    p_ip_address,
    p_user_agent,
    p_status
  );
END;
$$ LANGUAGE plpgsql;