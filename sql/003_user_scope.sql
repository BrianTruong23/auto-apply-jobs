alter table if exists profiles add column if not exists user_id text;
update profiles set user_id = id where user_id is null;
create unique index if not exists profiles_user_id_idx on profiles (user_id);

alter table if exists job_sources add column if not exists user_id text;
update job_sources set user_id = 'legacy-user' where user_id is null;

alter table if exists jobs add column if not exists user_id text;
update jobs set user_id = 'legacy-user' where user_id is null;
alter table if exists jobs
  drop constraint if exists jobs_canonical_key_key;
create unique index if not exists jobs_user_canonical_idx on jobs (user_id, canonical_key);

alter table if exists answers add column if not exists user_id text;
update answers set user_id = 'legacy-user' where user_id is null;

alter table if exists applications add column if not exists user_id text;
update applications set user_id = 'legacy-user' where user_id is null;

alter table if exists runs add column if not exists user_id text;
update runs set user_id = 'legacy-user' where user_id is null;
