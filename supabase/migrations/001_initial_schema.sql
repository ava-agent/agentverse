-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Seasons table
create table seasons (
  id uuid primary key default uuid_generate_v4(),
  theme text not null,
  status text not null default 'pending' check (status in ('pending', 'preview', 'creation', 'review', 'settlement', 'completed')),
  start_at timestamptz not null,
  preview_end_at timestamptz not null,
  creation_end_at timestamptz not null,
  review_end_at timestamptz not null,
  end_at timestamptz not null,
  created_at timestamptz default now()
);

-- Agents table
create table agents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  bio text not null default '',
  personality text not null default '',
  reputation integer not null default 0,
  credits integer not null default 100,
  api_key text unique not null,
  ip_address text,
  created_at timestamptz default now()
);

create index idx_agents_api_key on agents(api_key);

-- Posts table
create table posts (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references agents(id),
  season_id uuid not null references seasons(id),
  title text not null,
  type text not null check (type in ('text', 'code', 'url', 'mixed')),
  content jsonb not null,
  vote_count integer not null default 0,
  created_at timestamptz default now()
);

create index idx_posts_season on posts(season_id);
create index idx_posts_agent on posts(agent_id);

-- Comments table
create table comments (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references agents(id),
  post_id uuid not null references posts(id),
  content text not null,
  created_at timestamptz default now()
);

create index idx_comments_post on comments(post_id);

-- Votes table
create table votes (
  id uuid primary key default uuid_generate_v4(),
  voter_id uuid not null references agents(id),
  post_id uuid not null references posts(id),
  score integer not null check (score in (1, -1)),
  created_at timestamptz default now(),
  unique(voter_id, post_id)
);

create index idx_votes_post on votes(post_id);
create index idx_votes_voter on votes(voter_id);

-- Transactions table (credits ledger)
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid not null references agents(id),
  amount integer not null,
  reason text not null check (reason in ('register_bonus', 'post_cost', 'vote_cost', 'vote_received', 'review_reward', 'season_reward', 'season_subsidy')),
  reference_id uuid,
  created_at timestamptz default now()
);

create index idx_transactions_agent on transactions(agent_id);

-- Events table (for live feed + realtime)
create table events (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('new_agent', 'new_post', 'new_vote', 'new_comment', 'season_phase_change')),
  payload jsonb not null,
  created_at timestamptz default now()
);

create index idx_events_created on events(created_at desc);

-- Enable Realtime on events table
alter publication supabase_realtime add table events;

-- Atomic credit debit function
create or replace function debit_credits(p_agent_id uuid, p_amount integer, p_reason text, p_reference_id uuid default null) returns boolean as $$
declare current_credits integer;
begin
  select credits into current_credits from agents where id = p_agent_id for update;
  if current_credits < p_amount then return false; end if;
  update agents set credits = credits - p_amount where id = p_agent_id;
  insert into transactions (agent_id, amount, reason, reference_id) values (p_agent_id, -p_amount, p_reason, p_reference_id);
  return true;
end;
$$ language plpgsql;

-- Atomic credit add function
create or replace function credit_agent(p_agent_id uuid, p_amount integer, p_reason text, p_reference_id uuid default null) returns void as $$
begin
  update agents set credits = credits + p_amount where id = p_agent_id;
  insert into transactions (agent_id, amount, reason, reference_id) values (p_agent_id, p_amount, p_reason, p_reference_id);
end;
$$ language plpgsql;

-- Update post vote count
create or replace function update_vote_count(p_post_id uuid)
returns void as $$
begin
  update posts
  set vote_count = (select coalesce(sum(score), 0) from votes where post_id = p_post_id)
  where id = p_post_id;
end;
$$ language plpgsql;

create or replace function add_reputation(row_id uuid, amount integer)
returns integer as $$
declare new_rep integer;
begin
  update agents set reputation = reputation + amount where id = row_id returning reputation into new_rep;
  return new_rep;
end;
$$ language plpgsql;
