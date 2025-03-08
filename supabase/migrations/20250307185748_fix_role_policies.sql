-- Drop existing role policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON roles;
  DROP POLICY IF EXISTS "Roles are manageable by admins" ON roles;
END $$;

-- Recreate role policies using materialized view
CREATE POLICY "Roles are viewable by authenticated users"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Roles are manageable by admins"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  ); 