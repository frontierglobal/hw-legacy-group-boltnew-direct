/*
  # Database Schema Migration

  1. Overview
    This migration creates the core database schema for the investment platform,
    including user management, investment tracking, and audit logging.

  2. Changes
    - Creates custom enum types for various statuses
    - Creates tables for users, roles, properties, businesses, investments, etc.
    - Enables Row Level Security (RLS) on all tables
    - Creates security policies for access control
    - Sets up audit logging and triggers

  3. Security
    - RLS enabled on all tables
    - Policies for user access control
    - Admin-specific policies
*/

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Roles policies
  DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON roles;
  DROP POLICY IF EXISTS "Roles are manageable by admins" ON roles;
  
  -- Users policies
  DROP POLICY IF EXISTS "Users can view their own data" ON users;
  DROP POLICY IF EXISTS "Users can update their own data" ON users;
  DROP POLICY IF EXISTS "Admins can manage all user data" ON users;
  
  -- User roles policies
  DROP POLICY IF EXISTS "User roles are viewable by authenticated users" ON user_roles;
  DROP POLICY IF EXISTS "User roles are manageable by admins" ON user_roles;
  
  -- Properties policies
  DROP POLICY IF EXISTS "Anyone can read published properties" ON properties;
  DROP POLICY IF EXISTS "Admins can manage properties" ON properties;
  
  -- Businesses policies
  DROP POLICY IF EXISTS "Anyone can read published businesses" ON businesses;
  DROP POLICY IF EXISTS "Admins can manage businesses" ON businesses;
  
  -- Investments policies
  DROP POLICY IF EXISTS "Users can read own investments" ON investments;
  DROP POLICY IF EXISTS "Users can create investments" ON investments;
  DROP POLICY IF EXISTS "Admins can manage all investments" ON investments;
  
  -- Documents policies
  DROP POLICY IF EXISTS "Users can read own documents" ON documents;
  DROP POLICY IF EXISTS "Users can create documents" ON documents;
  DROP POLICY IF EXISTS "Admins can manage all documents" ON documents;
  
  -- Transactions policies
  DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
  DROP POLICY IF EXISTS "Admins can manage all transactions" ON transactions;
  
  -- Audit logs policies
  DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
EXCEPTION
  WHEN undefined_table THEN null;
  WHEN undefined_object THEN null;
END $$;

-- Create custom types if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_kyc_status') THEN
    CREATE TYPE user_kyc_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
    CREATE TYPE property_type AS ENUM ('residential', 'commercial');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_status') THEN
    CREATE TYPE property_status AS ENUM ('draft', 'published', 'archived');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_status') THEN
    CREATE TYPE business_status AS ENUM ('draft', 'published', 'archived');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'investment_type') THEN
    CREATE TYPE investment_type AS ENUM ('property', 'business');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'investment_status') THEN
    CREATE TYPE investment_status AS ENUM ('pending', 'active', 'completed');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    CREATE TYPE document_type AS ENUM ('contract', 'kyc', 'investment');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
    CREATE TYPE document_status AS ENUM ('pending', 'completed');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM ('investment', 'interest', 'withdrawal');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_log_status') THEN
    CREATE TYPE audit_log_status AS ENUM ('success', 'warning', 'error');
  END IF;
END $$;

-- Create or update tables
DO $$ 
BEGIN
  -- Create roles table if it doesn't exist
  CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
  );

  -- Create users table if it doesn't exist
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    phone text,
    address text,
    is_verified boolean DEFAULT false,
    kyc_status user_kyc_status DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Create user_roles table if it doesn't exist
  CREATE TABLE IF NOT EXISTS user_roles (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
  );

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
    available_units integer DEFAULT 1,
    total_units integer DEFAULT 1,
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
    available_investment numeric DEFAULT 0,
    total_investment numeric DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Create investments table if it doesn't exist
  CREATE TABLE IF NOT EXISTS investments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    amount numeric NOT NULL CHECK (amount > 0),
    type investment_type NOT NULL,
    target_id uuid NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    interest_rate numeric NOT NULL CHECK (interest_rate > 0),
    status investment_status DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Create documents table if it doesn't exist
  CREATE TABLE IF NOT EXISTS documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    investment_id uuid REFERENCES investments(id) ON DELETE CASCADE,
    name text NOT NULL,
    type document_type NOT NULL,
    status document_status DEFAULT 'pending',
    file_url text NOT NULL,
    created_at timestamptz DEFAULT now()
  );

  -- Create transactions table if it doesn't exist
  CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    investment_id uuid REFERENCES investments(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    type transaction_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
  );

  -- Create audit_logs table if it doesn't exist
  CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE SET NULL,
    action text NOT NULL,
    details text,
    ip_address text,
    user_agent text,
    status audit_log_status DEFAULT 'success',
    created_at timestamptz DEFAULT now()
  );
END $$;

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  -- Roles policies
  CREATE POLICY "Roles are viewable by authenticated users"
    ON roles FOR SELECT TO authenticated
    USING (true);

  CREATE POLICY "Roles are manageable by admins"
    ON roles FOR ALL TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  -- Users policies
  CREATE POLICY "Users can view their own data"
    ON users FOR SELECT TO authenticated
    USING (id = auth.uid());

  CREATE POLICY "Users can update their own data"
    ON users FOR UPDATE TO authenticated
    USING (id = auth.uid());

  CREATE POLICY "Admins can manage all user data"
    ON users FOR ALL TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  -- User roles policies
  CREATE POLICY "User roles are viewable by authenticated users"
    ON user_roles FOR SELECT TO authenticated
    USING (true);

  CREATE POLICY "User roles are manageable by admins"
    ON user_roles FOR ALL TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  -- Properties policies
  CREATE POLICY "Anyone can read published properties"
    ON properties FOR SELECT
    USING (status = 'published');

  CREATE POLICY "Admins can manage properties"
    ON properties FOR ALL TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  -- Businesses policies
  CREATE POLICY "Anyone can read published businesses"
    ON businesses FOR SELECT
    USING (status = 'published');

  CREATE POLICY "Admins can manage businesses"
    ON businesses FOR ALL TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  -- Investments policies
  CREATE POLICY "Users can read own investments"
    ON investments FOR SELECT TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Users can create investments"
    ON investments FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

  CREATE POLICY "Admins can manage all investments"
    ON investments FOR ALL TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  -- Documents policies
  CREATE POLICY "Users can read own documents"
    ON documents FOR SELECT TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Users can create documents"
    ON documents FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

  CREATE POLICY "Admins can manage all documents"
    ON documents FOR ALL TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  -- Transactions policies
  CREATE POLICY "Users can read own transactions"
    ON transactions FOR SELECT TO authenticated
    USING (user_id = auth.uid());

  CREATE POLICY "Admins can manage all transactions"
    ON transactions FOR ALL TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  -- Audit logs policies
  CREATE POLICY "Admins can read audit logs"
    ON audit_logs FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));
END $$;

-- Insert default roles
INSERT INTO roles (name) VALUES ('admin'), ('user')
ON CONFLICT (name) DO NOTHING;

-- Create or replace functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id uuid,
  p_action text,
  p_details text DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
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