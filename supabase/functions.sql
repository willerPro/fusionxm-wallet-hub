
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
