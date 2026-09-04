-- Add profile fields to users table
alter table public.users
add column if not exists name text,
add column if not exists age_range text,
add column if not exists gender text,
add column if not exists education_status text,
add column if not exists domain text,
add column if not exists previous_therapy text,
add column if not exists current_support text;
