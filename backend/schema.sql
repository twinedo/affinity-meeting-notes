create extension if not exists pgcrypto;

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  status text not null check (status in ('processing', 'uploaded', 'completed', 'failed')),
  audio_path text,
  duration_seconds integer,
  summary text,
  transcript text
);

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
create policy "Anon can read meetings"
on public.meetings
for select
to anon
using (true);

drop policy if exists "Anon can insert meetings" on public.meetings;
create policy "Anon can insert meetings"
on public.meetings
for insert
to anon
with check (true);

drop policy if exists "Anon can update meetings" on public.meetings;
create policy "Anon can update meetings"
on public.meetings
for update
to anon
using (true)
with check (true);

insert into storage.buckets (id, name, public)
values ('meeting-audio', 'meeting-audio', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Anon can upload meeting audio" on storage.objects;
create policy "Anon can upload meeting audio"
on storage.objects
for insert
to anon
with check (bucket_id = 'meeting-audio');

drop policy if exists "Anon can read meeting audio" on storage.objects;
create policy "Anon can read meeting audio"
on storage.objects
for select
to anon
using (bucket_id = 'meeting-audio');

insert into public.meetings (
  id,
  created_at,
  updated_at,
  status,
  audio_path,
  duration_seconds,
  summary,
  transcript
)
values
  (
    'd9b4ebce-5686-49f4-8a22-37930866c311',
    '2026-04-09T10:32:00Z',
    '2026-04-09T10:32:00Z',
    'processing',
    null,
    1692,
    '',
    ''
  ),
  (
    '07308b30-d422-4c58-a74b-1d8fef8cb2d5',
    '2026-04-08T16:10:00Z',
    '2026-04-08T16:10:00Z',
    'completed',
    null,
    1124,
    'Client onboarding call covering scope, delivery timing, and immediate follow-up items.',
    'We walked through onboarding, discussed owners, and aligned on the implementation timeline.'
  )
on conflict (id) do nothing;
