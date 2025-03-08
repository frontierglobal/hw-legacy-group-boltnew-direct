-- Ensure admin_users view exists with proper indexes
DO $$ BEGIN
    -- Recreate the materialized view
    DROP MATERIALIZED VIEW IF EXISTS admin_users;
    
    CREATE MATERIALIZED VIEW admin_users AS
    SELECT DISTINCT u.id as user_id
    FROM auth.users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    WHERE r.name = 'admin';

    -- Create unique index for concurrent refresh
    CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_user_id 
    ON admin_users(user_id);

    -- Create function to refresh the view
    CREATE OR REPLACE FUNCTION refresh_admin_users()
    RETURNS trigger AS $$
    DECLARE
        admin_role_id uuid;
    BEGIN
        -- Get admin role ID
        SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' LIMIT 1;
        
        -- Only refresh if the change involves the admin role
        IF (TG_OP = 'DELETE' AND OLD.role_id = admin_role_id) OR
           (TG_OP IN ('INSERT', 'UPDATE') AND NEW.role_id = admin_role_id) OR
           (TG_OP = 'UPDATE' AND OLD.role_id = admin_role_id)
        THEN
            REFRESH MATERIALIZED VIEW CONCURRENTLY admin_users;
        END IF;
        
        RETURN NULL;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Error refreshing admin_users view: %', SQLERRM;
            RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger to refresh the view
    DROP TRIGGER IF EXISTS refresh_admin_users_trigger ON user_roles;
    CREATE TRIGGER refresh_admin_users_trigger
        AFTER INSERT OR UPDATE OR DELETE ON user_roles
        FOR EACH ROW
        EXECUTE FUNCTION refresh_admin_users();

    -- Initial refresh
    REFRESH MATERIALIZED VIEW admin_users;
END $$; 