-- Replace the SECURITY DEFINER leaderboard view with a SECURITY INVOKER view.
-- Leaderboard data is pre-aggregated in a private schema so existing RLS on
-- transactions/profiles cannot expose or hide rows from the leaderboard.

create schema if not exists private;

create table if not exists private.leaderboard_daily (
  day date not null,
  user_id uuid not null,
  display_name text,
  earned numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (day, user_id)
);

create index if not exists leaderboard_daily_user_day_idx
  on private.leaderboard_daily (user_id, day desc);

create or replace function private.refresh_leaderboard_user_day(p_user_id uuid, p_day date)
returns void
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_earned numeric;
  v_name text;
begin
  if p_user_id is null or p_day is null then return; end if;

  select coalesce(sum(case when t.amount > 0 then t.amount else 0 end), 0)
    into v_earned
  from public.transactions t
  where t.user_id = p_user_id
    and t.created_at >= p_day::timestamptz
    and t.created_at < (p_day + 1)::timestamptz;

  select coalesce(p.display_name, 'Miner')
    into v_name
  from public.profiles p
  where p.id = p_user_id;

  if v_earned > 0 then
    insert into private.leaderboard_daily(day, user_id, display_name, earned, updated_at)
    values (p_day, p_user_id, coalesce(v_name, 'Miner'), v_earned, now())
    on conflict (day, user_id) do update
      set display_name = excluded.display_name,
          earned = excluded.earned,
          updated_at = now();
  else
    delete from private.leaderboard_daily
    where day = p_day and user_id = p_user_id;
  end if;
end;
$$;

revoke all on function private.refresh_leaderboard_user_day(uuid, date) from public, anon, authenticated;

create or replace function private.sync_leaderboard_transaction()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if tg_op in ('UPDATE','DELETE') then
    perform private.refresh_leaderboard_user_day(old.user_id, (old.created_at at time zone 'UTC')::date);
  end if;
  if tg_op in ('INSERT','UPDATE') then
    perform private.refresh_leaderboard_user_day(new.user_id, (new.created_at at time zone 'UTC')::date);
  end if;
  return coalesce(new, old);
end;
$$;

revoke all on function private.sync_leaderboard_transaction() from public, anon, authenticated;

drop trigger if exists trg_sync_leaderboard_transaction on public.transactions;
create trigger trg_sync_leaderboard_transaction
after insert or update or delete on public.transactions
for each row execute function private.sync_leaderboard_transaction();

create or replace function private.sync_leaderboard_profile()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  update private.leaderboard_daily
  set display_name = coalesce(new.display_name, 'Miner'), updated_at = now()
  where user_id = new.id;
  return new;
end;
$$;

revoke all on function private.sync_leaderboard_profile() from public, anon, authenticated;

drop trigger if exists trg_sync_leaderboard_profile on public.profiles;
create trigger trg_sync_leaderboard_profile
after update of display_name on public.profiles
for each row execute function private.sync_leaderboard_profile();

insert into private.leaderboard_daily(day, user_id, display_name, earned, updated_at)
select (t.created_at at time zone 'UTC')::date,
       t.user_id,
       coalesce(p.display_name, 'Miner'),
       sum(case when t.amount > 0 then t.amount else 0 end),
       now()
from public.transactions t
left join public.profiles p on p.id = t.user_id
where t.created_at >= now() - interval '7 days'
group by 1,2,3
having sum(case when t.amount > 0 then t.amount else 0 end) > 0
on conflict (day, user_id) do update
  set display_name = excluded.display_name,
      earned = excluded.earned,
      updated_at = now();

drop view if exists public.leaderboard_weekly;
create view public.leaderboard_weekly
with (security_invoker = true)
as
select ld.user_id,
       coalesce(p.display_name, ld.display_name, 'Miner') as display_name,
       sum(ld.earned) as earned
from private.leaderboard_daily ld
left join public.profiles p on p.id = ld.user_id
where ld.day >= current_date - 6
group by ld.user_id, coalesce(p.display_name, ld.display_name, 'Miner')
order by sum(ld.earned) desc
limit 100;

grant usage on schema private to authenticated;
grant select on private.leaderboard_daily to authenticated;
revoke all on public.leaderboard_weekly from anon;
grant select on public.leaderboard_weekly to authenticated;
