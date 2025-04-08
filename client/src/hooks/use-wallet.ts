import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";

interface WalletData {
  balance: number;
  transactions: Transaction[];
}

export function useWallet() {
  const { 
    data,
    isLoading,
    error,
    refetch
  } = useQuery<WalletData>({
    queryKey: ["/api/wallet"],
    staleTime: 60 * 1000, // 1 minute
  });
  
  const refreshWallet = () => {
    refetch();
  };
  
  return {
    balance: data?.balance || 0,
    transactions: data?.transactions || [],
    isLoading,
    error,
    refreshWallet,
  };
}
