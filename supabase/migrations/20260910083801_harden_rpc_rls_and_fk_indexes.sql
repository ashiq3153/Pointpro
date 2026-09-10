-- Harden authenticated-only RPC execution, add FK indexes, and optimize RLS policies.
revoke execute on function public.activate_mining_plan(text) from anon, public;
revoke execute on function public.admin_process_deposit(uuid,text,text) from anon, public;
revoke execute on function public.claim_daily_reward() from anon, public;
revoke execute on function public.submit_deposit_request(numeric,text,text) from anon, public;
grant execute on function public.activate_mining_plan(text) to authenticated;
grant execute on function public.admin_process_deposit(uuid,text,text) to authenticated;
grant execute on function public.claim_daily_reward() to authenticated;
grant execute on function public.submit_deposit_request(numeric,text,text) to authenticated;

create index if not exists idx_deposit_requests_user_id on public.deposit_requests(user_id);
create index if not exists idx_profiles_referred_by on public.profiles(referred_by);
create index if not exists idx_user_mining_plans_plan_id on public.user_mining_plans(plan_id);
create index if not exists idx_user_tasks_task_id on public.user_tasks(task_id);

alter policy admins_self_select on public.admins to authenticated using (user_id = (select auth.uid()));
alter policy "users can view own daily rewards" on public.daily_reward_claims to authenticated using ((select auth.uid()) = user_id);
alter policy "users create own deposits" on public.deposit_requests to authenticated with check ((select auth.uid()) = user_id);
alter policy "users view own deposits" on public.deposit_requests to authenticated using ((select auth.uid()) = user_id);
alter policy mining_sessions_self_select on public.mining_sessions to authenticated using (user_id = (select auth.uid()));
alter policy profiles_self_or_referrals on public.profiles to authenticated using ((id = (select auth.uid())) or (referred_by = (select auth.uid())));
alter policy "users view own mining plans" on public.user_mining_plans to authenticated using ((select auth.uid()) = user_id);
alter policy user_tasks_self_select on public.user_tasks to authenticated using (user_id = (select auth.uid()));
