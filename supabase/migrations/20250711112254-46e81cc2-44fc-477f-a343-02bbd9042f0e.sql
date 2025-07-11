-- Create user_settings table for notification preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_alerts BOOLEAN NOT NULL DEFAULT true,
  bot_alerts BOOLEAN NOT NULL DEFAULT true,
  market_alerts BOOLEAN NOT NULL DEFAULT true,
  news_updates BOOLEAN NOT NULL DEFAULT true,
  two_factor BOOLEAN NOT NULL DEFAULT false,
  login_alerts BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Add trigger for timestamp updates
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update activities table to match component expectations
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS activity_type TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES public.wallets(id);
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS date_added TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS profit DECIMAL(15,2) DEFAULT 0;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS current_profit DECIMAL(15,2) DEFAULT 0;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS total_earned DECIMAL(15,2) DEFAULT 0;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update bots table to add missing columns
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES public.wallets(id);
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS bot_type TEXT;
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS profit_target DECIMAL(15,2) DEFAULT 0;