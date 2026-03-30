-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    personal_email,
    institutional_email,
    enrollment_id,
    role,
    department,
    programme,
    admission_year,
    phone,
    date_of_birth,
    gender,
    mfa_enabled
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'personal_email', null),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'enrollment_id', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'Student'),
    coalesce(new.raw_user_meta_data ->> 'department', null),
    coalesce(new.raw_user_meta_data ->> 'programme', null),
    (new.raw_user_meta_data ->> 'admission_year')::integer,
    coalesce(new.raw_user_meta_data ->> 'phone', null),
    (new.raw_user_meta_data ->> 'date_of_birth')::date,
    coalesce(new.raw_user_meta_data ->> 'gender', null),
    coalesce((new.raw_user_meta_data ->> 'mfa_enabled')::boolean, true)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Drop existing trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Trigger for updated_at
drop trigger if exists update_profiles_updated_at on public.profiles;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();
