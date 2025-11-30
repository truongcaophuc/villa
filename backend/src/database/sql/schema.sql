create table if not exists roles (
  name text primary key
);

insert into roles(name) values ('admin') on conflict do nothing;
insert into roles(name) values ('editor') on conflict do nothing;
insert into roles(name) values ('writer') on conflict do nothing;
insert into roles(name) values ('viewer') on conflict do nothing;
insert into roles(name) values ('user') on conflict do nothing;

create table if not exists users (
  id uuid primary key,
  email text not null unique,
  name text,
  avatar text,
  role text references roles(name) default 'viewer',
  banned boolean default false,
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  featured_image text,
  meta_title text,
  meta_description text,
  published_at timestamptz,
  is_published boolean default false,
  author_id uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists post_categories (
  post_id uuid references posts(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key(post_id, category_id)
);

create table if not exists post_tags (
  post_id uuid references posts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key(post_id, tag_id)
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  url text not null,
  mime_type text not null,
  owner_id uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id bigserial primary key,
  actor_id uuid,
  action text,
  entity text,
  entity_id uuid,
  created_at timestamptz default now()
);

create index if not exists idx_posts_slug on posts(slug);
create index if not exists idx_posts_published_at on posts(published_at);
create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_tags_slug on tags(slug);

-- Ensure avatar column exists for existing databases
alter table if exists users add column if not exists avatar text;

-- Comments
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create index if not exists idx_comments_post_created on comments(post_id, created_at desc);
-- Translations tables for multi-language content
create table if not exists post_translations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  locale text not null,
  title text not null,
  excerpt text,
  content text,
  meta_title text,
  meta_description text,
  slug text not null,
  unique(post_id, locale)
);
create unique index if not exists post_translations_locale_slug_idx on post_translations(locale, slug);

create table if not exists category_translations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  locale text not null,
  name text not null,
  slug text not null,
  unique(category_id, locale)
);
create unique index if not exists category_translations_locale_slug_idx on category_translations(locale, slug);

create table if not exists tag_translations (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid references tags(id) on delete cascade,
  locale text not null,
  name text not null,
  slug text not null,
  unique(tag_id, locale)
);
create unique index if not exists tag_translations_locale_slug_idx on tag_translations(locale, slug);
