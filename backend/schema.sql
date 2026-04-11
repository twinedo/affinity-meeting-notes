create extension if not exists pgcrypto;

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  status text not null check (status in ('processing', 'uploaded', 'completed', 'failed')),
  audio_path text,
  duration_seconds integer,
  summary text,
  transcript text
);

create index if not exists meetings_user_id_idx on public.meetings (user_id);

create or replace function public.set_meetings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_meetings_updated_at on public.meetings;

create trigger set_meetings_updated_at
before update on public.meetings
for each row
execute function public.set_meetings_updated_at();

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
