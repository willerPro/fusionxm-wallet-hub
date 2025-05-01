
-- Function to increment a wallet's balance
CREATE OR REPLACE FUNCTION public.increment_wallet_balance(wallet_id_param UUID, amount_param DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.wallets
  SET balance = COALESCE(balance, 0) + amount_param,
      updated_at = now()
  WHERE id = wallet_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement a wallet's balance
CREATE OR REPLACE FUNCTION public.decrement_wallet_balance(wallet_id_param UUID, amount_param DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.wallets
  SET balance = COALESCE(balance, 0) - amount_param,
      updated_at = now()
  WHERE id = wallet_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new bot
CREATE OR REPLACE FUNCTION public.create_bot(
  user_id_param UUID,
  wallet_id_param UUID,
  bot_type_param TEXT,
  duration_param INTEGER,
  profit_target_param DECIMAL,
  amount_param DECIMAL
)
RETURNS UUID AS $$
DECLARE
  bot_id UUID;
BEGIN
  INSERT INTO public.bots (
    user_id,
    wallet_id,
    bot_type,
    duration,
    profit_target,
    amount,
    status
  ) VALUES (
    user_id_param,
    wallet_id_param,
    bot_type_param,
    duration_param,
    profit_target_param,
    amount_param,
    'running'
  ) RETURNING id INTO bot_id;
  
  -- Deduct the amount from the wallet
  PERFORM public.decrement_wallet_balance(wallet_id_param, amount_param);
  
  RETURN bot_id;
END;
$$ LANGUAGE plpgsql;
