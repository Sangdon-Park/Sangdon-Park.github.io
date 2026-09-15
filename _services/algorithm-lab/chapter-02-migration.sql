-- Extend only the two problem-ID constraints; retain all student records.
begin;
alter table public.dju_algolab_drafts drop constraint if exists dju_algolab_drafts_problem_check;
alter table public.dju_algolab_drafts add constraint dju_algolab_drafts_problem_check
  check(problem ~ '^P(0[1-9]|[12][0-9]|3[0-6])$');
alter table public.dju_algolab_submissions drop constraint if exists dju_algolab_submissions_problem_check;
alter table public.dju_algolab_submissions add constraint dju_algolab_submissions_problem_check
  check(problem ~ '^P(0[1-9]|[12][0-9]|3[0-6])$');
commit;
