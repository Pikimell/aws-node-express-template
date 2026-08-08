create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  nickname text not null,
  password text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  refresh_token text not null unique,
  expires_at timestamptz not null,
  user_agent text,
  ip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  type text not null check (type in ('updates', 'news', 'testimonials', 'video stories')),
  type_account text not null check (type_account in ('freeUser', 'paidUser', 'agencyUser')),
  topic text not null,
  text text not null,
  files text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cars (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  make text not null,
  model text not null,
  year integer not null check (year >= 1886),
  color text,
  price double precision check (price >= 0),
  mileage double precision check (mileage >= 0),
  vin text,
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sessions_refresh_token_idx on sessions(refresh_token);
create index if not exists sessions_expires_at_idx on sessions(expires_at);
create index if not exists news_user_id_idx on news(user_id);
create index if not exists news_type_idx on news(type);
create index if not exists news_type_account_idx on news(type_account);
create index if not exists cars_user_id_idx on cars(user_id);
create index if not exists cars_make_idx on cars(make);
create index if not exists cars_year_idx on cars(year);
create index if not exists cars_vin_idx on cars(vin);
