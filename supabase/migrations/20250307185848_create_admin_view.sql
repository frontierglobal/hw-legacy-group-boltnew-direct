-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- Create the admin_users materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_users AS
SELECT DISTINCT ur.user_id
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE r.name = 'admin';

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_idx ON admin_users (user_id);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for user_roles
CREATE POLICY "Users can view their own roles"
ON user_roles
FOR ALL
USING (
  auth.uid() = user_id
);

CREATE POLICY "Admins can view all roles"
ON user_roles
FOR ALL
USING (
  is_admin(auth.uid())
);

-- Create trigger to refresh admin_users view
CREATE OR REPLACE FUNCTION refresh_admin_users()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_users;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_admin_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_admin_users();

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

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON admin_users TO authenticated;
GRANT SELECT ON user_roles TO authenticated;
GRANT SELECT ON investments TO authenticated;
GRANT SELECT ON documents TO authenticated;

-- Create policies for investments table
DROP POLICY IF EXISTS "Users can view their own investments" ON investments;
DROP POLICY IF EXISTS "Admins can view all investments" ON investments;

CREATE POLICY "Users can view their own investments"
ON investments
FOR ALL
USING (
  auth.uid() = user_id
);

CREATE POLICY "Admins can view all investments"
ON investments
FOR ALL
USING (
  is_admin(auth.uid())
);

-- Create policies for documents table
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON documents;

CREATE POLICY "Users can view their own documents"
ON documents
FOR ALL
USING (
  auth.uid() = user_id
);

CREATE POLICY "Admins can view all documents"
ON documents
FOR ALL
USING (
  is_admin(auth.uid())
);

-- Refresh the materialized view initially
REFRESH MATERIALIZED VIEW admin_users; 