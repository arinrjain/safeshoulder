-- Migration: Add user_name column to circle_messages
-- Description: Store user's display name with each message for quick retrieval

ALTER TABLE public.circle_messages
ADD COLUMN IF NOT EXISTS user_name TEXT DEFAULT 'Anonymous';

COMMENT ON COLUMN public.circle_messages.user_name IS 'Display name of the message sender (for quick lookup without joining auth table)';

-- Update existing messages with user_name from email
UPDATE public.circle_messages cm
SET user_name = 'Anonymous'
WHERE user_name IS NULL OR user_name = '';

-- Verify
SELECT COUNT(*) as total_messages,
       COUNT(DISTINCT user_name) as unique_authors
FROM public.circle_messages;
