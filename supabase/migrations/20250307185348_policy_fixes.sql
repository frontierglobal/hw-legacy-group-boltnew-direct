-- Standardize JOIN syntax in policies
DO $$ BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Roles are manageable by admins" ON roles;
  DROP POLICY IF EXISTS "User roles are manageable by admins" ON user_roles;
  DROP POLICY IF EXISTS "Admins can manage properties" ON properties;
  DROP POLICY IF EXISTS "Admins can manage businesses" ON businesses;
  DROP POLICY IF EXISTS "Admins can manage all investments" ON investments;
  DROP POLICY IF EXISTS "Admins can manage all documents" ON documents;
  DROP POLICY IF EXISTS "Admins can manage all transactions" ON transactions;
  DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;

  -- Recreate policies with consistent INNER JOIN syntax
  CREATE POLICY "Roles are manageable by admins"
    ON roles
    FOR ALL
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  CREATE POLICY "User roles are manageable by admins"
    ON user_roles
    FOR ALL
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  CREATE POLICY "Admins can manage properties"
    ON properties
    FOR ALL
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  CREATE POLICY "Admins can manage businesses"
    ON businesses
    FOR ALL
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  CREATE POLICY "Admins can manage all investments"
    ON investments
    FOR ALL
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  CREATE POLICY "Admins can manage all documents"
    ON documents
    FOR ALL
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  CREATE POLICY "Admins can manage all transactions"
    ON transactions
    FOR ALL
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));

  CREATE POLICY "Admins can read audit logs"
    ON audit_logs
    FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    ));
END $$; 