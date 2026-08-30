# Database Migrations

This directory contains SQL migrations for SafeShoulder database schema updates.

## Applying Migrations

### Option 1: Using Supabase Dashboard (Recommended for quick setup)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your SafeShoulder project
3. Go to **SQL Editor** → **New Query**
4. Copy the contents of the migration file you want to run
5. Paste into the editor
6. Click **Run**
7. Verify the query completed successfully

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Create a new migration (auto-generates timestamp)
supabase migration new migration_name

# Apply all pending migrations
supabase migration up

# Check migration status
supabase migration list
```

### Option 3: Using psql (direct database access)

```bash
# Set your Supabase connection string
export DATABASE_URL="postgresql://user:password@db.host.com:5432/postgres"

# Run the migration
psql "$DATABASE_URL" < migrations/002_create_circles_tables.sql
```

## Migration Files

### 001_base_schema.sql (Already applied)
- Base user and session tables
- Authentication setup

### 002_create_circles_tables.sql
- Creates `circles` table (community circles)
- Creates `circle_members` table (membership tracking)
- Creates `circle_messages` table (shared messages)
- Sets up Row Level Security (RLS) policies
- Inserts sample circles data

## Verifying Migrations

After running a migration, verify success:

```sql
-- Check circles were created
SELECT COUNT(*) as circles_count FROM public.circles;
-- Expected: 6 (sample circles)

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'circle%';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename LIKE 'circle%';
```

## Rolling Back

If you need to rollback a migration:

```sql
-- Drop tables (CAREFUL - this deletes all data)
DROP TABLE IF EXISTS public.circle_messages CASCADE;
DROP TABLE IF EXISTS public.circle_members CASCADE;
DROP TABLE IF EXISTS public.circles CASCADE;
```

## Notes

- Migrations should be **idempotent** (safe to run multiple times using `IF NOT EXISTS`)
- Always test migrations in a staging environment first
- Keep migrations in **chronological order** by filename
- Document what changed and why in migration comments
- RLS policies are critical for security - do not skip them
