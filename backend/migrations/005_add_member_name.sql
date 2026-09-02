-- Add member_name column to track user's display name at join time
ALTER TABLE public.circle_members
ADD COLUMN IF NOT EXISTS member_name TEXT DEFAULT 'Anonymous';

COMMENT ON COLUMN public.circle_members.member_name IS 'Display name captured when user joins circle';

-- Update message endpoint to use member_name instead of extracting from email
-- (This requires joining with circle_members table in the backend)
