-- Migration 010: Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES user_investments(id) ON DELETE SET NULL,
  order_type VARCHAR(50) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE OR REPLACE FUNCTION update_orders_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_timestamp_trigger
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_timestamp();
