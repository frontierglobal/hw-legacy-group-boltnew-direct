-- Set up the search path
SET search_path TO public;

-- Function to drop user_roles table if it exists
CREATE OR REPLACE FUNCTION drop_user_roles_if_exists()
RETURNS void AS $$
BEGIN
    DROP TABLE IF EXISTS user_roles;
    RAISE NOTICE 'Dropped user_roles table if it existed';
END;
$$ LANGUAGE plpgsql;

-- Function to add role column to users table if it doesn't exist
CREATE OR REPLACE FUNCTION add_role_column_if_not_exists()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
        RAISE NOTICE 'Added role column to users table';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create content table
CREATE OR REPLACE FUNCTION create_content_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS content (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
    );
    
    ALTER TABLE content ENABLE ROW LEVEL SECURITY;
    
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
        
    RAISE NOTICE 'Created content table with RLS policies';
END;
$$ LANGUAGE plpgsql;

-- Function to create pages table
CREATE OR REPLACE FUNCTION create_pages_table()
RETURNS void AS $$
BEGIN
    CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
    
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
        
    RAISE NOTICE 'Created pages table with RLS policies';
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION drop_user_roles_if_exists() TO authenticated;
GRANT EXECUTE ON FUNCTION add_role_column_if_not_exists() TO authenticated;
GRANT EXECUTE ON FUNCTION create_content_table() TO authenticated;
GRANT EXECUTE ON FUNCTION create_pages_table() TO authenticated; 