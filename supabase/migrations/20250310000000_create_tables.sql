-- Set up the search path
SET search_path TO public;

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

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL,
    target_id UUID,
    start_date DATE,
    end_date DATE,
    interest_rate DECIMAL(5,2),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add role column to users table if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END $$;

-- Create admin_users view
CREATE OR REPLACE VIEW admin_users AS
SELECT id as user_id
FROM auth.users
WHERE role = 'admin';

-- Drop user_roles table if exists
DROP TABLE IF EXISTS user_roles;

-- Insert test data
INSERT INTO content (key, value)
VALUES ('home_title', 'Welcome to HW Legacy')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;

INSERT INTO pages (title, slug, content)
VALUES ('About', 'about', 'About page')
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    content = EXCLUDED.content;

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow public read access" ON content;
CREATE POLICY "Allow public read access" ON content
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage content" ON content;
CREATE POLICY "Allow authenticated users to manage content" ON content
    FOR ALL
    TO authenticated
    USING (
        (SELECT role = 'admin' FROM auth.users WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Allow public read access" ON pages;
CREATE POLICY "Allow public read access" ON pages
    FOR SELECT
    TO public
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage pages" ON pages;
CREATE POLICY "Allow authenticated users to manage pages" ON pages
    FOR ALL
    TO authenticated
    USING (
        (SELECT role = 'admin' FROM auth.users WHERE id = auth.uid())
    );

-- Document policies
DROP POLICY IF EXISTS "Allow users to view own documents" ON documents;
CREATE POLICY "Allow users to view own documents" ON documents
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR (SELECT role = 'admin' FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Allow users to manage own documents" ON documents;
CREATE POLICY "Allow users to manage own documents" ON documents
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid() OR (SELECT role = 'admin' FROM auth.users WHERE id = auth.uid()));

-- Investment policies
DROP POLICY IF EXISTS "Allow users to view own investments" ON investments;
CREATE POLICY "Allow users to view own investments" ON investments
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR (SELECT role = 'admin' FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Allow users to manage own investments" ON investments;
CREATE POLICY "Allow users to manage own investments" ON investments
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid() OR (SELECT role = 'admin' FROM auth.users WHERE id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_content_updated_at ON content;
CREATE TRIGGER update_content_updated_at
    BEFORE UPDATE ON content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at
    BEFORE UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Grant permissions
GRANT USAGE ON SEQUENCE content_id_seq TO public;
GRANT USAGE ON SEQUENCE pages_id_seq TO public;
GRANT ALL ON content TO authenticated;
GRANT ALL ON pages TO authenticated;
GRANT ALL ON documents TO authenticated;
GRANT ALL ON investments TO authenticated;
GRANT SELECT ON content TO anon;
GRANT SELECT ON pages TO anon;
GRANT SELECT ON admin_users TO authenticated; 