create extension if not exists "pgcrypto";

create table if not exists publication_tasks (
  id uuid primary key default gen_random_uuid(),
  correlation_id text not null unique,
  source_url text not null,
  normalized_url text not null,
  source_type text not null check (source_type in ('article', 'youtube')),
  title text not null,
  status text not null check (status in ('draft', 'processing', 'needs_approval', 'approved', 'publishing', 'partially_published', 'published', 'failed')),
  brand text not null,
  locale text not null,
  tone text not null,
  use_ai_image boolean not null default false,
  requested_channels text[] not null default '{}',
  total_estimated_cost_usd numeric(10,2) not null default 0,
  total_latency_ms integer not null default 0,
  retry_count integer not null default 0,
  last_run_stage text not null default 'ingest',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists source_assets (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references publication_tasks(id) on delete cascade,
  source_type text not null check (source_type in ('article', 'youtube')),
  normalized_url text not null,
  canonical_date date not null,
  title text not null,
  author text,
  summary text,
  transcript_status text not null check (transcript_status in ('available', 'missing', 'not_required')),
  extraction_status text not null check (extraction_status in ('ok', 'needs_approval', 'retryable_error', 'fatal_error', 'skipped'))
);

create table if not exists channel_drafts (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references publication_tasks(id) on delete cascade,
  channel text not null check (channel in ('linkedin', 'facebook', 'instagram', 'x', 'threads')),
  headline text not null,
  body text not null,
  character_count integer not null,
  requires_approval boolean not null default true,
  approved_revision integer not null default 1,
  validation_warnings text[] not null default '{}',
  image_prompt text
);

create table if not exists approval_decisions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references publication_tasks(id) on delete cascade,
  channel text not null check (channel in ('linkedin', 'facebook', 'instagram', 'x', 'threads')),
  status text not null check (status in ('pending', 'approved', 'rejected')),
  reviewer_name text,
  reviewed_at timestamptz,
  note text
);

create table if not exists publish_attempts (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references publication_tasks(id) on delete cascade,
  channel text not null check (channel in ('linkedin', 'facebook', 'instagram', 'x', 'threads')),
  account_id text not null,
  idempotency_key text not null unique,
  status text not null check (status in ('draft', 'queued', 'published', 'failed')),
  published_at timestamptz,
  external_post_id text,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists execution_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references publication_tasks(id) on delete cascade,
  stage text not null,
  status text not null check (status in ('ok', 'needs_approval', 'retryable_error', 'fatal_error', 'skipped')),
  message text not null,
  latency_ms integer not null default 0,
  estimated_cost_usd numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists integration_bindings (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  environment text not null check (environment in ('dev', 'staging', 'prod')),
  status text not null check (status in ('healthy', 'warning', 'disconnected')),
  scopes text[] not null default '{}',
  last_rotated_at timestamptz not null
);

create table if not exists prompt_templates (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  channel text not null,
  locale text not null,
  content_type text not null,
  version integer not null,
  status text not null check (status in ('draft', 'active')),
  template text not null
);

create index if not exists idx_publication_tasks_status on publication_tasks(status);
create index if not exists idx_source_assets_task_id on source_assets(task_id);
create index if not exists idx_channel_drafts_task_id on channel_drafts(task_id);
create index if not exists idx_approval_decisions_task_id on approval_decisions(task_id);
create index if not exists idx_publish_attempts_task_id on publish_attempts(task_id);
create index if not exists idx_execution_events_task_id on execution_events(task_id);
create index if not exists idx_execution_events_created_at on execution_events(created_at desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_publication_tasks_updated_at on publication_tasks;
create trigger trg_publication_tasks_updated_at
before update on publication_tasks
for each row
execute function set_updated_at();
