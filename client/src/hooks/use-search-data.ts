import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SearchData, FeedbackSubmission } from "@shared/schema";
import { getChromeCurrentTab, extractSearchData } from "@/lib/chrome-api";

// Define ChromeTab interface for local use
interface ChromeTab {
  id?: number;
  url?: string;
  title?: string;
  active?: boolean;
}

interface FeedbackResponse {
  coinsAwarded?: number;
  [key: string]: any;
}

export function useSearchData() {
  // Create default mock search data for development
  const defaultSearch: SearchData = {
    query: "medical assistant",
    source: "LinkedIn",
    resultsCount: "About 1,200 results",
    results: [
      {
        name: "Alexandra Gonzalez",
        title: "Medical Assistant",
        location: "Tustin CA",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Tustin Ear Nose & Throat Sinus and Allergy Center",
        education: "B.A Public Health",
        specialization: "ENT & Allergy Care",
        connectionType: "mutual connection",
        mutualConnections: "Ben Lazaroff",
        profileStatus: "2nd",
        matchScore: 95,
        profileElements: [
          { id: "element2", type: "title", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
          { id: "element3", type: "location", value: "Tustin CA", highlighted: false, highlightType: "neutral" },
          { id: "element4", type: "currentPosition", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
          { id: "element5", type: "currentWorkplace", value: "Tustin Ear Nose & Throat Sinus and Allergy Center", highlighted: false, highlightType: "neutral" },
          { id: "element6", type: "education", value: "B.A Public Health", highlighted: false, highlightType: "neutral" },
          { id: "element7", type: "specialization", value: "ENT & Allergy Care", highlighted: false, highlightType: "neutral" },
          { id: "element8", type: "skills", value: "Patient care, Medical records, Vital signs", highlighted: false, highlightType: "neutral" },
          { id: "element9", type: "experience", value: "3+ years in clinical settings", highlighted: false, highlightType: "neutral" }
        ]
      },
      {
        name: "Isabella Teets",
        title: "Medical Assistant",
        location: "Newport Beach CA",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Newport Family Medicine",
        education: "B.S. Psychological and Brain Sciences",
        specialization: "Primary Care & Geriatrics",
        connectionType: "mutual connection",
        mutualConnections: "Kumaresh Mudliar",
        profileStatus: "2nd",
        matchScore: 92,
        profileElements: [
          { id: "el2", type: "title", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
          { id: "el3", type: "location", value: "Newport Beach CA", highlighted: false, highlightType: "neutral" },
          { id: "el4", type: "currentPosition", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
          { id: "el5", type: "currentWorkplace", value: "Newport Family Medicine", highlighted: false, highlightType: "neutral" },
          { id: "el6", type: "education", value: "B.S. Psychological and Brain Sciences", highlighted: false, highlightType: "neutral" },
          { id: "el7", type: "specialization", value: "Primary Care & Geriatrics", highlighted: false, highlightType: "neutral" },
          { id: "el8", type: "skills", value: "Patient coordination, Medical records", highlighted: false, highlightType: "neutral" },
          { id: "el9", type: "experience", value: "2 years in family medicine", highlighted: false, highlightType: "neutral" }
        ]
      },
      {
        name: "Vincent Pham",
        title: "Medical Assistant",
        location: "Pittsburg CA",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Golden State Dermatology",
        education: "UC Santa Barbara Biopsychology Alumni",
        specialization: "Dermatology & Skin Care",
        connectionType: "mutual connection",
        mutualConnections: "Kumaresh Mudliar",
        profileStatus: "2nd",
        matchScore: 94,
        profileElements: [
          { id: "vp1", type: "title", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
          { id: "vp2", type: "location", value: "Pittsburg CA", highlighted: false, highlightType: "neutral" },
          { id: "vp3", type: "currentPosition", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
          { id: "vp4", type: "currentWorkplace", value: "Golden State Dermatology", highlighted: false, highlightType: "neutral" },
          { id: "vp5", type: "education", value: "UC Santa Barbara Biopsychology Alumni", highlighted: false, highlightType: "neutral" },
          { id: "vp6", type: "specialization", value: "Dermatology & Skin Care", highlighted: false, highlightType: "neutral" },
          { id: "vp7", type: "skills", value: "Patient care, Dermatology procedures, Medical records", highlighted: false, highlightType: "neutral" },
          { id: "vp8", type: "experience", value: "2+ years in dermatology practice", highlighted: false, highlightType: "neutral" }
        ]
      }
    ]
  };

  const [currentSearch, setCurrentSearch] = useState<SearchData | null>(defaultSearch);
  const [searchResults, setSearchResults] = useState<SearchData["results"] | null>(defaultSearch.results);
  const [searchId, setSearchId] = useState<number | null>(1); // Default mock ID
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Function to perform a search with a specific query
  const performSearch = async (query: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Check if we're in development mode
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        // In development mode, just use the mock data
        const tab = await getChromeCurrentTab();
        
        // If we don't get a tab back, create a mock one
        const mockTab: ChromeTab = tab || { 
          id: 1, 
          url: "https://www.linkedin.com/search/results/people/?keywords=" + encodeURIComponent(query) 
        };
        
        const searchData = await extractSearchData(mockTab, query);
        
        if (searchData) {
          // Update the current search and results
          setCurrentSearch(searchData);
          setSearchResults(searchData.results);
          
          // No need to submit to server in dev mode
        } else {
          toast({
            title: "Search Failed",
            description: "Unable to perform search. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        // In production/extension mode, use the Chrome API
        const tab = await getChromeCurrentTab();
        
        if (tab) {
          // Pass the search query to extractSearchData
          const searchData = await extractSearchData(tab, query);
          
          if (searchData) {
            // Update the search query with the user's input
            searchData.query = query;
            
            setCurrentSearch(searchData);
            setSearchResults(searchData.results);
            
            // Submit the search data to the server
            try {
              const response = await apiRequest("POST", "/api/searches", searchData);
              const data = await response.json();
              setSearchId(data.searchId);
            } catch (err) {
              console.error("Error submitting search to server:", err);
            }
          } else {
            toast({
              title: "Search Failed",
              description: "Unable to perform search. Please try again.",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error performing search:", error);
      toast({
        title: "Search Error",
        description: "An error occurred while performing the search.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load search data from the current tab
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        setIsLoading(true);
        
        // We're already initializing with default data, so no need to try loading
        // from the server in development mode since we don't have auth set up
        const isDev = process.env.NODE_ENV === 'development';
        
        if (!isDev) {
          const tab = await getChromeCurrentTab();
          
          if (tab && tab.url) {
            const searchData = await extractSearchData(tab);
            
            if (searchData) {
              setCurrentSearch(searchData);
              setSearchResults(searchData.results);
              
              // Submit the search data to the server
              try {
                const response = await apiRequest("POST", "/api/searches", searchData);
                const data = await response.json();
                setSearchId(data.searchId);
              } catch (err) {
                console.error("Error submitting search to server:", err);
              }
            }
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
  const submitFeedback = async (feedback: FeedbackSubmission): Promise<FeedbackResponse> => {
    if (!searchId) {
      toast({
        title: "Error",
        description: "No search data available to submit feedback for.",
        variant: "destructive",
      });
      return { coinsAwarded: 0 }; // Return empty response
    }

    const feedbackWithSearchId = {
      ...feedback,
      searchId,
    };

    // Check if we're in development mode
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // In development mode, just simulate a successful feedback submission
      toast({
        title: "Feedback submitted!",
        description: "Thank you! +5 coins added to your wallet.",
      });
      
      // Return a mock response
      return { coinsAwarded: 5 };
    } else {
      // In production mode, actually submit to the server
      return await submitFeedbackMutation(feedbackWithSearchId);
    }
  };

  return {
    currentSearch,
    searchResults,
    isLoading,
    submitFeedback,
    performSearch,
  };
}
