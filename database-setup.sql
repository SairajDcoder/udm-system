-- UniChain Cloud State Table
-- This stores the entire application state as a single JSONB document
-- in Supabase, making it globally accessible from anywhere.
--
-- Paste this into your Supabase SQL Editor and click Run.

CREATE TABLE IF NOT EXISTS public.unichain_state (
  "id" TEXT PRIMARY KEY DEFAULT 'main',
  "state" JSONB NOT NULL DEFAULT '{}',
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Insert an empty initial row
INSERT INTO public.unichain_state ("id", "state")
VALUES ('main', '{}')
ON CONFLICT ("id") DO NOTHING;

-- Disable RLS for server-side access
ALTER TABLE public.unichain_state DISABLE ROW LEVEL SECURITY;
