-- Story entries table (journal/diary)
create table public.story_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null check (category in ('bullying', 'growth', 'win')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.story_entries enable row level security;
create policy "Users can manage own entries" on public.story_entries
  for all using (auth.uid() = user_id);

-- Story shares table (track what was shared with whom and when)
create table public.story_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  teacher_email text not null,
  teacher_name text,
  entry_ids uuid[] not null,
  report_type text not null default 'incident_report',
  shared_at timestamptz not null default now(),
  read_at timestamptz,
  access_token text unique,
  created_at timestamptz not null default now()
);

alter table public.story_shares enable row level security;
create policy "Users can view own shares" on public.story_shares
  for select using (auth.uid() = user_id);
create policy "Users can create own shares" on public.story_shares
  for insert with check (auth.uid() = user_id);

-- Indexes for performance
create index idx_story_entries_user_id on public.story_entries(user_id);
create index idx_story_entries_created_at on public.story_entries(created_at desc);
create index idx_story_shares_user_id on public.story_shares(user_id);
create index idx_story_shares_created_at on public.story_shares(created_at desc);
create index idx_story_shares_access_token on public.story_shares(access_token);
