-- Create profiles table for UniChain users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  date_of_birth date,
  gender text check (gender in ('Male', 'Female', 'Prefer not to say')),
  phone text,
  personal_email text,
  institutional_email text,
  enrollment_id text unique,
  role text check (role in ('Student', 'Faculty', 'Admin', 'Verifier')) default 'Student',
  department text,
  programme text,
  admission_year integer,
  photo_url text,
  wallet_address text,
  mfa_enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
create policy "profiles_select_own" on public.profiles 
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles 
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles 
  for update using (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles 
  for delete using (auth.uid() = id);

-- Allow admins and verifiers to view all profiles
create policy "profiles_select_admin" on public.profiles 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('Admin', 'Verifier')
    )
  );
