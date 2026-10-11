-- P89 is a new exercise, so existing P61 drafts and scores retain their identity.
-- Extend allowed problem IDs without changing rows, access policies, or old IDs.
begin;
alter table public.dju_algolab_drafts drop constraint dju_algolab_drafts_problem_check;
alter table public.dju_algolab_drafts add constraint dju_algolab_drafts_problem_check
  check(problem ~ '^P(0[1-9]|[1-7][0-9]|8[0-9])$');
alter table public.dju_algolab_submissions drop constraint dju_algolab_submissions_problem_check;
alter table public.dju_algolab_submissions add constraint dju_algolab_submissions_problem_check
  check(problem ~ '^P(0[1-9]|[1-7][0-9]|8[0-9])$');
commit;
