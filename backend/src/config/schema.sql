CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  invite_code VARCHAR(32) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  phone_number VARCHAR(32) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  bio TEXT NOT NULL DEFAULT '',
  emergency_info TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  content TEXT NOT NULL,
  mood VARCHAR(20),
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS family_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE households ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE diary_entries ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_info TEXT NOT NULL DEFAULT '';
ALTER TABLE diary_entries ADD COLUMN IF NOT EXISTS entry_date DATE NOT NULL DEFAULT CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_users_household_id ON users(household_id);
CREATE INDEX IF NOT EXISTS idx_diary_user_date ON diary_entries(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_diary_shared_date ON diary_entries(is_private, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_household_pending ON family_alerts(household_id, created_at DESC) WHERE resolved_at IS NULL;
