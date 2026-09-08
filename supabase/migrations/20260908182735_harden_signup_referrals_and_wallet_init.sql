create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_ref_code text;
  v_referred_by uuid;
  v_username text;
begin
  v_ref_code := nullif(trim(coalesce(new.raw_user_meta_data->>'referral_code','')), '');
  if v_ref_code is not null then
    select id into v_referred_by
    from public.profiles
    where upper(referral_code)=upper(v_ref_code)
    limit 1;
  end if;

  v_username := 'pp_' || substr(replace(new.id::text,'-',''),1,10);

  insert into public.profiles(id, display_name, username, referral_code, referred_by)
  values(new.id, nullif(trim(coalesce(new.raw_user_meta_data->>'display_name','')), ''), v_username,
    'PP' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)), v_referred_by)
  on conflict (id) do nothing;

  insert into public.balances(user_id, available, lifetime_earned)
  values(new.id,0,0)
  on conflict (user_id) do nothing;

  return new;
end;
$function$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public;