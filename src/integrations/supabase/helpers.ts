
import { supabase } from './client';

export async function decrementWalletBalance(walletId: string, amount: number): Promise<number> {
  try {
    const { data, error } = await supabase
      .rpc('decrement_balance', {
        wallet_id_param: walletId,
        amount_param: amount
      });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error decrementing wallet balance:', error);
    throw error;
  }
}

export async function updateCryptoTransactionStatus(
  transactionId: string, 
  status: 'pending' | 'completed' | 'failed',
  txHash?: string
): Promise<void> {
  try {
    const updateData: any = { status };
    
    if (txHash) {
      updateData.tx_hash = txHash;
    }
    
    const { error } = await supabase
      .from('crypto_transactions')
      .update(updateData)
      .eq('id', transactionId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
}
