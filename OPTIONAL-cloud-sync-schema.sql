-- VIDYA NIRMAN OPTIONAL CLOUD LEARNING SYNC
-- Run once in Supabase SQL Editor. Safe for the current browser-only tracker.
-- Stores visits, quiz interactions/results and saved notes. AI chat text is excluded.
create table if not exists public.student_learning_records (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  record_type text not null check (record_type in ('visit','quiz','note')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
alter table public.student_learning_records enable row level security;
drop policy if exists "Users read own learning records" on public.student_learning_records;
create policy "Users read own learning records" on public.student_learning_records for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users insert own learning records" on public.student_learning_records;
create policy "Users insert own learning records" on public.student_learning_records for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users update own learning records" on public.student_learning_records;
create policy "Users update own learning records" on public.student_learning_records for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users delete own learning records" on public.student_learning_records;
create policy "Users delete own learning records" on public.student_learning_records for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.student_learning_records to authenticated;
