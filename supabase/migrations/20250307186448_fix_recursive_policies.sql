-- Create base admin role ID function first
CREATE OR REPLACE FUNCTION get_admin_role_id()
RETURNS uuid AS $$
DECLARE
    admin_role_id uuid;
BEGIN
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' LIMIT 1;
    RETURN admin_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix recursive policies
DO $$ BEGIN
    -- Drop existing policies that might cause recursion
    DROP POLICY IF EXISTS "User roles are viewable by authenticated users" ON user_roles;
    DROP POLICY IF EXISTS "User roles are manageable by admins" ON user_roles;
    
    -- Create new non-recursive policies
    CREATE POLICY "User roles are viewable by authenticated users"
        ON user_roles FOR SELECT
        TO authenticated
        USING (
            user_id = auth.uid() OR 
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid() 
                AND role_id = get_admin_role_id()
            )
        );

    CREATE POLICY "User roles are manageable by admins"
        ON user_roles FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid() 
                AND role_id = get_admin_role_id()
            )
        );

    -- Refresh admin_users view to ensure it's up to date
    REFRESH MATERIALIZED VIEW admin_users;
END $$; 