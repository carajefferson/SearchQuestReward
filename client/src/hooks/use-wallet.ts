import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { addBalanceUpdateListener, removeBalanceUpdateListener, getCurrentBalance } from "@/lib/wallet-service";

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

export function useWallet() {
  // Track the local wallet balance to use as fallback when logged out
  const [localBalance, setLocalBalance] = useState<number>(() => {
    // Initialize from localStorage or wallet service
    return getCurrentBalance();
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
  
  // Listen for wallet balance updates
  useEffect(() => {
    // Handler for wallet balance updates
    const handleBalanceUpdate = (newBalance: number) => {
      setLocalBalance(newBalance);
    };
    
    // Register listener
    addBalanceUpdateListener(handleBalanceUpdate);
    
    // Clean up
    return () => {
      removeBalanceUpdateListener(handleBalanceUpdate);
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
