-- Set proper search path
SET search_path TO public, auth;

-- Drop existing objects safely
DO $$ 
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Users can read their own roles" ON user_roles;
    DROP POLICY IF EXISTS "Users can manage their own roles" ON user_roles;
    DROP POLICY IF EXISTS "Users can delete their own roles" ON user_roles;
    DROP POLICY IF EXISTS "Users can read their own investments" ON investments;
    DROP POLICY IF EXISTS "Users can manage their own investments" ON investments;
    DROP POLICY IF EXISTS "Users can update their own investments" ON investments;
    DROP POLICY IF EXISTS "Users can delete their own investments" ON investments;
    DROP POLICY IF EXISTS "Users can read their own documents" ON documents;
    DROP POLICY IF EXISTS "Users can manage their own documents" ON documents;
    DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
    DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
    DROP POLICY IF EXISTS "Anyone can read roles" ON roles;
    DROP POLICY IF EXISTS "Users can read properties" ON properties;
    DROP POLICY IF EXISTS "Users can read businesses" ON businesses;
    DROP POLICY IF EXISTS "Anyone can read pages" ON pages;
    DROP POLICY IF EXISTS "Admins can manage pages" ON pages;
    DROP POLICY IF EXISTS "Anyone can read content" ON content;
    DROP POLICY IF EXISTS "Admins can manage content" ON content;
    
    -- Drop views and functions after policies
    DROP VIEW IF EXISTS admin_users;
    DROP FUNCTION IF EXISTS is_admin(uuid);
    DROP FUNCTION IF EXISTS refresh_admin_users();
    DROP FUNCTION IF EXISTS update_updated_at_column();
EXCEPTION
    WHEN undefined_table THEN 
        NULL;
    WHEN undefined_function THEN
        NULL;
END $$;

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

-- Create properties table if it doesn't exist
CREATE TABLE IF NOT EXISTS properties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    address text NOT NULL,
    price decimal NOT NULL,
    status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'sold')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create businesses table if it doesn't exist
CREATE TABLE IF NOT EXISTS businesses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    industry text NOT NULL,
    valuation decimal NOT NULL,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
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
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT valid_target_id CHECK (
        (type = 'property' AND EXISTS (SELECT 1 FROM properties WHERE id = target_id)) OR
        (type = 'business' AND EXISTS (SELECT 1 FROM businesses WHERE id = target_id))
    )
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

-- Create pages table if it doesn't exist
CREATE TABLE IF NOT EXISTS pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create content table if it doesn't exist
CREATE TABLE IF NOT EXISTS content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    value text NOT NULL,
    updated_at timestamptz DEFAULT now()
);

-- Insert admin role if it doesn't exist
INSERT INTO roles (name) 
VALUES ('admin')
ON CONFLICT (name) DO NOTHING;

-- Get admin role id and assign to test user
DO $$
DECLARE
    admin_role_id uuid;
    test_user_id uuid := 'd642783d-4783-4197-a4b0-60c61b9e3725';
BEGIN
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
    
    -- Make test user an admin
    INSERT INTO user_roles (user_id, role_id)
    VALUES (test_user_id, admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
END $$;

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

-- Grant execute permission on is_admin function
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;

-- Create admin_users view
CREATE OR REPLACE VIEW admin_users AS
SELECT DISTINCT ur.user_id
FROM user_roles ur
JOIN roles r ON r.id = ur.role_id
WHERE r.name = 'admin';

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create default policies to deny all access
ALTER TABLE roles FORCE ROW LEVEL SECURITY;
ALTER TABLE user_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE properties FORCE ROW LEVEL SECURITY;
ALTER TABLE businesses FORCE ROW LEVEL SECURITY;
ALTER TABLE investments FORCE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON properties TO authenticated;
GRANT SELECT ON businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON investments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;
GRANT SELECT ON admin_users TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_target_id ON investments(target_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

-- Create simplified policies
CREATE POLICY "Anyone can read roles"
ON roles FOR SELECT
USING (true);

-- User roles policies
CREATE POLICY "Users can read their own roles"
ON user_roles FOR SELECT
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can manage their own roles"
ON user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can update their own roles"
ON user_roles FOR UPDATE
USING (auth.uid() = user_id OR is_admin(auth.uid()))
WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own roles"
ON user_roles FOR DELETE
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Properties policies
CREATE POLICY "Users can read properties"
ON properties FOR SELECT
USING (true);

-- Business policies
CREATE POLICY "Users can read businesses"
ON businesses FOR SELECT
USING (true);

-- Investment policies
CREATE POLICY "Users can read their own investments"
ON investments FOR SELECT
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can manage their own investments"
ON investments FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can update their own investments"
ON investments FOR UPDATE
USING (auth.uid() = user_id OR is_admin(auth.uid()))
WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own investments"
ON investments FOR DELETE
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Document policies
CREATE POLICY "Users can read their own documents"
ON documents FOR SELECT
USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can manage their own documents"
ON documents FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can update their own documents"
ON documents FOR UPDATE
USING (auth.uid() = user_id OR is_admin(auth.uid()))
WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own documents"
ON documents FOR DELETE
USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- Enable RLS on new tables
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Create default policies to deny all access
ALTER TABLE pages FORCE ROW LEVEL SECURITY;
ALTER TABLE content FORCE ROW LEVEL SECURITY;

-- Grant necessary permissions for new tables
GRANT SELECT ON pages TO authenticated;
GRANT SELECT ON content TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON content TO authenticated;

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_key ON content(key);

-- Create policies for pages
CREATE POLICY "Anyone can read pages"
ON pages FOR SELECT
USING (true);

CREATE POLICY "Admins can manage pages"
ON pages FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create policies for content
CREATE POLICY "Anyone can read content"
ON content FOR SELECT
USING (true);

CREATE POLICY "Admins can manage content"
ON content FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add home_title to content if it doesn't exist
INSERT INTO content (key, value)
VALUES ('home_title', 'Welcome to Bolt.new')
ON CONFLICT (key) DO NOTHING;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$ 
BEGIN
    CREATE TRIGGER update_roles_updated_at
        BEFORE UPDATE ON roles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_user_roles_updated_at
        BEFORE UPDATE ON user_roles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_properties_updated_at
        BEFORE UPDATE ON properties
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_businesses_updated_at
        BEFORE UPDATE ON businesses
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_investments_updated_at
        BEFORE UPDATE ON investments
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_documents_updated_at
        BEFORE UPDATE ON documents
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$; 