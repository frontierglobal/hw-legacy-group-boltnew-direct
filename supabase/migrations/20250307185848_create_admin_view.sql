-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, role_id)
);

-- Create investments table if it doesn't exist
CREATE TABLE IF NOT EXISTS investments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    amount decimal NOT NULL,
    type text NOT NULL CHECK (type IN ('property', 'business')),
    target_id uuid NOT NULL,
    start_date timestamptz NOT NULL DEFAULT now(),
    end_date timestamptz,
    interest_rate decimal,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    file_url text NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert admin role if it doesn't exist
INSERT INTO roles (name) 
VALUES ('admin')
ON CONFLICT (name) DO NOTHING;

-- Drop existing policies and start fresh
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own investments" ON investments;
DROP POLICY IF EXISTS "Admins can view all investments" ON investments;
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON documents;

-- Drop existing admin view and related objects
DROP MATERIALIZED VIEW IF EXISTS admin_users CASCADE;
DROP FUNCTION IF EXISTS is_admin CASCADE;
DROP FUNCTION IF EXISTS refresh_admin_users CASCADE;

-- Create base function to check admin status
CREATE OR REPLACE FUNCTION is_admin(check_user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles ur 
        JOIN roles r ON r.id = ur.role_id 
        WHERE ur.user_id = check_user_id 
        AND r.name = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin_users view (not materialized for real-time accuracy)
CREATE OR REPLACE VIEW admin_users AS
SELECT DISTINCT ur.user_id
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE r.name = 'admin';

-- Create basic RLS policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Roles policies
CREATE POLICY "Anyone can read roles"
ON roles FOR SELECT
TO authenticated
USING (true);

-- User roles policies
CREATE POLICY "Users can read their own roles"
ON user_roles FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR 
    is_admin(auth.uid())
);

-- Investments policies
CREATE POLICY "Users can manage their own investments"
ON investments FOR ALL
TO authenticated
USING (
    user_id = auth.uid() OR 
    is_admin(auth.uid())
);

-- Documents policies
CREATE POLICY "Users can manage their own documents"
ON documents FOR ALL
TO authenticated
USING (
    user_id = auth.uid() OR 
    is_admin(auth.uid())
);

-- Grant necessary permissions
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON investments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;
GRANT SELECT ON admin_users TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id); 