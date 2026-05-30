-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  free_queries_used integer not null default 0,
  message_credits integer not null default 0,    -- purchased credits balance
  subscription_id text,                           -- Razorpay/Stripe subscription id
  billing_provider text,                          -- "razorpay" | "stripe"
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
create policy "Users can read own data" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

-- Auto-create user row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Atomic credit helpers (called via supabase.rpc)
create or replace function public.increment_credits(uid uuid, amount integer)
returns void language plpgsql security definer as $$
begin
  update public.users set message_credits = message_credits + amount where id = uid;
end;
$$;

create or replace function public.decrement_credits(uid uuid, amount integer)
returns void language plpgsql security definer as $$
begin
  update public.users
  set message_credits = greatest(0, message_credits - amount)
  where id = uid;
end;
$$;

create or replace function public.increment_free_used(uid uuid)
returns void language plpgsql security definer as $$
begin
  update public.users set free_queries_used = free_queries_used + 1 where id = uid;
end;
$$;

-- Credit orders (one-time purchases)
create table public.credit_orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,   -- Razorpay order_id or Stripe PaymentIntent id
  user_id uuid not null references public.users(id) on delete cascade,
  pack text not null,
  messages integer not null,
  amount integer not null,         -- in paise / cents
  currency text not null default 'INR',
  provider text not null,
  status text not null default 'pending' check (status in ('pending', 'credited', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.credit_orders enable row level security;
create policy "Users can view own orders" on public.credit_orders
  for select using (auth.uid() = user_id);

-- Sessions table
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  domain text not null,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sessions enable row level security;
create policy "Users can manage own sessions" on public.sessions
  for all using (auth.uid() = user_id);

-- Messages table
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
create policy "Users can manage own messages" on public.messages
  for all using (
    auth.uid() = (select user_id from public.sessions where id = session_id)
  );

-- Indexes
create index idx_sessions_user_id on public.sessions(user_id);
create index idx_sessions_created_at on public.sessions(created_at desc);
create index idx_messages_session_id on public.messages(session_id);
create index idx_messages_created_at on public.messages(created_at);
create index idx_credit_orders_user_id on public.credit_orders(user_id);

-- Auto-delete messages older than 90 days
-- Uncomment after enabling pg_cron extension in Supabase dashboard:
-- select cron.schedule('delete-old-messages', '0 3 * * *',
--   $$ delete from public.messages where created_at < now() - interval '90 days' $$);
