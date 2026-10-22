create extension if not exists pgcrypto;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_ar text,
  name_en text not null,
  desc_ar text,
  desc_en text,
  url text null,
  tags text[] not null default '{}',
  shots text[] not null default '{}',
  position int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  name_ar text not null default '',
  name_en text not null default '',
  title_ar text not null default '',
  title_en text not null default '',
  intro_ar text not null default '',
  intro_en text not null default '',
  footer_ar text not null default '',
  footer_en text not null default '',
  email text not null default '',
  linkedin text not null default '',
  github text not null default '',
  updated_at timestamptz not null default now()
);

create table public.owner (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_touch_updated_at
before update on public.projects
for each row execute function public.touch_updated_at();

create trigger site_settings_touch_updated_at
before update on public.site_settings
for each row execute function public.touch_updated_at();

revoke all on function public.touch_updated_at() from public, anon, authenticated;
grant execute on function public.touch_updated_at() to authenticated;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.owner
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_owner() from public;
revoke all on function public.is_owner() from anon, authenticated;
grant execute on function public.is_owner() to anon, authenticated;

alter table public.projects enable row level security;
alter table public.site_settings enable row level security;
alter table public.owner enable row level security;

revoke all on table public.owner from public, anon, authenticated;

revoke all on table public.projects from public, anon, authenticated;
grant select on table public.projects to anon;
grant select, insert, update, delete on table public.projects to authenticated;

revoke all on table public.site_settings from public, anon, authenticated;
grant select on table public.site_settings to anon;
grant select, insert, update, delete on table public.site_settings to authenticated;

create policy projects_public_read
on public.projects
for select
to anon, authenticated
using (published = true);

create policy projects_authenticated_read
on public.projects
for select
to authenticated
using (public.is_owner());

create policy projects_owner_insert
on public.projects
for insert
to authenticated
with check (public.is_owner());

create policy projects_owner_update
on public.projects
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy projects_owner_delete
on public.projects
for delete
to authenticated
using (public.is_owner());

create policy site_settings_public_read
on public.site_settings
for select
to anon, authenticated
using (true);

create policy site_settings_owner_insert
on public.site_settings
for insert
to authenticated
with check (public.is_owner());

create policy site_settings_owner_update
on public.site_settings
for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy site_settings_owner_delete
on public.site_settings
for delete
to authenticated
using (public.is_owner());

create index projects_published_position_idx
on public.projects (published, position);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-shots',
  'project-shots',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy project_shots_public_read
on storage.objects
for select
to public
using (bucket_id = 'project-shots');

create policy project_shots_owner_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'project-shots' and public.is_owner());

create policy project_shots_owner_update
on storage.objects
for update
to authenticated
using (bucket_id = 'project-shots' and public.is_owner())
with check (bucket_id = 'project-shots' and public.is_owner());

create policy project_shots_owner_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'project-shots' and public.is_owner());
