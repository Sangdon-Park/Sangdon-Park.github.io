begin;
alter table public.dju_algolab_students drop constraint if exists dju_algolab_students_current_language_check;
alter table public.dju_algolab_students add constraint dju_algolab_students_current_language_check check (current_language in ('python','c','java'));
alter table public.dju_algolab_drafts drop constraint if exists dju_algolab_drafts_language_check;
alter table public.dju_algolab_drafts add constraint dju_algolab_drafts_language_check check (language in ('python','c','java'));
alter table public.dju_algolab_submissions drop constraint if exists dju_algolab_submissions_language_check;
alter table public.dju_algolab_submissions add constraint dju_algolab_submissions_language_check check (language in ('python','c','java'));
commit;
