-- Standardize status enums across tables
DO $$ BEGIN
    -- Create standard status enums if they don't exist
    CREATE TYPE IF NOT EXISTS user_status AS ENUM ('active', 'inactive', 'suspended');
    CREATE TYPE IF NOT EXISTS kyc_status AS ENUM ('pending', 'approved', 'rejected');
    CREATE TYPE IF NOT EXISTS investment_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
    CREATE TYPE IF NOT EXISTS document_status AS ENUM ('pending', 'approved', 'rejected');
    CREATE TYPE IF NOT EXISTS transaction_status AS ENUM ('pending', 'completed', 'failed');
    CREATE TYPE IF NOT EXISTS audit_status AS ENUM ('success', 'failure', 'warning');

    -- Update tables to use the new enums
    ALTER TABLE users 
        ALTER COLUMN kyc_status TYPE kyc_status USING kyc_status::kyc_status;

    ALTER TABLE investments 
        ALTER COLUMN status TYPE investment_status USING status::investment_status;

    ALTER TABLE documents 
        ALTER COLUMN status TYPE document_status USING status::document_status;

    ALTER TABLE transactions 
        ALTER COLUMN status TYPE transaction_status USING status::transaction_status;

    ALTER TABLE audit_logs 
        ALTER COLUMN status TYPE audit_status USING status::audit_status;
END $$; 