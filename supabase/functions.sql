
-- Create a new function to safely decrement wallet balance
CREATE OR REPLACE FUNCTION public.decrement_balance(wallet_id_param UUID, amount_param NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance NUMERIC;
BEGIN
  SELECT balance INTO current_balance
  FROM public.wallets
  WHERE id = wallet_id_param
  AND user_id = auth.uid();
  
  RETURN GREATEST(0, COALESCE(current_balance, 0) - amount_param);
END;
$$;
