-- ============================================================
-- RLS Policies for the Golf Charity Subscription Platform
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ========================
-- USERS TABLE
-- ========================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full access to users" ON public.users;
CREATE POLICY "Allow service role full access to users"
  ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
CREATE POLICY "Users can read their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid()::text = id::text OR current_setting('request.jwt.claim.role', true) = 'service_role');

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- ========================
-- SCORES TABLE
-- ========================
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to scores" ON public.scores;
CREATE POLICY "Service role full access to scores"
  ON public.scores
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================
-- SUBSCRIPTIONS TABLE
-- ========================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to subscriptions" ON public.subscriptions;
CREATE POLICY "Service role full access to subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================
-- DRAWS TABLE
-- ========================
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to draws" ON public.draws;
CREATE POLICY "Service role full access to draws"
  ON public.draws
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================
-- DRAW_ENTRIES TABLE
-- ========================
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to draw_entries" ON public.draw_entries;
CREATE POLICY "Service role full access to draw_entries"
  ON public.draw_entries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================
-- WINNERS TABLE
-- ========================
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to winners" ON public.winners;
CREATE POLICY "Service role full access to winners"
  ON public.winners
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================
-- PAYMENTS TABLE
-- ========================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to payments" ON public.payments;
CREATE POLICY "Service role full access to payments"
  ON public.payments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================
-- CHARITIES TABLE
-- ========================
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to charities" ON public.charities;
CREATE POLICY "Service role full access to charities"
  ON public.charities
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read charities" ON public.charities;
CREATE POLICY "Anyone can read charities"
  ON public.charities
  FOR SELECT
  USING (true);
