-- PointPro Supabase foundation schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  referral_code text unique not null,
  referred_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.balances (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  available numeric(30,12) not null default 0,
  lifetime_earned numeric(30,12) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.mining_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  stopped_at timestamptz,
  rate numeric(30,12) not null default 0.00124,
  boost_multiplier numeric(10,4) not null default 1,
  status text not null default 'active' check (status in ('active','stopped')),
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('mining','reward','referral','deposit','withdrawal','transfer','exchange','adjustment')),
  amount numeric(30,12) not null,
  status text not null default 'completed' check (status in ('pending','completed','failed','reversed')),
  reference_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  reward numeric(30,12) not null default 0,
  task_type text not null default 'daily',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_tasks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','completed','claimed')),
  completed_at timestamptz,
  claimed_at timestamptz,
  primary key (user_id, task_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_created_idx on public.transactions(user_id, created_at desc);
create index if not exists mining_sessions_user_status_idx on public.mining_sessions(user_id, status);

alter table public.profiles enable row level security;
alter table public.balances enable row level security;
alter table public.mining_sessions enable row level security;
alter table public.transactions enable row level security;
alter table public.user_tasks enable row level security;
alter table public.notifications enable row level security;
alter table public.tasks enable row level security;

create policy "profiles own read" on public.profiles for select using (auth.uid() = id);
create policy "balances own read" on public.balances for select using (auth.uid() = user_id);
create policy "mining own read" on public.mining_sessions for select using (auth.uid() = user_id);
create policy "transactions own read" on public.transactions for select using (auth.uid() = user_id);
create policy "user tasks own read" on public.user_tasks for select using (auth.uid() = user_id);
create policy "notifications own read" on public.notifications for select using (auth.uid() = user_id);
create policy "tasks public read" on public.tasks for select using (active = true);
