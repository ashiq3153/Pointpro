-- PointPro production fixes: keep mining sessions active during periodic settlement
-- and atomically credit task rewards.

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
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

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

  select * into v_balance
  from balances
  where user_id = auth.uid()
  for update;

  if not found then
    insert into balances(user_id,available,lifetime_earned)
    values(auth.uid(),v_amount,v_amount);
  else
    update balances
    set available = available + v_amount,
        lifetime_earned = lifetime_earned + v_amount,
        updated_at = now()
    where user_id = auth.uid();
  end if;

  if v_amount > 0 then
    insert into transactions(user_id,type,amount,status,reference_id,metadata)
    values(auth.uid(),'mining',v_amount,'completed',v_session.id,
           jsonb_build_object(
             'elapsed_seconds',v_seconds,
             'rate',v_session.rate,
             'multiplier',v_session.boost_multiplier
           ));
  end if;

  update mining_sessions
  set started_at = now()
  where id = v_session.id;

  return jsonb_build_object('settled',v_amount,'seconds',v_seconds);
end;
$$;

revoke all on function public.settle_mining(uuid) from public;
grant execute on function public.settle_mining(uuid) to authenticated;

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
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_task
  from tasks
  where id = p_task_id
    and active = true
  for update;

  if not found then
    raise exception 'Task not found or inactive';
  end if;

  select * into v_existing
  from user_tasks
  where user_id = auth.uid()
    and task_id = p_task_id
  for update;

  if found and v_existing.status = 'claimed' then
    raise exception 'Task already claimed';
  end if;

  insert into user_tasks(user_id,task_id,status,completed_at,claimed_at)
  values(auth.uid(),p_task_id,'claimed',now(),now())
  on conflict (user_id,task_id)
  do update set
    status='claimed',
    completed_at=coalesce(user_tasks.completed_at,now()),
    claimed_at=now();

  update balances
  set available = available + v_task.reward,
      lifetime_earned = lifetime_earned + v_task.reward,
      updated_at = now()
  where user_id = auth.uid();

  if not found then
    insert into balances(user_id,available,lifetime_earned)
    values(auth.uid(),v_task.reward,v_task.reward);
  end if;

  if v_task.reward > 0 then
    insert into transactions(user_id,type,amount,status,reference_id,metadata)
    values(auth.uid(),'reward',v_task.reward,'completed',v_task.id,
           jsonb_build_object('task_id',v_task.id,'title',v_task.title));
  end if;

  return jsonb_build_object('reward',v_task.reward,'task_id',v_task.id);
end;
$$;

revoke all on function public.claim_task(uuid) from public;
grant execute on function public.claim_task(uuid) to authenticated;


create or replace function public.start_mining()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session mining_sessions%rowtype;
begin
  if auth.uid() is null then raise exception 'Unauthorized'; end if;

  if exists (select 1 from mining_sessions where user_id=auth.uid() and status='active') then
    raise exception 'Mining is already active';
  end if;

  insert into mining_sessions(user_id,rate,boost_multiplier,status)
  values(auth.uid(),0.00124,1,'active')
  returning * into v_session;

  return jsonb_build_object('session_id',v_session.id,'rate',v_session.rate,'started_at',v_session.started_at);
end;
$$;

revoke all on function public.start_mining() from public;
grant execute on function public.start_mining() to authenticated;

create or replace function public.stop_mining()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session mining_sessions%rowtype;
  v_seconds numeric;
  v_amount numeric;
begin
  if auth.uid() is null then raise exception 'Unauthorized'; end if;

  select * into v_session
  from mining_sessions
  where user_id=auth.uid() and status='active'
  order by started_at desc
  limit 1
  for update;

  if not found then raise exception 'No active mining session'; end if;

  v_seconds := greatest(0,least(extract(epoch from (now()-v_session.started_at)),86400));
  v_amount := v_seconds * coalesce(v_session.rate,0) * coalesce(v_session.boost_multiplier,1);

  if v_amount > 0 then
    insert into balances(user_id,available,lifetime_earned)
    values(auth.uid(),v_amount,v_amount)
    on conflict (user_id) do update set
      available=balances.available+excluded.available,
      lifetime_earned=balances.lifetime_earned+excluded.lifetime_earned,
      updated_at=now();

    insert into transactions(user_id,type,amount,status,reference_id,metadata)
    values(auth.uid(),'mining',v_amount,'completed',v_session.id,
           jsonb_build_object('elapsed_seconds',v_seconds,'rate',v_session.rate,'multiplier',v_session.boost_multiplier,'final_settlement',true));
  end if;

  update mining_sessions
  set status='stopped',stopped_at=now()
  where id=v_session.id;

  return jsonb_build_object('settled',v_amount,'seconds',v_seconds);
end;
$$;

revoke all on function public.stop_mining() from public;
grant execute on function public.stop_mining() to authenticated;
