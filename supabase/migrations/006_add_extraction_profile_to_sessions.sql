-- Add extraction_profile column to sessions table for Phase 2 implicit profiling
alter table public.sessions
add column extraction_profile jsonb default '{}'::jsonb;

-- Index for efficient queries on extracted data
create index idx_sessions_extraction_profile on public.sessions using gin(extraction_profile);
