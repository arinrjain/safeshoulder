-- Create blocked_emails table for storing permanently blocked email addresses
CREATE TABLE IF NOT EXISTS blocked_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient email lookup
CREATE INDEX IF NOT EXISTS idx_blocked_emails_email ON blocked_emails(email);
