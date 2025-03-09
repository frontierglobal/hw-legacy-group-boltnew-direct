-- Set search path
SET search_path TO public;

-- Drop existing tables and policies safely
DO $$ 
BEGIN
    -- Drop policies first
    DROP POLICY IF EXISTS "Users can view their own draft properties" ON properties;
    DROP POLICY IF EXISTS "Users can create properties" ON properties;
    DROP POLICY IF EXISTS "Users can view their own draft businesses" ON businesses;
    DROP POLICY IF EXISTS "Users can create businesses" ON businesses;
    DROP POLICY IF EXISTS "Users can create investments" ON investments;
    DROP POLICY IF EXISTS "Users can update their own investments" ON investments;
    DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
    DROP POLICY IF EXISTS "Users can create documents" ON documents;
    DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
    DROP POLICY IF EXISTS "Users can create transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;

    -- Drop tables
    DROP TABLE IF EXISTS user_roles CASCADE;
    DROP TABLE IF EXISTS content CASCADE;
    DROP TABLE IF EXISTS pages CASCADE;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Create content table
CREATE TABLE IF NOT EXISTS content (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add role column to users if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- Insert test data
INSERT INTO content (key, value) 
VALUES ('home_title', 'Welcome to HW Legacy')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value,
    updated_at = NOW();

INSERT INTO pages (title, slug, content) 
VALUES ('About', 'about', 'About page')
ON CONFLICT (slug) DO UPDATE 
SET title = EXCLUDED.title,
    content = EXCLUDED.content;

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Content is viewable by everyone"
    ON content FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Content is manageable by admins"
    ON content FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Pages are viewable by everyone"
    ON pages FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Pages are manageable by admins"
    ON pages FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin TO authenticated; 