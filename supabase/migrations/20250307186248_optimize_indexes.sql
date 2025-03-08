-- Add indexes for better query performance
DO $$ BEGIN
    -- Indexes for user_roles table (frequently used in admin checks)
    CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
    CREATE INDEX IF NOT EXISTS idx_user_roles_composite ON user_roles(user_id, role_id);

    -- Indexes for investments table
    CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
    CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
    CREATE INDEX IF NOT EXISTS idx_investments_type ON investments(type);
    CREATE INDEX IF NOT EXISTS idx_investments_target_id ON investments(target_id);

    -- Indexes for documents table
    CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
    CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

    -- Indexes for transactions table
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_investment_id ON transactions(investment_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

    -- Indexes for audit_logs table
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

    -- Indexes for users table
    CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
    CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
END $$; 