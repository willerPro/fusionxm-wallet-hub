
-- This is just for reference - it will be executed through the create_bot function
CREATE TABLE IF NOT EXISTS public.bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id),
  bot_type TEXT NOT NULL CHECK (bot_type IN ('binary', 'nextbase', 'contract')),
  duration INTEGER NOT NULL,
  profit_target INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'paused', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bots' AND policyname = 'Users can view their own bots'
  ) THEN
    ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view their own bots" ON public.bots FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own bots" ON public.bots FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own bots" ON public.bots FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own bots" ON public.bots FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;
