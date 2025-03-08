-- Create admin_users materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_users AS
SELECT DISTINCT u.id as user_id
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'admin';

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_admin_users()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW admin_users;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh the view when user_roles changes
DROP TRIGGER IF EXISTS refresh_admin_users_trigger ON user_roles;
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

-- Enable RLS on new tables
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies for investments
CREATE POLICY "Users can view their own investments"
    ON investments FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all investments"
    ON investments FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Create policies for documents
CREATE POLICY "Users can view their own documents"
    ON documents FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all documents"
    ON documents FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Refresh the materialized view initially
REFRESH MATERIALIZED VIEW admin_users; 