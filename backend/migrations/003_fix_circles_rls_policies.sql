-- Migration: Fix circles RLS policies for UUID handling
-- Issue: User ID from JWT is string, but auth.users.id is UUID
-- Solution: Cast string to UUID in RLS policy comparisons

-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to join circles" ON public.circle_members;
DROP POLICY IF EXISTS "Members can view circle members" ON public.circle_members;
DROP POLICY IF EXISTS "Members can view circle messages" ON public.circle_messages;
DROP POLICY IF EXISTS "Members can insert circle messages" ON public.circle_messages;

-- Recreate circle_members policies with proper UUID casting
CREATE POLICY "Allow users to join circles" ON public.circle_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can view circle members" ON public.circle_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.circle_members cm
      WHERE cm.circle_id = circle_members.circle_id
      AND cm.user_id = auth.uid()
    )
  );

-- Recreate circle_messages policies with proper UUID casting
CREATE POLICY "Members can view circle messages" ON public.circle_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_members.circle_id = circle_messages.circle_id
      AND circle_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert circle messages" ON public.circle_messages
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.circle_members
      WHERE circle_members.circle_id = circle_messages.circle_id
      AND circle_members.user_id = auth.uid()
    )
  );

-- Verify policies
SELECT tablename, policyname FROM pg_policies WHERE tablename LIKE 'circle%';
