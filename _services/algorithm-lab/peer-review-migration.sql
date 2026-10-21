-- Additive: existing practice answers, grades and student records are preserved.
begin;
create table if not exists public.dju_algolab_peer_reviews (
  id uuid primary key,
  owner_id uuid not null references public.dju_algolab_students(id) on delete cascade,
  section text not null check(section in ('01','02')),
  problem text not null,
  language text not null check(language in ('python','c','java')),
  original_code text not null check(length(original_code) between 1 and 20000),
  explanation text not null check(length(explanation) between 5 and 2000),
  skill_count integer not null check(skill_count>=0),
  skill_band integer not null check(skill_band between 0 and 3),
  partner_id uuid references public.dju_algolab_peer_reviews(id) on delete set null,
  feedback jsonb,
  reflection jsonb,
  assessment jsonb,
  created_at timestamptz not null default now(),
  matched_at timestamptz,
  reviewed_at timestamptz,
  reflected_at timestamptz,
  assessed_at timestamptz,
  check(id is distinct from partner_id)
);
create index if not exists dju_algolab_peer_owner_time on public.dju_algolab_peer_reviews(owner_id,created_at desc);
create index if not exists dju_algolab_peer_waiting on public.dju_algolab_peer_reviews(section,problem,language,skill_band) where partner_id is null;
create unique index if not exists dju_algolab_peer_one_active on public.dju_algolab_peer_reviews(owner_id,problem,language) where reflected_at is null;
alter table public.dju_algolab_peer_reviews enable row level security;
revoke all on public.dju_algolab_peer_reviews from public,anon,authenticated;
grant all on public.dju_algolab_peer_reviews to service_role;
create or replace function public.dju_algolab_peer_enqueue(
  p_id uuid,p_student uuid,p_section text,p_problem text,p_language text,
  p_code text,p_explanation text,p_skill integer,p_band integer
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare mine dju_algolab_peer_reviews; candidate dju_algolab_peer_reviews;
begin
  perform pg_advisory_xact_lock(hashtext('dju-peer:'||p_section||':'||p_problem||':'||p_language));
  select * into mine from dju_algolab_peer_reviews where id=p_id;
  if found then
    if mine.owner_id<>p_student then raise exception 'Review ID conflict'; end if;
    return to_jsonb(mine);
  end if;
  select * into mine from dju_algolab_peer_reviews where owner_id=p_student and problem=p_problem and language=p_language and reflected_at is null;
  if found then return to_jsonb(mine); end if;
  insert into dju_algolab_peer_reviews(id,owner_id,section,problem,language,original_code,explanation,skill_count,skill_band)
  values(p_id,p_student,p_section,p_problem,p_language,p_code,p_explanation,p_skill,p_band) returning * into mine;
  select * into candidate from dju_algolab_peer_reviews
    where id<>mine.id and owner_id<>p_student and partner_id is null
      and section=p_section and problem=p_problem and language=p_language and skill_band=p_band
    order by abs(skill_count-p_skill),created_at,id limit 1 for update;
  if found then
    update dju_algolab_peer_reviews set partner_id=mine.id,matched_at=now() where id=candidate.id;
    update dju_algolab_peer_reviews set partner_id=candidate.id,matched_at=now() where id=mine.id returning * into mine;
  end if;
  return to_jsonb(mine);
end;$$;
revoke all on function public.dju_algolab_peer_enqueue(uuid,uuid,text,text,text,text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.dju_algolab_peer_enqueue(uuid,uuid,text,text,text,text,text,integer,integer) to service_role;
commit;
