-- Add web push subscriptions support (non-destructive)

CREATE TABLE IF NOT EXISTS public.web_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_web_push_subscriptions_user_id
  ON public.web_push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_web_push_subscriptions_active
  ON public.web_push_subscriptions(active);

ALTER TABLE public.web_push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own web push subscriptions" ON public.web_push_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own web push subscriptions" ON public.web_push_subscriptions;
DROP POLICY IF EXISTS "Users can update their own web push subscriptions" ON public.web_push_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own web push subscriptions" ON public.web_push_subscriptions;
DROP POLICY IF EXISTS "Service role can manage web push subscriptions" ON public.web_push_subscriptions;

CREATE POLICY "Users can view their own web push subscriptions"
  ON public.web_push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own web push subscriptions"
  ON public.web_push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own web push subscriptions"
  ON public.web_push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own web push subscriptions"
  ON public.web_push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage web push subscriptions"
  ON public.web_push_subscriptions
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.web_push_subscriptions IS 'Browser push subscriptions for web notifications via VAPID';