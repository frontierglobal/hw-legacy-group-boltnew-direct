-- Drop existing policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can manage properties" ON properties;
  DROP POLICY IF EXISTS "Admins can manage businesses" ON businesses;
  DROP POLICY IF EXISTS "Admins can manage all investments" ON investments;
  DROP POLICY IF EXISTS "Admins can manage all documents" ON documents;
  DROP POLICY IF EXISTS "Admins can manage all transactions" ON transactions;
  DROP POLICY IF EXISTS "Property images are manageable by admins" ON property_images;
  DROP POLICY IF EXISTS "Property documents are manageable by admins" ON property_documents;
END $$;

-- Recreate policies using materialized view
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

CREATE POLICY "Admins can manage all investments"
  ON investments FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all documents"
  ON documents FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Property images are manageable by admins"
  ON property_images FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Property documents are manageable by admins"
  ON property_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  ); 