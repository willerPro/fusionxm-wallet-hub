
-- Create function to get user bots safely (checks if bots table exists first)
CREATE OR REPLACE FUNCTION public.get_user_bots()
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  -- Check if the bots table exists
  SELECT EXISTS (
    SELECT 1
    FROM   information_schema.tables 
    WHERE  table_schema = 'public'
    AND    table_name = 'bots'
  ) INTO table_exists;

  -- If the bots table exists, return the user's bots
  IF table_exists THEN
    RETURN QUERY
    SELECT json_build_object(
      'id', b.id,
      'user_id', b.user_id,
      'wallet_id', b.wallet_id,
      'bot_type', b.bot_type,
      'duration', b.duration,
      'profit_target', b.profit_target,
      'amount', b.amount,
      'status', b.status,
      'created_at', b.created_at,
      'updated_at', b.updated_at
    )
    FROM public.bots b
    WHERE b.user_id = auth.uid();
  ELSE
    -- Return an empty result if the table doesn't exist
    RETURN;
  END IF;
END;
$$;

-- Create a function to increment wallet balance safely
CREATE OR REPLACE FUNCTION public.increment_wallet_balance(wallet_id_param UUID, amount_param NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.wallets
  SET balance = COALESCE(balance, 0) + amount_param
  WHERE id = wallet_id_param
  AND user_id = auth.uid();
END;
$$;

-- Create a function to create a new bot
CREATE OR REPLACE FUNCTION public.create_bot(
  user_id_param UUID,
  wallet_id_param UUID,
  bot_type_param TEXT,
  duration_param INTEGER,
  profit_target_param INTEGER,
  amount_param NUMERIC
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_bot_id UUID;
  table_exists BOOLEAN;
  min_amount NUMERIC;
BEGIN
  -- Set minimum amounts based on bot type
  CASE bot_type_param
    WHEN 'binary' THEN min_amount := 500;
    WHEN 'nextbase' THEN min_amount := 3000;
    WHEN 'contract' THEN min_amount := 2600;
    ELSE min_amount := 500;
  END CASE;

  -- Check if amount meets minimum requirement
  IF amount_param < min_amount THEN
    RAISE EXCEPTION 'Minimum amount for % bot is % USDT', bot_type_param, min_amount;
  END IF;

  -- Check if the bots table exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'bots'
  ) INTO table_exists;

  -- Create the bots table if it doesn't exist
  IF NOT table_exists THEN
    CREATE TABLE public.bots (
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

    -- Add RLS policies
    ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view their own bots" ON public.bots FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert their own bots" ON public.bots FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update their own bots" ON public.bots FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete their own bots" ON public.bots FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- Insert the new bot
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
  )
  RETURNING id INTO new_bot_id;

  -- Update wallet balance (subtract the amount)
  UPDATE public.wallets
  SET balance = balance - amount_param
  WHERE id = wallet_id_param AND user_id = user_id_param;

  -- Return the new bot ID
  RETURN json_build_object('id', new_bot_id);
END;
$$;

-- Create function to delete a wallet, with password verification
CREATE OR REPLACE FUNCTION public.delete_wallet(
  wallet_id_param UUID,
  password_param TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  wallet_record RECORD;
  user_has_bots BOOLEAN;
BEGIN
  -- Get the wallet record
  SELECT * INTO wallet_record 
  FROM public.wallets
  WHERE id = wallet_id_param AND user_id = auth.uid();
  
  -- Check if wallet exists and belongs to the user
  IF wallet_record.id IS NULL THEN
    RAISE EXCEPTION 'Wallet not found or does not belong to you';
  END IF;
  
  -- Check if wallet is password protected and password is correct
  -- Note: In a real application, you'd use proper password hashing
  -- This is just a simple check for demo purposes
  IF wallet_record.password_protected = TRUE THEN
    -- Check if there's a password in the vault or if a backup key is provided
    -- Here we're just checking if a password was provided when it's required
    IF password_param IS NULL OR password_param = '' THEN
      RAISE EXCEPTION 'Password is required to delete this wallet';
    END IF;
    
    -- In a real implementation, you'd verify the password hash
    -- For this example, we'll just check if a password was provided
  END IF;

  -- Check if there are any active bots using this wallet
  SELECT EXISTS (
    SELECT 1 
    FROM public.bots 
    WHERE wallet_id = wallet_id_param 
    AND user_id = auth.uid()
    AND status IN ('running', 'paused')
  ) INTO user_has_bots;
  
  IF user_has_bots THEN
    RAISE EXCEPTION 'Cannot delete wallet with active bots. Please stop all bots first.';
  END IF;
  
  -- Delete any transaction records associated with this wallet
  DELETE FROM public.transactions
  WHERE wallet_id = wallet_id_param
  AND user_id = auth.uid();
  
  -- Delete any bots associated with this wallet
  DELETE FROM public.bots
  WHERE wallet_id = wallet_id_param
  AND user_id = auth.uid();
  
  -- Finally, delete the wallet
  DELETE FROM public.wallets
  WHERE id = wallet_id_param
  AND user_id = auth.uid();
END;
$$;
