import React from 'react';
import { Wallet } from '@/types/wallet';

export interface CryptoWithdrawProps {
  wallets?: Wallet[];
  onSuccess: () => Promise<void>;
}

// This component is defined in a read-only file, so we can't modify its implementation
// but we can use TypeScript to ensure type safety when using it

// The component would be defined here if it wasn't read-only

export default CryptoWithdraw;
