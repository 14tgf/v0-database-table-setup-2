-- Migration 009: Create user_portfolio_stocks table
CREATE TABLE IF NOT EXISTS user_portfolio_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  shares NUMERIC(15, 8) NOT NULL,
  average_cost NUMERIC(15, 2),
  current_value NUMERIC(15, 2),
  gain_loss NUMERIC(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_portfolio_stocks_user_id ON user_portfolio_stocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolio_stocks_company_id ON user_portfolio_stocks(company_id);

CREATE OR REPLACE FUNCTION update_user_portfolio_stocks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_portfolio_stocks_timestamp_trigger
BEFORE UPDATE ON user_portfolio_stocks
FOR EACH ROW
EXECUTE FUNCTION update_user_portfolio_stocks_timestamp();
