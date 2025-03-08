-- Drop existing audit log policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;
END $$;

-- Recreate audit log policies using materialized view
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  ); 