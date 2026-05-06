-- Migration 008: Create user_investments table
CREATE TABLE IF NOT EXISTS user_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES investment_plans(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  shares NUMERIC(15, 8),
  status VARCHAR(50) DEFAULT 'active',
  returns NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_investments_user_id ON user_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_plan_id ON user_investments(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_status ON user_investments(status);

CREATE OR REPLACE FUNCTION update_user_investments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_investments_timestamp_trigger
BEFORE UPDATE ON user_investments
FOR EACH ROW
EXECUTE FUNCTION update_user_investments_timestamp();
