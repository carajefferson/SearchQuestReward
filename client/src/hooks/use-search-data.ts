import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SearchData, FeedbackSubmission } from "@shared/schema";
import { getChromeCurrentTab, extractSearchData } from "@/lib/chrome-api";

export function useSearchData() {
  const [currentSearch, setCurrentSearch] = useState<SearchData | null>(null);
  const [searchResults, setSearchResults] = useState<SearchData["results"] | null>(null);
  const [searchId, setSearchId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load search data from the current tab
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        setIsLoading(true);
        const tab = await getChromeCurrentTab();
        
        if (tab && tab.url) {
          const searchData = await extractSearchData(tab);
          
          if (searchData) {
            setCurrentSearch(searchData);
            setSearchResults(searchData.results);
            
            // Submit the search data to the server
            const response = await apiRequest("POST", "/api/searches", searchData);
            const data = await response.json();
            setSearchId(data.searchId);
          }
        }
      } catch (error) {
        console.error("Error loading search data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSearchData();
  }, []);

  // Submit feedback mutation
  const { mutateAsync: submitFeedbackMutation } = useMutation({
    mutationFn: async (feedback: FeedbackSubmission) => {
      const res = await apiRequest("POST", "/api/feedback", feedback);
      return res.json();
    },
    onSuccess: (data) => {
      // Force invalidate wallet data to refresh balance
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.refetchQueries({ queryKey: ["/api/wallet"] });
      
      toast({
        title: "Feedback submitted!",
        description: `Thank you! +${data.coinsAwarded || 5} coins added to your wallet.`,
      });
    },
    onError: (error) => {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your feedback.",
        variant: "destructive",
      });
    },
  });

  // Submit feedback handler
  const submitFeedback = async (feedback: FeedbackSubmission) => {
    if (!searchId) {
      toast({
        title: "Error",
        description: "No search data available to submit feedback for.",
        variant: "destructive",
      });
      return;
    }

    const feedbackWithSearchId = {
      ...feedback,
      searchId,
    };

    await submitFeedbackMutation(feedbackWithSearchId);
  };

  return {
    currentSearch,
    searchResults,
    isLoading,
    submitFeedback,
  };
}
