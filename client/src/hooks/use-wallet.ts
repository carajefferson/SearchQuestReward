import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

export function useWallet() {
  // Track the local wallet balance to use as fallback when logged out
  const [localBalance, setLocalBalance] = useState<number>(() => {
    // Initialize from localStorage if available
    const stored = localStorage.getItem('wallet_balance');
    return stored ? parseInt(stored, 10) : 0;
  });
  
  const { 
    data,
    isLoading,
    error,
    refetch
  } = useQuery<WalletData>({
    queryKey: ["/api/wallet"],
    staleTime: 10 * 1000, // 10 seconds (more aggressive refresh)
    refetchOnWindowFocus: true,
  });
  
  // Update local storage when API data changes
  useEffect(() => {
    if (data?.balance !== undefined) {
      localStorage.setItem('wallet_balance', data.balance.toString());
      setLocalBalance(data.balance);
    }
  }, [data?.balance]);
  
  // Listen for custom wallet update events (for development mode)
  useEffect(() => {
    const handleWalletUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.coinsAdded) {
        const coinsToAdd = customEvent.detail.coinsAdded;
        setLocalBalance(prev => {
          const newBalance = prev + coinsToAdd;
          // Update localStorage
          localStorage.setItem('wallet_balance', newBalance.toString());
          return newBalance;
        });
      }
    };
    
    window.addEventListener('wallet-update', handleWalletUpdate);
    
    return () => {
      window.removeEventListener('wallet-update', handleWalletUpdate);
    };
  }, []);
  
  const refreshWallet = () => {
    // Immediately refetch
    refetch();
  };
  
  // If we're logged in, use server data, otherwise use the local balance
  const balance = data?.balance !== undefined ? data.balance : localBalance;
  
  return {
    balance,
    transactions: data?.transactions || [],
    isLoading,
    error,
    refreshWallet,
  };
}
