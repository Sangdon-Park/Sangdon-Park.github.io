begin;
create table if not exists public.dju_site_visits (
  id uuid primary key,
  visited_at timestamptz not null default now(),
  visitor_hash text not null check(length(visitor_hash)=64),
  ip inet,
  path text not null check(length(path)<=300),
  referrer text not null default '' check(length(referrer)<=200),
  browser text not null,
  device text not null
);
create index if not exists dju_site_visits_time on public.dju_site_visits(visited_at desc);
create index if not exists dju_site_visits_visitor on public.dju_site_visits(visitor_hash,visited_at);
alter table public.dju_site_visits enable row level security;
revoke all on public.dju_site_visits from public,anon,authenticated;
grant all on public.dju_site_visits to service_role;
create or replace function public.dju_site_stats(p_days int default 7) returns jsonb
language sql security definer set search_path=public,pg_temp as $$
with visits as (
 select * from public.dju_site_visits where visited_at>=((now() at time zone 'Asia/Seoul')::date-greatest(0,least(p_days,365)-1))::timestamp at time zone 'Asia/Seoul'
), days as (
 select (visited_at at time zone 'Asia/Seoul')::date as day,count(*) views,count(distinct visitor_hash) visitors from visits group by 1
), pages as (
 select path,count(*) views,count(distinct visitor_hash) visitors from visits group by path order by count(*) desc limit 100
), sources as (
 select referrer,count(*) views from visits group by referrer order by count(*) desc limit 20
)
select jsonb_build_object(
 'views',(select count(*) from visits),'visitors',(select count(distinct visitor_hash) from visits),
 'ips',(select count(distinct ip) from visits where visited_at>now()-interval '30 days'),
 'days',coalesce((select jsonb_agg(days order by day) from days),'[]'::jsonb),
 'pages',coalesce((select jsonb_agg(pages) from pages),'[]'::jsonb),
 'sources',coalesce((select jsonb_agg(sources) from sources),'[]'::jsonb),
 'first_record',(select min(visited_at) from public.dju_site_visits)
);
$$;
revoke all on function public.dju_site_stats(int) from public,anon,authenticated;
grant execute on function public.dju_site_stats(int) to service_role;
create extension if not exists pg_cron;
select cron.schedule('dju-site-retention','17 * * * *',$cron$
 update public.dju_site_visits set ip=null where ip is not null and visited_at<now()-interval '30 days';
 delete from public.dju_site_visits where visited_at<now()-interval '365 days';
$cron$);
commit;
