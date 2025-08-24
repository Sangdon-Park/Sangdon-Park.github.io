-- Supabase schema for chat_logs table used by chat-ai-driven Netlify function
-- Run this in Supabase SQL editor

-- 1) Extensions
create extension if not exists "pgcrypto";

-- 2) Create table if not exists (final desired schema)
create table if not exists public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_message text not null,
  bot_response text not null,
  conversation_history jsonb,
  action_taken text,
  search_results jsonb,
  user_ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- 3) Safe renames for legacy columns (only if they exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='chat_logs' AND column_name='message'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='chat_logs' AND column_name='user_message'
  ) THEN
    EXECUTE 'ALTER TABLE public.chat_logs RENAME COLUMN message TO user_message';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='chat_logs' AND column_name='response'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='chat_logs' AND column_name='bot_response'
  ) THEN
    EXECUTE 'ALTER TABLE public.chat_logs RENAME COLUMN response TO bot_response';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='chat_logs' AND column_name='ip_address'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='chat_logs' AND column_name='user_ip'
  ) THEN
    EXECUTE 'ALTER TABLE public.chat_logs RENAME COLUMN ip_address TO user_ip';
  END IF;
END $$;

-- 4) Ensure required columns exist
ALTER TABLE public.chat_logs
  ADD COLUMN IF NOT EXISTS conversation_history jsonb,
  ADD COLUMN IF NOT EXISTS action_taken text,
  ADD COLUMN IF NOT EXISTS search_results jsonb,
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS user_message text,
  ADD COLUMN IF NOT EXISTS bot_response text,
  ADD COLUMN IF NOT EXISTS user_ip text;

-- 5) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON public.chat_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_action ON public.chat_logs (action_taken);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_ip ON public.chat_logs (user_ip);
CREATE INDEX IF NOT EXISTS idx_chat_logs_history_gin ON public.chat_logs USING gin (conversation_history);
CREATE INDEX IF NOT EXISTS idx_chat_logs_results_gin ON public.chat_logs USING gin (search_results);

-- 6) (Optional) RLS policy for service role
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='chat_logs' AND policyname='service_role_full_access'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY service_role_full_access
      ON public.chat_logs
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
    $pol$;
  END IF;
END $$;

-- 7) Verify
-- SELECT id, created_at, user_message, left(bot_response, 80) AS bot_response
-- FROM public.chat_logs
-- ORDER BY created_at DESC
-- LIMIT 5;