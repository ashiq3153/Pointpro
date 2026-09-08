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


-- Atomic mining settlement RPC.
create or replace function public.settle_mining(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session mining_sessions%rowtype;
  v_balance balances%rowtype;
  v_seconds numeric;
  v_amount numeric;
begin
  select * into v_session
  from mining_sessions
  where id = p_session_id
    and user_id = auth.uid()
    and status = 'active'
  for update;

  if not found then
    raise exception 'No active mining session';
  end if;

  v_seconds := greatest(0, least(extract(epoch from (now() - v_session.started_at)), 86400));
  v_amount := v_seconds * coalesce(v_session.rate,0) * coalesce(v_session.boost_multiplier,1);

  select * into v_balance from balances where user_id = auth.uid() for update;
  if not found then
    insert into balances(user_id,available,lifetime_earned)
    values(auth.uid(),v_amount,v_amount)
    returning * into v_balance;
  else
    update balances
    set available = available + v_amount,
        lifetime_earned = lifetime_earned + v_amount,
        updated_at = now()
    where user_id = auth.uid();
  end if;

  insert into transactions(user_id,type,amount,status,reference_id,metadata)
  values(auth.uid(),'mining',v_amount,'completed',v_session.id,
         jsonb_build_object('elapsed_seconds',v_seconds,'rate',v_session.rate,'multiplier',v_session.boost_multiplier));

  -- Keep the session active. Each periodic call settles only the new interval.
  update mining_sessions
  set started_at=now()
  where id=v_session.id;

  return jsonb_build_object('settled',v_amount,'seconds',v_seconds);
end;
$$;

revoke all on function public.settle_mining(uuid) from public;
grant execute on function public.settle_mining(uuid) to authenticated;


-- Atomic task reward claim.
create or replace function public.claim_task(p_task_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task tasks%rowtype;
  v_existing user_tasks%rowtype;
begin
  if auth.uid() is null then raise exception 'Unauthorized'; end if;

  select * into v_task from tasks
  where id = p_task_id and active = true
  for update;
  if not found then raise exception 'Task not found or inactive'; end if;

  select * into v_existing from user_tasks
  where user_id = auth.uid() and task_id = p_task_id
  for update;
  if found and v_existing.status = 'claimed' then raise exception 'Task already claimed'; end if;

  insert into user_tasks(user_id, task_id, status, completed_at, claimed_at)
  values(auth.uid(), p_task_id, 'claimed', now(), now())
  on conflict (user_id, task_id)
  do update set status='claimed', completed_at=coalesce(user_tasks.completed_at, now()), claimed_at=now();

  update balances
  set available = available + v_task.reward,
      lifetime_earned = lifetime_earned + v_task.reward,
      updated_at = now()
  where user_id = auth.uid();

  if not found then
    insert into balances(user_id, available, lifetime_earned)
    values(auth.uid(), v_task.reward, v_task.reward);
  end if;

  insert into transactions(user_id, type, amount, status, reference_id, metadata)
  values(auth.uid(), 'reward', v_task.reward, 'completed', v_task.id,
         jsonb_build_object('task_id', v_task.id, 'title', v_task.title));

  return jsonb_build_object('reward', v_task.reward, 'task_id', v_task.id);
end;
$$;

revoke all on function public.claim_task(uuid) from public;
grant execute on function public.claim_task(uuid) to authenticated;
