alter table if exists answers
  add column if not exists company_context text;

alter table if exists answers
  add column if not exists role_context text;
