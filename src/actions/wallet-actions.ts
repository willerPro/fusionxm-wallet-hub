
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Deletes a wallet from the database
 * @param walletId The ID of the wallet to delete
 * @returns A promise that resolves when the wallet has been deleted
 */
export const deleteWallet = async (walletId: string): Promise<void> => {
  if (!walletId) {
    throw new Error("Wallet ID is required");
  }

  const { error } = await supabase
    .from('wallets')
    .delete()
    .eq('id', walletId);

  if (error) {
    console.error("Error deleting wallet:", error);
    throw new Error(error.message || "Failed to delete wallet");
  }
};
