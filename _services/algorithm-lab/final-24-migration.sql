-- Extend ID checks for the new public catalog; preserve every existing row.
begin;
alter table public.dju_algolab_drafts drop constraint if exists dju_algolab_drafts_problem_check;
alter table public.dju_algolab_drafts add constraint dju_algolab_drafts_problem_check
  check(problem ~ '^(P(0[1-9]|[1-7][0-9]|8[0-9])|F(0[6-9]|1[01])-0[1-4])$');
alter table public.dju_algolab_submissions drop constraint if exists dju_algolab_submissions_problem_check;
alter table public.dju_algolab_submissions add constraint dju_algolab_submissions_problem_check
  check(problem ~ '^(P(0[1-9]|[1-7][0-9]|8[0-9])|F(0[6-9]|1[01])-0[1-4])$');
commit;
