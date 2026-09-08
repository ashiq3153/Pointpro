create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount > 0),
  method text not null check (method in ('bkash','nagad','usdt')),
  destination text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','completed')),
  note text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists withdrawal_requests_user_created_idx
  on public.withdrawal_requests(user_id, created_at desc);

alter table public.withdrawal_requests enable row level security;

drop policy if exists withdrawal_requests_self_select on public.withdrawal_requests;
create policy withdrawal_requests_self_select
  on public.withdrawal_requests for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.request_withdrawal(
  p_amount numeric,
  p_method text,
  p_destination text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_balance public.balances%rowtype;
  v_request public.withdrawal_requests%rowtype;
begin
  if auth.uid() is null then raise exception 'Unauthorized'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Amount must be greater than 0'; end if;
  if p_method not in ('bkash','nagad','usdt') then raise exception 'Unsupported withdrawal method'; end if;
  if p_destination is null or length(trim(p_destination)) < 5 then raise exception 'Enter a valid destination'; end if;

  select * into v_balance
  from public.balances
  where user_id = auth.uid()
  for update;

  if not found or coalesce(v_balance.available,0) < p_amount then
    raise exception 'Insufficient balance';
  end if;

  update public.balances
  set available = available - p_amount,
      updated_at = now()
  where user_id = auth.uid();

  insert into public.withdrawal_requests(user_id, amount, method, destination, status)
  values(auth.uid(), p_amount, lower(trim(p_method)), trim(p_destination), 'pending')
  returning * into v_request;

  insert into public.transactions(user_id, type, amount, status, reference_id, metadata)
  values(auth.uid(), 'withdrawal', -p_amount, 'pending', v_request.id,
    jsonb_build_object('withdrawal_id', v_request.id, 'method', lower(trim(p_method))));

  return jsonb_build_object('id', v_request.id, 'amount', v_request.amount, 'method', v_request.method, 'status', v_request.status);
end;
$function$;

revoke all on function public.request_withdrawal(numeric,text,text) from public;
grant execute on function public.request_withdrawal(numeric,text,text) to authenticated;
