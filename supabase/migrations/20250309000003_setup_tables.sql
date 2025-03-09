-- Set up the search path
SET search_path TO public;

-- Drop user_roles table if exists
DO $$ 
BEGIN
    DROP TABLE IF EXISTS user_roles;
    RAISE NOTICE 'Dropped user_roles table';
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'user_roles table did not exist';
END $$;

-- Add role column to users table if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
    RAISE NOTICE 'Added role column to users table';
EXCEPTION
    WHEN duplicate_column THEN
        RAISE NOTICE 'role column already exists in users table';
END $$;

-- Create content table if it doesn't exist
CREATE TABLE IF NOT EXISTS content (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create pages table if it doesn't exist
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

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
        (SELECT role = 'admin' FROM users WHERE id = auth.uid())
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
        (SELECT role = 'admin' FROM users WHERE id = auth.uid())
    );

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

-- Grant permissions
GRANT USAGE ON SEQUENCE content_id_seq TO public;
GRANT USAGE ON SEQUENCE pages_id_seq TO public;
GRANT ALL ON content TO authenticated;
GRANT ALL ON pages TO authenticated;
GRANT SELECT ON content TO anon;
GRANT SELECT ON pages TO anon; 