-- Migration: Create circles and circle messages tables
-- Description: Implement community circles feature with shared messaging
-- Date: 2026-08-30

-- ============================================================================
-- Create circles table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.circles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  focus TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.circles IS 'Community support circles where teens can connect and support each other';
COMMENT ON COLUMN public.circles.name IS 'Circle name (e.g., "Social Anxiety Support Squad")';
COMMENT ON COLUMN public.circles.emoji IS 'Circle emoji icon';
COMMENT ON COLUMN public.circles.focus IS 'What the circle focuses on (e.g., "Social anxiety, shyness, making friends")';

-- ============================================================================
-- Create circle members table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.circle_members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  circle_id BIGINT NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'ambassador', 'creator')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_circle_member UNIQUE(circle_id, user_id)
);

COMMENT ON TABLE public.circle_members IS 'Tracks membership in circles and member roles';
COMMENT ON COLUMN public.circle_members.role IS 'member = regular member, ambassador = circle leader, creator = circle founder';

-- ============================================================================
-- Create circle messages table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.circle_messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  circle_id BIGINT NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.circle_messages IS 'Messages sent in circles - visible to all circle members';
COMMENT ON COLUMN public.circle_messages.content IS 'Message text content';

-- ============================================================================
-- Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON public.circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON public.circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_messages_circle_id ON public.circle_messages(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_messages_user_id ON public.circle_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_messages_created_at ON public.circle_messages(created_at DESC);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for circles table
-- ============================================================================
-- Policy: Anyone can view circles
DROP POLICY IF EXISTS "Allow all to view circles" ON public.circles;
CREATE POLICY "Allow all to view circles" ON public.circles
  FOR SELECT
  USING (true);

-- ============================================================================
-- RLS Policies for circle_members table
-- ============================================================================
-- Policy: Users can view members of circles they're in
DROP POLICY IF EXISTS "Members can view circle members" ON public.circle_members;
CREATE POLICY "Members can view circle members" ON public.circle_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.circle_members cm
      WHERE cm.circle_id = circle_members.circle_id
      AND cm.user_id = auth.uid()
    )
  );

-- Policy: Users can join circles
DROP POLICY IF EXISTS "Allow users to join circles" ON public.circle_members;
CREATE POLICY "Allow users to join circles" ON public.circle_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- RLS Policies for circle_messages table
-- ============================================================================
-- Policy: Only circle members can view messages
DROP POLICY IF EXISTS "Members can view circle messages" ON public.circle_messages;
CREATE POLICY "Members can view circle messages" ON public.circle_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_members.circle_id = circle_messages.circle_id
      AND circle_members.user_id = auth.uid()
    )
  );

-- Policy: Circle members can send messages
DROP POLICY IF EXISTS "Members can insert circle messages" ON public.circle_messages;
CREATE POLICY "Members can insert circle messages" ON public.circle_messages
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_members.circle_id = circle_messages.circle_id
      AND circle_members.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Insert sample circles (optional - can be removed if not needed)
-- ============================================================================
INSERT INTO public.circles (name, emoji, focus, description) VALUES
  ('Social Anxiety Support Squad', '😰', 'Social anxiety, shyness, making friends', 'A safe space for teens dealing with social anxiety to share experiences and support each other.'),
  ('Bullying Survivors'' Circle', '💪', 'Bullying, harassment, recovery', 'For teens who have experienced bullying. Share stories, strategies, and find strength in community.'),
  ('New at School Support', '🆕', 'New student challenges, fitting in', 'Just joined a new school? Connect with others navigating the same transition.'),
  ('LGBTQ+ Peer Support', '🌈', 'Identity, acceptance, belonging', 'A confidential space for LGBTQ+ teens to connect and support each other.'),
  ('Academic Stress & Pressure', '📚', 'Exam pressure, grades, college stress', 'Dealing with academic pressure? Share tips and support each other through stressful times.'),
  ('Self-Esteem & Body Image', '💜', 'Body image, self-worth, confidence', 'Building confidence and self-love in a supportive community.')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Migration verification query
-- ============================================================================
-- Run this to verify the migration was successful:
-- SELECT COUNT(*) as circles_count FROM public.circles;
-- SELECT COUNT(*) as members_count FROM public.circle_members;
-- SELECT COUNT(*) as messages_count FROM public.circle_messages;
