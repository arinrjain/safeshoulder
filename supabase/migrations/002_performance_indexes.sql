-- Performance optimization: Add missing indexes for frequently queried columns
-- Date: 2026-06-08
-- Updated: 2026-06-09 (adjusted for actual production schema)

-- ✅ APPLIED TO PRODUCTION:

-- Index on users.created_at for admin stats queries
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Index on messages.created_at for chat history and stats
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Composite index on sessions for domain queries
CREATE INDEX IF NOT EXISTS idx_sessions_domain_created ON sessions(domain, created_at DESC);

-- Index on credit_orders for admin stats (status + created_at)
CREATE INDEX IF NOT EXISTS idx_credit_orders_status_created ON credit_orders(status, created_at DESC);

-- Composite index on user_domain_profiles for frequent lookups
CREATE INDEX IF NOT EXISTS idx_user_domain_profiles_user_domain ON user_domain_profiles(user_id, domain);

-- Index on messages.session_id for chat history lookups
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);

-- ❌ NOT APPLIED (schema mismatch):
-- CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
-- Reason: subscriptions table does not exist in production schema

-- CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
-- Reason: sessions table does not have user_id column in production schema

-- CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
-- Reason: messages table does not have user_id column in production schema
