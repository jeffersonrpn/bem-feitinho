create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calculator_id text not null,
  calculator_version integer not null default 1,
  input_snapshot jsonb not null,
  result_snapshot jsonb not null,
  complexity_score numeric(3, 1) not null check (
    complexity_score between 1 and 10
  ),
  effort_multiplier numeric(3, 2) not null,
  suggested_total integer not null check (suggested_total >= 0),
  adjusted_total integer not null check (adjusted_total >= 0),
  currency text not null default 'BRL',
  created_at timestamptz not null default now()
);

create index calculations_user_created_at_idx
  on public.calculations(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.calculations enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can read their own calculations"
  on public.calculations for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own calculations"
  on public.calculations for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own calculations"
  on public.calculations for delete
  using ((select auth.uid()) = user_id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();