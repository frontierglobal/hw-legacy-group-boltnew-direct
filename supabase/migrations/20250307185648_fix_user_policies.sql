-- Drop existing user policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own data" ON users;
  DROP POLICY IF EXISTS "Users can update their own data" ON users;
  DROP POLICY IF EXISTS "Admins can manage all user data" ON users;
END $$;

-- Recreate user policies using materialized view
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all user data"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  ); 