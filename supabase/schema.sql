-- PM Mastermind Database Schema

-- Profiles table (extends Supabase Auth)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'attendee' check (role in ('admin', 'attendee')),
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    'attendee'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Event info (single-row)
create table event_info (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'PM Mastermind',
  event_date date,
  event_time text,
  location text,
  venue_name text,
  description text,
  additional_notes text,
  updated_at timestamptz default now()
);

-- Insert default row
insert into event_info (title) values ('PM Mastermind');

-- Checklist items (admin-created)
create table checklist_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

-- Checklist progress (per attendee)
create table checklist_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  item_id uuid not null references checklist_items(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique(user_id, item_id)
);

-- Itinerary items
create table itinerary_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  date date,
  start_time text,
  end_time text,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

-- Event files
create table event_files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  file_url text not null,
  file_type text,
  uploaded_at timestamptz default now()
);

-- Chat messages
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- ========================
-- Row Level Security (RLS)
-- ========================

alter table profiles enable row level security;
alter table event_info enable row level security;
alter table checklist_items enable row level security;
alter table checklist_progress enable row level security;
alter table itinerary_items enable row level security;
alter table event_files enable row level security;
alter table chat_messages enable row level security;

-- Helper function to check admin role without triggering RLS recursion.
-- SECURITY DEFINER runs as the DB owner, bypassing RLS on the profiles table.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Profiles: users can read own profile, admins can read all
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Admins can read all profiles"
  on profiles for select using (public.is_admin());

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Event info: anyone authenticated can read, admins can update
create policy "Authenticated users can read event info"
  on event_info for select using (auth.role() = 'authenticated');

create policy "Admins can update event info"
  on event_info for update using (public.is_admin());

-- Checklist items: anyone authenticated can read, admins can manage
create policy "Authenticated users can read checklist items"
  on checklist_items for select using (auth.role() = 'authenticated');

create policy "Admins can insert checklist items"
  on checklist_items for insert with check (public.is_admin());

create policy "Admins can update checklist items"
  on checklist_items for update using (public.is_admin());

create policy "Admins can delete checklist items"
  on checklist_items for delete using (public.is_admin());

-- Checklist progress: users manage own, admins can read all
create policy "Users can read own checklist progress"
  on checklist_progress for select using (auth.uid() = user_id);

create policy "Users can insert own checklist progress"
  on checklist_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own checklist progress"
  on checklist_progress for update using (auth.uid() = user_id);

create policy "Users can delete own checklist progress"
  on checklist_progress for delete using (auth.uid() = user_id);

create policy "Admins can read all checklist progress"
  on checklist_progress for select using (public.is_admin());

-- Itinerary: anyone authenticated can read, admins can manage
create policy "Authenticated users can read itinerary"
  on itinerary_items for select using (auth.role() = 'authenticated');

create policy "Admins can insert itinerary items"
  on itinerary_items for insert with check (public.is_admin());

create policy "Admins can update itinerary items"
  on itinerary_items for update using (public.is_admin());

create policy "Admins can delete itinerary items"
  on itinerary_items for delete using (public.is_admin());

-- Event files: anyone authenticated can read, admins can manage
create policy "Authenticated users can read event files"
  on event_files for select using (auth.role() = 'authenticated');

create policy "Admins can insert event files"
  on event_files for insert with check (public.is_admin());

create policy "Admins can delete event files"
  on event_files for delete using (public.is_admin());

-- Chat messages: users can manage own messages
create policy "Users can read own chat messages"
  on chat_messages for select using (auth.uid() = user_id);

create policy "Users can insert own chat messages"
  on chat_messages for insert with check (auth.uid() = user_id);

-- ========================
-- Storage bucket for event files
-- ========================

insert into storage.buckets (id, name, public)
values ('event-files', 'event-files', true);

create policy "Authenticated users can read event files storage"
  on storage.objects for select
  using (bucket_id = 'event-files' and auth.role() = 'authenticated');

create policy "Admins can upload event files"
  on storage.objects for insert
  with check (bucket_id = 'event-files' and public.is_admin());

create policy "Admins can delete event files storage"
  on storage.objects for delete
  using (bucket_id = 'event-files' and public.is_admin());
