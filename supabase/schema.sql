-- Little Warrior leaderboard schema.
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).

-- 1. Scores table
create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  name        text        not null,
  score       integer     not null,
  created_at  timestamptz not null default now(),
  -- basic sanity constraints
  constraint name_length  check (char_length(trim(name)) between 1 and 24),
  constraint score_range  check (score >= 0 and score <= 100000)
);

-- Helpful index for "top scores" queries.
create index if not exists scores_score_idx on public.scores (score desc, created_at asc);

-- 2. Row Level Security
-- With RLS on and only the policies below, the public (anon) key can read the
-- leaderboard and insert new scores, but cannot update or delete any row.
alter table public.scores enable row level security;

-- Anyone may read the leaderboard.
drop policy if exists "scores are readable by everyone" on public.scores;
create policy "scores are readable by everyone"
  on public.scores
  for select
  using (true);

-- Anyone may submit a score (row-level check mirrors the column constraints).
drop policy if exists "anyone can insert a score" on public.scores;
create policy "anyone can insert a score"
  on public.scores
  for insert
  with check (
    char_length(trim(name)) between 1 and 24
    and score >= 0
    and score <= 100000
  );

-- Note: no update/delete policies are defined, so those operations are denied
-- for the anon key. This is intentional. Manage/clean up rows from the
-- Supabase dashboard (service role) if needed.
