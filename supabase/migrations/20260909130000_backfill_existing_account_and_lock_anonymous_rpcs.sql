-- Backfill accounts created before the signup trigger existed and lock down public RPC execution.

insert into public.profiles (id, display_name, username, referral_code, referred_by)
select
  u.id,
  nullif(trim(coalesce(u.raw_user_meta_data->>'display_name','')), ''),
  'pp_' || substr(replace(u.id::text,'-',''),1,10),
  'PP' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  (
    select p.id
    from public.profiles p
    where upper(p.referral_code)=upper(nullif(trim(coalesce(u.raw_user_meta_data->>'referral_code','')), ''))
      and p.id <> u.id
    limit 1
  )
from auth.users u
where not exists (select 1 from public.profiles p where p.id=u.id);

insert into public.balances (user_id, available, lifetime_earned)
select u.id, 0, 0
from auth.users u
where not exists (select 1 from public.balances b where b.user_id=u.id);

revoke execute on function public.start_mining() from anon, public;
revoke execute on function public.stop_mining() from anon, public;
revoke execute on function public.settle_mining(uuid) from anon, public;
revoke execute on function public.claim_task(uuid) from anon, public;
revoke execute on function public.request_withdrawal(numeric,text,text) from anon, public;
revoke execute on function public.admin_process_withdrawal(uuid,text,text) from anon, public;
revoke execute on function public.is_admin() from anon, public;
revoke execute on function public.handle_new_user() from anon, public;
revoke execute on function public.handle_referral_bonus() from anon, public;

grant execute on function public.start_mining() to authenticated;
grant execute on function public.stop_mining() to authenticated;
grant execute on function public.settle_mining(uuid) to authenticated;
grant execute on function public.claim_task(uuid) to authenticated;
grant execute on function public.request_withdrawal(numeric,text,text) to authenticated;
grant execute on function public.admin_process_withdrawal(uuid,text,text) to authenticated;
grant execute on function public.is_admin() to authenticated;
