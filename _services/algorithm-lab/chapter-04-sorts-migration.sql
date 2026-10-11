-- Allow the two Chapter 4 supplements P87/P88 in saved drafts and submissions.
-- Existing codes, scores, identities and permissions are preserved.
begin;
alter table public.dju_algolab_drafts drop constraint if exists dju_algolab_drafts_problem_check;
alter table public.dju_algolab_drafts add constraint dju_algolab_drafts_problem_check
  check(problem ~ '^P(0[1-9]|[1-7][0-9]|8[0-8])$');
alter table public.dju_algolab_submissions drop constraint if exists dju_algolab_submissions_problem_check;
alter table public.dju_algolab_submissions add constraint dju_algolab_submissions_problem_check
  check(problem ~ '^P(0[1-9]|[1-7][0-9]|8[0-8])$');
commit;
