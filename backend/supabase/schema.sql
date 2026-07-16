-- =========================================================
-- English Learning Material Auto-Generation App
-- Supabase (PostgreSQL) schema
--
-- NOTE: RLS (Row Level Security) is intentionally left DISABLED
-- during early development. Before production, enable RLS on every
-- table below and add policies scoped to auth.uid().
-- =========================================================

create extension if not exists "pgcrypto";

-- 1st tier: Article (記事全体)
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary_ja text,
  difficulty_level text not null default 'intermediate'
    check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  raw_text text not null,
  source_url text,
  created_at timestamptz not null default now()
);

-- 2nd tier: Paragraph (段落)
create table if not exists paragraphs (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  order_index int not null,
  text text not null,
  translation_ja text
);

-- 3rd tier: Sentence (文)
create table if not exists sentences (
  id uuid primary key default gen_random_uuid(),
  paragraph_id uuid not null references paragraphs(id) on delete cascade,
  order_index int not null,
  text text not null,
  translation_ja text
);

-- 4th tier: Vocabulary (単語)
create table if not exists vocabulary (
  id uuid primary key default gen_random_uuid(),
  sentence_id uuid not null references sentences(id) on delete cascade,
  word text not null,
  part_of_speech text,
  meaning_ja text
);

-- Review quiz questions generated from an article. Exactly two modes,
-- both 日→英 記述 (spelling): fill in the target word ('vocabulary') or
-- type out the whole sentence ('sentence').
create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  type text not null check (type in ('vocabulary', 'sentence')),
  -- The full correct answer: the target word (vocabulary) or the full
  -- sentence (sentence).
  answer text not null,
  -- The English text to show, with the target word/sentence blanked out.
  fill_in_sentence text not null,
  -- Japanese translation of the full sentence, always shown as a hint.
  sentence_translation_ja text not null,
  -- Populated only for type='vocabulary'.
  part_of_speech_ja text,
  meaning_ja text,
  created_at timestamptz not null default now()
);

-- Per-question progress: auto-set to 'correct'/'incorrect' when answered in a
-- quiz session, and used to power the article detail screen's status/test
-- shortcuts and vocabulary list. Added via ALTER (rather than inline above)
-- so it also applies to pre-existing tables.
alter table quiz_questions add column if not exists status text not null default 'unanswered'
  check (status in ('unanswered', 'correct', 'incorrect'));

-- Fixes display order (article/sentence generation order) so status updates
-- - which rewrite the row and can change its physical position in an
-- unordered scan - never reshuffle the vocabulary list. Existing rows all
-- default to 0 and sort by id as a tiebreak; only newly-generated articles
-- get a real sequence (set in analyze_service.py).
alter table quiz_questions add column if not exists order_index int not null default 0;

-- Drop columns from the old multiple_choice / en_to_ja quiz format
-- (no-ops on fresh installs where they were never created above).
alter table sentences drop column if exists grammar_point;
alter table vocabulary drop column if exists phonetic;
alter table vocabulary drop column if exists example_sentence;
alter table quiz_questions drop column if exists direction;
alter table quiz_questions drop column if exists format;
alter table quiz_questions drop column if exists question;
alter table quiz_questions drop column if exists choices;
alter table quiz_questions drop column if exists explanation;

-- Spaced-repetition flash cards, one per vocabulary item
create table if not exists review_cards (
  id uuid primary key default gen_random_uuid(),
  vocabulary_id uuid not null references vocabulary(id) on delete cascade,
  next_review_at timestamptz not null default now(),
  interval_days int not null default 1,
  ease_factor numeric not null default 2.5,
  repetitions int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_paragraphs_article_id on paragraphs(article_id);
create index if not exists idx_sentences_paragraph_id on sentences(paragraph_id);
create index if not exists idx_vocabulary_sentence_id on vocabulary(sentence_id);
create index if not exists idx_quiz_questions_article_id on quiz_questions(article_id);
create index if not exists idx_review_cards_next_review_at on review_cards(next_review_at);

-- RLS explicitly disabled for early development (default state, kept explicit for clarity)
alter table articles disable row level security;
alter table paragraphs disable row level security;
alter table sentences disable row level security;
alter table vocabulary disable row level security;
alter table quiz_questions disable row level security;
alter table review_cards disable row level security;
