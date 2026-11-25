-- VN SST cloud progress storage
-- Run this once in Supabase Dashboard > SQL Editor for the Vidya Nirman project.

create table if not exists public.vn_sst_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.vn_sst_progress enable row level security;

drop policy if exists "Students can read their own VN SST progress" on public.vn_sst_progress;
create policy "Students can read their own VN SST progress"
  on public.vn_sst_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Students can insert their own VN SST progress" on public.vn_sst_progress;
create policy "Students can insert their own VN SST progress"
  on public.vn_sst_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Students can update their own VN SST progress" on public.vn_sst_progress;
create policy "Students can update their own VN SST progress"
  on public.vn_sst_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.vn_sst_progress to authenticated;
