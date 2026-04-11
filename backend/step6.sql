alter table public.meetings
add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists meetings_user_id_idx on public.meetings (user_id);

alter table public.meetings enable row level security;

drop policy if exists "Anon can read meetings" on public.meetings;
drop policy if exists "Anon can insert meetings" on public.meetings;
drop policy if exists "Anon can update meetings" on public.meetings;
drop policy if exists "Anon can delete meetings" on public.meetings;
drop policy if exists "Users can read own meetings" on public.meetings;
drop policy if exists "Users can insert own meetings" on public.meetings;
drop policy if exists "Users can update own meetings" on public.meetings;
drop policy if exists "Users can delete own meetings" on public.meetings;

create policy "Users can read own meetings"
on public.meetings
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own meetings"
on public.meetings
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own meetings"
on public.meetings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own meetings"
on public.meetings
for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('meeting-audio', 'meeting-audio', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Anon can upload meeting audio" on storage.objects;
drop policy if exists "Anon can read meeting audio" on storage.objects;
drop policy if exists "Anon can delete meeting audio" on storage.objects;
drop policy if exists "Users can upload own meeting audio" on storage.objects;
drop policy if exists "Users can read own meeting audio" on storage.objects;
drop policy if exists "Users can delete own meeting audio" on storage.objects;

create policy "Users can upload own meeting audio"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'meeting-audio'
  and (storage.foldername(name))[1] = 'recordings'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Users can read own meeting audio"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'meeting-audio'
  and (storage.foldername(name))[1] = 'recordings'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Users can delete own meeting audio"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'meeting-audio'
  and (storage.foldername(name))[1] = 'recordings'
  and (storage.foldername(name))[2] = auth.uid()::text
);
