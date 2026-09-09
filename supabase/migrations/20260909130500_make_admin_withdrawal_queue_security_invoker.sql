-- The admin withdrawal queue should obey the caller's RLS policies.
alter view public.admin_withdrawal_queue set (security_invoker = true);
