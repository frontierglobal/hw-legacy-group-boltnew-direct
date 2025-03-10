-- Clean setup migration
-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price > 0),
    roi NUMERIC NOT NULL CHECK (roi > 0),
    image_url TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    sector TEXT NOT NULL,
    location TEXT NOT NULL,
    investment_required NUMERIC NOT NULL CHECK (investment_required > 0),
    roi NUMERIC NOT NULL CHECK (roi > 0),
    image_url TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL,
    target_id UUID NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    interest_rate NUMERIC NOT NULL CHECK (interest_rate > 0),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create admin_users view
CREATE OR REPLACE VIEW admin_users AS
SELECT id as user_id
FROM auth.users
WHERE role = 'admin';

-- Create policies with proper error handling
DO $$
BEGIN
    -- Properties policies
    DROP POLICY IF EXISTS "Admins can manage properties" ON properties;
    CREATE POLICY "Admins can manage properties"
    ON properties
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );

    DROP POLICY IF EXISTS "Anyone can read published properties" ON properties;
    CREATE POLICY "Anyone can read published properties"
    ON properties
    FOR SELECT
    TO public
    USING (published = true);

    -- Businesses policies
    DROP POLICY IF EXISTS "Admins can manage businesses" ON businesses;
    CREATE POLICY "Admins can manage businesses"
    ON businesses
    FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );

    DROP POLICY IF EXISTS "Anyone can read published businesses" ON businesses;
    CREATE POLICY "Anyone can read published businesses"
    ON businesses
    FOR SELECT
    TO public
    USING (published = true);

    -- Investments policies
    DROP POLICY IF EXISTS "Users can manage own investments" ON investments;
    CREATE POLICY "Users can manage own investments"
    ON investments
    FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
    WITH CHECK (
        user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );

    -- Documents policies
    DROP POLICY IF EXISTS "Users can manage own documents" ON documents;
    CREATE POLICY "Users can manage own documents"
    ON documents
    FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    )
    WITH CHECK (
        user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );
END $$; 