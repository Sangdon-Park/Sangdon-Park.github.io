-- Dedicated tables only. No existing school tables, users, or policies are changed.
begin;
create table if not exists public.dju_algolab_students (
  id uuid primary key default gen_random_uuid(),
  section text not null check(section in ('01','02')),
  student_no text not null check(student_no ~ '^[0-9]{6,12}$'),
  name text not null check(length(name) between 1 and 40),
  password_hash text not null,
  password_salt text not null,
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  current_problem text not null default 'P01',
  current_language text not null default 'python' check(current_language in ('python','c')),
  unique(section, student_no)
);
create table if not exists public.dju_algolab_sessions (
  token_hash text primary key,
  student_id uuid references public.dju_algolab_students(id) on delete cascade,
  role text not null check(role in ('student','admin')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check((role='student' and student_id is not null) or (role='admin' and student_id is null))
);
create table if not exists public.dju_algolab_drafts (
  student_id uuid not null references public.dju_algolab_students(id) on delete cascade,
  problem text not null check(problem ~ '^P(0[1-9]|[1-7][0-9]|8[0-6])$'),
  language text not null check(language in ('python','c')),
  code text not null check(length(code)<=20000),
  updated_at timestamptz not null default now(),
  primary key(student_id,problem,language)
);
create table if not exists public.dju_algolab_submissions (
  id uuid primary key,
  student_id uuid not null references public.dju_algolab_students(id) on delete cascade,
  problem text not null check(problem ~ '^P(0[1-9]|[1-7][0-9]|8[0-6])$'),
  language text not null check(language in ('python','c')),
  code text not null check(length(code)<=20000),
  passed integer not null check(passed>=0),
  total integer not null check(total between 1 and 50),
  solved boolean not null,
  report jsonb not null,
  source text not null check(source in ('browser','legacy')),
  created_at timestamptz not null default now(),
  check(passed<=total)
);
create index if not exists dju_algolab_submissions_student_time on public.dju_algolab_submissions(student_id,created_at desc);
create index if not exists dju_algolab_sessions_expiry on public.dju_algolab_sessions(expires_at);
create table if not exists public.dju_algolab_limits (
  key text primary key,
  bucket bigint not null,
  hits integer not null default 1
);
create table if not exists public.dju_algolab_settings (key text primary key, value jsonb not null);
alter table public.dju_algolab_students enable row level security;
alter table public.dju_algolab_sessions enable row level security;
alter table public.dju_algolab_drafts enable row level security;
alter table public.dju_algolab_submissions enable row level security;
alter table public.dju_algolab_limits enable row level security;
alter table public.dju_algolab_settings enable row level security;
revoke all on public.dju_algolab_students,public.dju_algolab_sessions,public.dju_algolab_drafts,public.dju_algolab_submissions,public.dju_algolab_limits,public.dju_algolab_settings from anon,authenticated;
grant all on public.dju_algolab_students,public.dju_algolab_sessions,public.dju_algolab_drafts,public.dju_algolab_submissions,public.dju_algolab_limits,public.dju_algolab_settings to service_role;
create or replace function public.dju_algolab_rate_limit(p_key text,p_window integer,p_limit integer)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare b bigint:=floor(extract(epoch from now())/p_window); n integer;
begin
  insert into dju_algolab_limits as t(key,bucket,hits) values(p_key,b,1)
  on conflict(key) do update set bucket=excluded.bucket,hits=case when t.bucket=excluded.bucket then t.hits+1 else 1 end
  returning hits into n;
  return n<=p_limit;
end;$$;
revoke all on function public.dju_algolab_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.dju_algolab_rate_limit(text,integer,integer) to service_role;
create or replace function public.dju_algolab_dashboard()
returns jsonb language sql security definer set search_path=public,pg_temp as $$
select coalesce(jsonb_agg(to_jsonb(x) order by x.section,x.student_no),'[]'::jsonb) from (
  select s.id,s.section,s.student_no,s.name,s.created_at,s.last_seen,s.current_problem,s.current_language,
    (select count(*) from dju_algolab_submissions a where a.student_id=s.id and a.source='browser') as attempts,
    (select count(distinct problem) from dju_algolab_submissions a where a.student_id=s.id and a.solved) as solved,
    coalesce((select jsonb_agg(to_jsonb(p)) from (
      select a.problem,a.language,bool_or(a.solved) as solved,count(*) filter(where a.source='browser') as attempts,
        max(a.created_at) as last_submit
      from dju_algolab_submissions a where a.student_id=s.id group by a.problem,a.language
    ) p),'[]'::jsonb) as problems
  from dju_algolab_students s
) x;
$$;
revoke all on function public.dju_algolab_dashboard() from public,anon,authenticated;
grant execute on function public.dju_algolab_dashboard() to service_role;
create or replace function public.dju_algolab_passed(p_student uuid)
returns jsonb language sql security definer set search_path=public,pg_temp as $$
select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from (
  select distinct on(problem,language) problem,language,code,passed,total,created_at
  from dju_algolab_submissions where student_id=p_student and solved
  order by problem,language,created_at desc
) x;
$$;
revoke all on function public.dju_algolab_passed(uuid) from public,anon,authenticated;
grant execute on function public.dju_algolab_passed(uuid) to service_role;
commit;
