-- Fix policies for documents and investments tables
DO $$ 
DECLARE
    admin_role_id uuid;
BEGIN
    -- Check if get_admin_role_id function exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_proc 
        WHERE proname = 'get_admin_role_id'
    ) THEN
        RAISE EXCEPTION 'get_admin_role_id function does not exist';
    END IF;

    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can read own documents" ON documents;
    DROP POLICY IF EXISTS "Users can manage own documents" ON documents;
    DROP POLICY IF EXISTS "Users can read own investments" ON investments;
    DROP POLICY IF EXISTS "Users can manage own investments" ON investments;

    -- Create new policies for documents
    CREATE POLICY "Users can read own documents"
        ON documents FOR SELECT
        TO authenticated
        USING (
            user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid() 
                AND role_id = get_admin_role_id()
            )
        );

    CREATE POLICY "Users can manage own documents"
        ON documents FOR ALL
        TO authenticated
        USING (
            user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid() 
                AND role_id = get_admin_role_id()
            )
        );

    -- Create new policies for investments
    CREATE POLICY "Users can read own investments"
        ON investments FOR SELECT
        TO authenticated
        USING (
            user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid() 
                AND role_id = get_admin_role_id()
            )
        );

    CREATE POLICY "Users can manage own investments"
        ON investments FOR ALL
        TO authenticated
        USING (
            user_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid() 
                AND role_id = get_admin_role_id()
            )
        );

    -- Ensure RLS is enabled
    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
    ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error fixing table policies: %', SQLERRM;
END $$; 