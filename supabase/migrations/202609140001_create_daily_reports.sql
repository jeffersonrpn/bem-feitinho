create table public.daily_reports (
  report_date date primary key,
  new_users bigint not null default 0 check (new_users >= 0),
  active_users bigint not null default 0 check (active_users >= 0),
  total_calculations bigint not null default 0 check (total_calculations >= 0),
  total_adjusted_amount bigint not null default 0 check (total_adjusted_amount >= 0),
  generated_at timestamptz not null default now()
);

alter table public.daily_reports enable row level security;

create function public.refresh_daily_report(p_report_date date)
returns public.daily_reports
language plpgsql
security definer
set search_path = ''
as $$
declare
  report_row public.daily_reports;
  report_start timestamptz;
  report_end timestamptz;
begin
  if p_report_date is null then
    raise exception 'p_report_date is required';
  end if;

  report_start := p_report_date::timestamp at time zone 'America/Sao_Paulo';
  report_end := (p_report_date + 1)::timestamp at time zone 'America/Sao_Paulo';

  insert into public.daily_reports (
    report_date,
    new_users,
    active_users,
    total_calculations,
    total_adjusted_amount,
    generated_at
  )
  select
    p_report_date,
    (select count(*) from auth.users where created_at >= report_start and created_at < report_end),
    (select count(distinct user_id) from public.calculations where created_at >= report_start and created_at < report_end),
    (select count(*) from public.calculations where created_at >= report_start and created_at < report_end),
    coalesce((select sum(adjusted_total) from public.calculations where created_at >= report_start and created_at < report_end), 0),
    now()
  on conflict (report_date) do update
  set
    new_users = excluded.new_users,
    active_users = excluded.active_users,
    total_calculations = excluded.total_calculations,
    total_adjusted_amount = excluded.total_adjusted_amount,
    generated_at = excluded.generated_at
  returning * into report_row;

  return report_row;
end;
$$;

revoke all on function public.refresh_daily_report(date) from public;
revoke all on function public.refresh_daily_report(date) from anon;
revoke all on function public.refresh_daily_report(date) from authenticated;
grant execute on function public.refresh_daily_report(date) to service_role;
