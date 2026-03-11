create table if not exists schema_migrations (
  version text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists profiles (
  id text primary key,
  full_name text not null,
  email text not null,
  location text not null,
  summary text not null,
  resume_text text not null,
  preferred_roles jsonb not null,
  preferred_locations jsonb not null,
  preferred_companies jsonb not null,
  skills jsonb not null
);

create table if not exists job_sources (
  id text primary key,
  name text not null,
  type text not null,
  base_url text,
  keywords jsonb not null,
  companies jsonb not null,
  roles jsonb not null,
  locations jsonb not null,
  workplace_modes jsonb not null,
  enabled boolean not null,
  last_checked_at text
);

create table if not exists jobs (
  id text primary key,
  canonical_key text not null unique,
  company text not null,
  title text not null,
  location text not null,
  workplace_mode text not null,
  status text not null,
  fit_score double precision not null,
  source text not null,
  source_url text not null,
  application_url text not null,
  posted_at text,
  explanation jsonb not null,
  description_text text not null,
  raw_payload jsonb not null,
  normalized_payload jsonb not null
);

create table if not exists answers (
  id text primary key,
  question_type text not null,
  normalized_question text not null,
  company_context text,
  role_context text,
  answer_text text not null,
  usage_count integer not null,
  last_used_at text
);

create table if not exists applications (
  id text primary key,
  job_id text not null,
  company text not null,
  title text not null,
  status text not null,
  current_step text not null,
  outcome text,
  notes text not null
);

create table if not exists runs (
  id text primary key,
  run_type text not null,
  status text not null,
  started_at text not null,
  finished_at text,
  summary text not null
);
