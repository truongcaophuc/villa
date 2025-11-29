alter table users enable row level security;
alter table posts enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table post_categories enable row level security;
alter table post_tags enable row level security;
alter table media enable row level security;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from users u where u.id = uid and u.role = 'admin');
$$;

create or replace function public.is_editor_or_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from users u where u.id = uid and u.role in ('editor','admin'));
$$;

create or replace function public.is_writer_or_above(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from users u where u.id = uid and u.role in ('writer','editor','admin'));
$$;

create policy users_select_self on users for select using (
  auth.uid() = id
);

create policy users_update_admin_only on users for update using (
  public.is_admin(auth.uid())
);

create policy posts_select_published_or_author on posts for select using (
  is_published = true or author_id = auth.uid() or public.is_editor_or_admin(auth.uid())
);

create policy posts_insert_writer_or_above on posts for insert with check (
  public.is_writer_or_above(auth.uid())
);

create policy posts_update_editor_or_author on posts for update using (
  author_id = auth.uid() or public.is_editor_or_admin(auth.uid())
);

create policy posts_delete_editor_or_admin on posts for delete using (
  public.is_editor_or_admin(auth.uid())
);

create policy categories_select_all on categories for select using (true);
create policy categories_write_editor_or_admin on categories for all using (
  public.is_editor_or_admin(auth.uid())
);

create policy tags_select_all on tags for select using (true);
create policy tags_write_editor_or_admin on tags for all using (
  public.is_editor_or_admin(auth.uid())
);

create policy media_select_owner_or_admin on media for select using (
  owner_id = auth.uid() or public.is_editor_or_admin(auth.uid())
);

create policy media_insert_owner_or_above on media for insert with check (
  auth.uid() = owner_id or public.is_writer_or_above(auth.uid())
);

create policy media_delete_editor_or_admin on media for delete using (
  public.is_editor_or_admin(auth.uid())
);

alter table storage.objects enable row level security;

create policy storage_media_insert_authenticated on storage.objects for insert to authenticated
  with check (
    bucket_id = (select id from storage.buckets where name = 'media')
    and name like auth.uid()::text || '/%'
  );

create policy storage_media_update_authenticated on storage.objects for update to authenticated
  using (
    bucket_id = (select id from storage.buckets where name = 'media')
    and name like auth.uid()::text || '/%'
  )
  with check (
    bucket_id = (select id from storage.buckets where name = 'media')
    and name like auth.uid()::text || '/%'
  );

create policy storage_media_delete_authenticated on storage.objects for delete to authenticated
  using (
    bucket_id = (select id from storage.buckets where name = 'media')
    and name like auth.uid()::text || '/%'
  );