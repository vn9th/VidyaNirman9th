-- VIDYANIRMAN ADMIN PANEL — run once in Supabase SQL Editor.
-- 1) Replace asdigitalgraphics6@gmail.com below with the email used to sign in.
-- 2) Run the complete script. Never put a service_role/secret key in browser code.

create extension if not exists pgcrypto;

create table if not exists public.vn_admin_allowlist (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
insert into public.vn_admin_allowlist(email)
values ('asdigitalgraphics6@gmail.com')
on conflict (email) do nothing;

create or replace function public.vn_is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.vn_admin_allowlist a
    where a.email = lower(coalesce(auth.jwt()->>'email',''))
  );
$$;
revoke all on function public.vn_is_admin() from public;
grant execute on function public.vn_is_admin() to authenticated;

create table if not exists public.vn_student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  full_name text not null default '',
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.vn_sync_student_profile()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  insert into public.vn_student_profiles(user_id,email,full_name)
  values (new.id, coalesce(new.email,''), coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name',''))
  on conflict (user_id) do update set
    email=excluded.email,
    full_name=case when excluded.full_name<>'' then excluded.full_name else public.vn_student_profiles.full_name end,
    updated_at=now();
  return new;
end; $$;
drop trigger if exists vn_auth_user_profile_sync on auth.users;
create trigger vn_auth_user_profile_sync after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.vn_sync_student_profile();
insert into public.vn_student_profiles(user_id,email,full_name)
select id, coalesce(email,''), coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name','') from auth.users
on conflict (user_id) do nothing;

create table if not exists public.vn_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null default 'General',
  chapter text not null default '',
  description text not null default '',
  file_path text not null,
  file_name text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.vn_mcqs (
  id uuid primary key default gen_random_uuid(),
  subject text not null default 'General',
  chapter text not null default '',
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_index integer not null default 0 check (correct_index between 0 and 3),
  explanation text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.vn_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  link_url text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.vn_lab_experiments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null default 'Science',
  description text not null default '',
  media_url text not null default '',
  media_type text not null default 'link' check (media_type in ('link','image','video')),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: public students can read only published learning content; only allowlisted admin can mutate it.
do $$ declare t text; begin
  foreach t in array array['vn_notes','vn_mcqs','vn_announcements','vn_lab_experiments'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('drop policy if exists "Public read published" on public.%I',t);
    execute format('create policy "Public read published" on public.%I for select to anon, authenticated using (is_published = true or public.vn_is_admin())',t);
    execute format('drop policy if exists "Admin manage all" on public.%I',t);
    execute format('create policy "Admin manage all" on public.%I for all to authenticated using (public.vn_is_admin()) with check (public.vn_is_admin())',t);
    execute format('grant select on public.%I to anon, authenticated',t);
    execute format('grant insert, update, delete on public.%I to authenticated',t);
  end loop;
end $$;

alter table public.vn_student_profiles enable row level security;
drop policy if exists "Students read own profile" on public.vn_student_profiles;
create policy "Students read own profile" on public.vn_student_profiles for select to authenticated using (auth.uid()=user_id or public.vn_is_admin());
drop policy if exists "Admin manage student profiles" on public.vn_student_profiles;
create policy "Admin manage student profiles" on public.vn_student_profiles for update to authenticated using (public.vn_is_admin()) with check (public.vn_is_admin());
grant select on public.vn_student_profiles to authenticated;
grant update on public.vn_student_profiles to authenticated;

-- Public-read bucket for published learning PDFs/media; uploads/deletes are admin-only.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('vn-admin-assets','vn-admin-assets',true,52428800,array['application/pdf','image/jpeg','image/png','image/webp','video/mp4','video/webm'])
on conflict (id) do update set public=true, file_size_limit=52428800,
  allowed_mime_types=array['application/pdf','image/jpeg','image/png','image/webp','video/mp4','video/webm'];
drop policy if exists "VN public read admin assets" on storage.objects;
create policy "VN public read admin assets" on storage.objects for select to anon, authenticated using (bucket_id='vn-admin-assets');
drop policy if exists "VN admin upload assets" on storage.objects;
create policy "VN admin upload assets" on storage.objects for insert to authenticated with check (bucket_id='vn-admin-assets' and public.vn_is_admin());
drop policy if exists "VN admin update assets" on storage.objects;
create policy "VN admin update assets" on storage.objects for update to authenticated using (bucket_id='vn-admin-assets' and public.vn_is_admin()) with check (bucket_id='vn-admin-assets' and public.vn_is_admin());
drop policy if exists "VN admin delete assets" on storage.objects;
create policy "VN admin delete assets" on storage.objects for delete to authenticated using (bucket_id='vn-admin-assets' and public.vn_is_admin());

