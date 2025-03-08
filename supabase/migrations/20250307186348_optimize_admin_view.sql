-- Optimize admin_users materialized view refresh strategy
DO $$ BEGIN
    -- Drop existing trigger and function
    DROP TRIGGER IF EXISTS refresh_admin_users_trigger ON user_roles;
    DROP FUNCTION IF EXISTS refresh_admin_users();

    -- Create unique index on admin_users for concurrent refresh
    CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

    -- Create improved refresh function with concurrency support
    CREATE OR REPLACE FUNCTION refresh_admin_users()
    RETURNS trigger AS $$
    BEGIN
        -- Use CONCURRENTLY to allow reads during refresh
        REFRESH MATERIALIZED VIEW CONCURRENTLY admin_users;
        RETURN NULL;
    EXCEPTION
        WHEN OTHERS THEN
            -- Log error but don't fail the transaction
            RAISE WARNING 'Error refreshing admin_users view: %', SQLERRM;
            RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    -- Create new trigger with better timing
    CREATE TRIGGER refresh_admin_users_trigger
        AFTER INSERT OR UPDATE OR DELETE ON user_roles
        FOR EACH STATEMENT
        WHEN (OLD.role_id IN (SELECT id FROM roles WHERE name = 'admin') OR 
              NEW.role_id IN (SELECT id FROM roles WHERE name = 'admin'))
        EXECUTE FUNCTION refresh_admin_users();

    -- Initial refresh of the view
    REFRESH MATERIALIZED VIEW CONCURRENTLY admin_users;
END $$; 