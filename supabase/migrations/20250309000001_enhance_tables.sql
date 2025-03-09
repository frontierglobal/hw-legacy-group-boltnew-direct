-- Set search path
SET search_path TO public;

-- Add additional data validation rules
ALTER TABLE businesses
    ADD CONSTRAINT chk_business_available_investment
    CHECK (available_investment <= total_investment),
    ADD CONSTRAINT chk_business_valuation
    CHECK (valuation >= total_investment);

ALTER TABLE investments
    ADD CONSTRAINT chk_investment_amount
    CHECK (amount > 0 AND amount <= 1000000000), -- Max investment of 1 billion
    ADD CONSTRAINT chk_investment_dates
    CHECK (end_date IS NULL OR end_date > start_date),
    ADD CONSTRAINT chk_investment_interest_rate
    CHECK (interest_rate >= 0 AND interest_rate <= 100); -- Max 100% interest rate

ALTER TABLE documents
    ADD CONSTRAINT chk_document_status
    CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    ADD CONSTRAINT chk_document_type
    CHECK (type IN ('contract', 'invoice', 'receipt', 'statement', 'other'));

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_properties_status_type ON properties(status, type);
CREATE INDEX IF NOT EXISTS idx_properties_price_status ON properties(price, status);
CREATE INDEX IF NOT EXISTS idx_properties_location_status ON properties USING gin(to_tsvector('english', location), status);
CREATE INDEX IF NOT EXISTS idx_properties_created_status ON properties(created_at, status);

CREATE INDEX IF NOT EXISTS idx_businesses_status_industry ON businesses(status, industry);
CREATE INDEX IF NOT EXISTS idx_businesses_valuation_status ON businesses(valuation, status);
CREATE INDEX IF NOT EXISTS idx_businesses_location_status ON businesses USING gin(to_tsvector('english', location), status);
CREATE INDEX IF NOT EXISTS idx_businesses_created_status ON businesses(created_at, status);

CREATE INDEX IF NOT EXISTS idx_investments_user_status ON investments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_investments_target_status ON investments(target_id, status);
CREATE INDEX IF NOT EXISTS idx_investments_dates ON investments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_investments_amount_status ON investments(amount, status);

CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_status_type ON transactions(status, type);
CREATE INDEX IF NOT EXISTS idx_transactions_amount_status ON transactions(amount, status);
CREATE INDEX IF NOT EXISTS idx_transactions_dates ON transactions(created_at, status);

-- Add partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(id) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(id) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_investments_active ON investments(id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pages_active ON pages(id) WHERE is_published = true;

-- Add text search indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_businesses_search ON businesses USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || industry));
CREATE INDEX IF NOT EXISTS idx_pages_search ON pages USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(meta_description, '')));

-- Add additional RLS policies
-- Properties policies
CREATE POLICY "Users can view their own draft properties"
    ON properties FOR SELECT
    TO authenticated
    USING (
        status = 'draft' AND
        EXISTS (
            SELECT 1 FROM user_roles ur
            INNER JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Users can create properties"
    ON properties FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            INNER JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- Businesses policies
CREATE POLICY "Users can view their own draft businesses"
    ON businesses FOR SELECT
    TO authenticated
    USING (
        status = 'draft' AND
        EXISTS (
            SELECT 1 FROM user_roles ur
            INNER JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Users can create businesses"
    ON businesses FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            INNER JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- Investments policies
CREATE POLICY "Users can create investments"
    ON investments FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own investments"
    ON investments FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Documents policies
CREATE POLICY "Users can view their own documents"
    ON documents FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create documents"
    ON documents FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own documents"
    ON documents FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Transactions policies
CREATE POLICY "Users can create transactions"
    ON transactions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transactions"
    ON transactions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Add function to check investment limits
CREATE OR REPLACE FUNCTION check_investment_limits()
RETURNS TRIGGER AS $$
DECLARE
    total_invested numeric;
    investment_limit numeric := 1000000; -- 1 million default limit
BEGIN
    -- Get total invested amount for the user
    SELECT COALESCE(SUM(amount), 0)
    INTO total_invested
    FROM investments
    WHERE user_id = NEW.user_id
    AND status = 'active';

    -- Check if new investment would exceed limit
    IF (total_invested + NEW.amount) > investment_limit THEN
        RAISE EXCEPTION 'Investment amount exceeds user limit of %', investment_limit;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for investment limits
CREATE TRIGGER check_investment_limits_trigger
    BEFORE INSERT OR UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION check_investment_limits();

-- Add function to log audit trail
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data,
        ip_address,
        user_agent
    )
    VALUES (
        auth.uid(),
        TG_OP::audit_action,
        TG_TABLE_NAME,
        NEW.id,
        CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        current_setting('request.headers', true)::json->>'user-agent'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add audit trail triggers
CREATE TRIGGER audit_properties
    AFTER INSERT OR UPDATE OR DELETE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_businesses
    AFTER INSERT OR UPDATE OR DELETE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_investments
    AFTER INSERT OR UPDATE OR DELETE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_documents
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_transactions
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_trail(); 