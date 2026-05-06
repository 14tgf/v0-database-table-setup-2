-- Migration 007: Create investment_plans table
CREATE TABLE IF NOT EXISTS investment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_name VARCHAR(255) NOT NULL,
  description TEXT,
  min_investment NUMERIC(15, 2) NOT NULL,
  max_investment NUMERIC(15, 2),
  expected_return NUMERIC(5, 2),
  duration_months INTEGER,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_investment_plans_company_id ON investment_plans(company_id);
CREATE INDEX IF NOT EXISTS idx_investment_plans_status ON investment_plans(status);

CREATE OR REPLACE FUNCTION update_investment_plans_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_investment_plans_timestamp_trigger
BEFORE UPDATE ON investment_plans
FOR EACH ROW
EXECUTE FUNCTION update_investment_plans_timestamp();
