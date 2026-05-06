-- Migration: Create VIP Plans and User VIP Memberships tables

-- VIP Plans table
CREATE TABLE IF NOT EXISTS vip_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  tier_level INTEGER NOT NULL UNIQUE,
  description TEXT,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  price NUMERIC(15, 2) NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 365,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User VIP Memberships table
CREATE TABLE IF NOT EXISTS user_vip_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vip_plan_id UUID NOT NULL REFERENCES vip_plans(id),
  tier_level INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled, upgraded
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, status) WHERE status = 'active'
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vip_plans_active ON vip_plans(active);
CREATE INDEX IF NOT EXISTS idx_vip_plans_tier_level ON vip_plans(tier_level);
CREATE INDEX IF NOT EXISTS idx_user_vip_memberships_user_id ON user_vip_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vip_memberships_status ON user_vip_memberships(status);
CREATE INDEX IF NOT EXISTS idx_user_vip_memberships_expires_at ON user_vip_memberships(expires_at);

-- Create trigger to update updated_at timestamp on vip_plans table
CREATE OR REPLACE FUNCTION update_vip_plans_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vip_plans_timestamp_trigger ON vip_plans;
CREATE TRIGGER update_vip_plans_timestamp_trigger
BEFORE UPDATE ON vip_plans
FOR EACH ROW
EXECUTE FUNCTION update_vip_plans_timestamp();

-- Create trigger to update updated_at timestamp on user_vip_memberships table
CREATE OR REPLACE FUNCTION update_user_vip_memberships_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_vip_memberships_timestamp_trigger ON user_vip_memberships;
CREATE TRIGGER update_user_vip_memberships_timestamp_trigger
BEFORE UPDATE ON user_vip_memberships
FOR EACH ROW
EXECUTE FUNCTION update_user_vip_memberships_timestamp();
