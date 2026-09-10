-- Merge admin + self/referral SELECT policies to avoid duplicate permissive evaluation.
drop policy if exists balances_admin_select on public.balances;
drop policy if exists balances_self_select on public.balances;
create policy balances_select on public.balances for select to authenticated using (is_admin() or user_id = (select auth.uid()));

drop policy if exists profiles_admin_select on public.profiles;
drop policy if exists profiles_self_or_referrals on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (is_admin() or id = (select auth.uid()) or referred_by = (select auth.uid()));

drop policy if exists transactions_admin_select on public.transactions;
drop policy if exists transactions_self_select on public.transactions;
create policy transactions_select on public.transactions for select to authenticated using (is_admin() or user_id = (select auth.uid()));

drop policy if exists withdrawal_requests_admin_select on public.withdrawal_requests;
drop policy if exists withdrawal_requests_self_select on public.withdrawal_requests;
create policy withdrawal_requests_select on public.withdrawal_requests for select to authenticated using (is_admin() or user_id = (select auth.uid()));
