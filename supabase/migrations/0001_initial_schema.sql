-- Personal OS — Phase 0 initial schema
-- Single-user app, RLS disabled, service role only.

create extension if not exists vector;
create extension if not exists pgcrypto;

create table briefings (
  id uuid primary key default gen_random_uuid(),
  type text not null,           -- morning | midday | eod | weekly
  content text not null,
  slack_ts text,
  created_at timestamptz default now()
);

create table drafts (
  id uuid primary key default gen_random_uuid(),
  channel text not null,        -- email | slack
  thread_ref text,              -- gmail msg id or slack thread ts
  recipient text,
  subject text,
  body text not null,
  priority int default 3,
  reasoning text,
  status text default 'pending', -- pending | approved | rejected | sent
  approved_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table prep_briefs (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_title text,
  event_start timestamptz,
  brief text not null,
  slack_ts text,
  created_at timestamptz default now()
);

create table monitor_alerts (
  id uuid primary key default gen_random_uuid(),
  source text not null,         -- slack | gmail | supabase | airtable
  trigger text not null,
  context jsonb,
  slack_ts text,
  created_at timestamptz default now()
);

create table voice_notes (
  id uuid primary key default gen_random_uuid(),
  transcript text not null,
  classification text,          -- task | memory | decision | contact | random
  routed_to text,               -- file path
  status text default 'pending', -- pending | routed | rejected
  created_at timestamptz default now()
);

create table embeddings (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  chunk_index int not null,
  chunk_text text not null,
  embedding vector(1536),
  file_modified_at timestamptz,
  created_at timestamptz default now(),
  unique(file_path, chunk_index)
);
create index on embeddings using ivfflat (embedding vector_cosine_ops);

create table eval_scores (
  id uuid primary key default gen_random_uuid(),
  workflow text not null,
  run_id text,
  tokens_in int,
  tokens_out int,
  cost_usd numeric(10,4),
  latency_ms int,
  quality_score numeric(3,1),   -- 1.0 to 5.0
  rubric_breakdown jsonb,
  created_at timestamptz default now()
);
