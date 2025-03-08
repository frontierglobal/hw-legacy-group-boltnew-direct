-- Fix recursive policies by using a materialized admin view
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_users AS
SELECT DISTINCT ur.user_id
FROM user_roles ur
INNER JOIN roles r ON r.id = ur.role_id
WHERE r.name = 'admin';

-- Create function to refresh admin users view
CREATE OR REPLACE FUNCTION refresh_admin_users()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_users;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh admin users view
DROP TRIGGER IF EXISTS refresh_admin_users_trigger ON user_roles;
CREATE TRIGGER refresh_admin_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_admin_users();

-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "User roles are manageable by admins" ON user_roles;
  DROP POLICY IF EXISTS "Admins can manage properties" ON properties;
  DROP POLICY IF EXISTS "Admins can manage businesses" ON businesses;
  DROP POLICY IF EXISTS "Admins can manage all investments" ON investments;
  DROP POLICY IF EXISTS "Admins can manage all documents" ON documents;
  DROP POLICY IF EXISTS "Admins can manage all transactions" ON transactions;
END $$;

-- Recreate policies using materialized view
CREATE POLICY "User roles are viewable by authenticated users"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "User roles are manageable by admins"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage properties"
  ON properties FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage businesses"
  ON businesses FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can read own investments"
  ON investments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own investments"
  ON investments FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can read own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own documents"
  ON documents FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Initial refresh of admin users view
REFRESH MATERIALIZED VIEW admin_users; 