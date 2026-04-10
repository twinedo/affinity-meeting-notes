alter table public.meetings
drop constraint if exists meetings_status_check;

alter table public.meetings
add constraint meetings_status_check
check (status in ('processing', 'uploaded', 'completed', 'failed'));
