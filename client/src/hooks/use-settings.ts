import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings } from "@shared/schema";

export function useSettings() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch settings
  const { 
    data: settings,
    isLoading: isLoadingSettings,
    error
  } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Update settings
  const { mutateAsync: updateSettingsMutation } = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      const res = await apiRequest("PUT", "/api/settings", newSettings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });
  
  // Update settings handler
  const updateSettings = async (newSettings: Partial<Settings>) => {
    setIsLoading(true);
    try {
      await updateSettingsMutation(newSettings);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Default settings for when no settings are found yet
  const defaultSettings: Settings = {
    id: 0,
    userId: 0,
    notifications: true,
    privacyMode: true,
    autoDetect: true,
    googleEnabled: true,
    bingEnabled: true,
    duckDuckGoEnabled: true,
  };
  
  return {
    settings: settings || defaultSettings,
    updateSettings,
    isLoading: isLoading || isLoadingSettings,
    error,
  };
}
