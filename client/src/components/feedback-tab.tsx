import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SearchData, FeedbackSubmission, CandidateData } from "@shared/schema";

interface FeedbackTabProps {
  currentSearch: SearchData | null;
  searchResults: CandidateData[] | null;
  onSubmitFeedback: (feedback: FeedbackSubmission) => Promise<void>;
}

const FeedbackTab: React.FC<FeedbackTabProps> = ({ 
  currentSearch, 
  searchResults, 
  onSubmitFeedback 
}) => {
  const { toast } = useToast();
  const [relevanceRating, setRelevanceRating] = useState<number | null>(null);
  const [qualityRating, setQualityRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRelevanceRating = (rating: number) => {
    setRelevanceRating(rating);
  };

  const handleQualityRating = (rating: number) => {
    setQualityRating(rating);
  };

  const handleSubmit = async () => {
    if (!currentSearch) {
      toast({
        title: "Error",
        description: "No candidate search data available to submit feedback for.",
        variant: "destructive",
      });
      return;
    }

    if (relevanceRating === null || qualityRating === null) {
      toast({
        title: "Please complete your ratings",
        description: "Both relevance and quality ratings are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmitFeedback({
        searchId: 1, // This would come from the actual search data in a real implementation
        relevanceRating,
        qualityRating,
        comment: comment.trim() || undefined,
      });

      toast({
        title: "Feedback submitted!",
        description: "Thank you! +5 coins added to your wallet.",
        variant: "default",
      });

      // Reset form
      setRelevanceRating(null);
      setQualityRating(null);
      setComment("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleResults = () => {
    setIsExpanded(!isExpanded);
  };

  if (!currentSearch || !searchResults) {
    return (
      <div className="p-4">
        <div className="bg-white rounded shadow-elevation-1 p-4 text-center">
          <span className="material-icons text-neutral-400 text-4xl mb-2">person_search</span>
          <h2 className="text-lg font-medium mb-1">No Candidate Search Detected</h2>
          <p className="text-neutral-600 text-sm">
            Visit LinkedIn, Indeed, or ZipRecruiter and search for candidates to provide feedback.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Search Query Detected */}
      <div className="mb-4">
        <h2 className="text-sm font-medium text-neutral-500">CURRENT SEARCH</h2>
        <div className="mt-1 p-3 bg-white rounded shadow-elevation-1">
          <p className="font-medium">{currentSearch.query}</p>
          <div className="mt-2 flex items-center text-neutral-500 text-sm">
            <span className="material-icons text-sm mr-1">business</span>
            <span>{currentSearch.source}</span>
            {currentSearch.resultsCount && (
              <>
                <span className="mx-2">•</span>
                <span>{currentSearch.resultsCount}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Results Preview */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-500">TOP CANDIDATES</h2>
          <button 
            className="text-primary text-sm flex items-center"
            onClick={toggleResults}
          >
            <span>{isExpanded ? "Show less" : "Show more"}</span>
            <span className="material-icons text-sm ml-1">
              {isExpanded ? "expand_less" : "expand_more"}
            </span>
          </button>
        </div>
        
        <div className="mt-1 space-y-2">
          {searchResults.slice(0, 3).map((candidate, index) => (
            <div key={`candidate-${index}`} className="p-3 bg-white rounded shadow-elevation-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-base truncate">{candidate.name}</h3>
                {candidate.matchScore && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    candidate.matchScore >= 90 ? "bg-green-100 text-green-800" : 
                    candidate.matchScore >= 80 ? "bg-blue-100 text-blue-800" : 
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {candidate.matchScore}% Match
                  </span>
                )}
              </div>
              
              <div className="mt-1 text-sm text-neutral-600">
                <div className="flex items-center">
                  <span className="material-icons text-xs mr-1">work</span>
                  <span>{candidate.currentPosition || candidate.title || "Not specified"}</span>
                </div>
                {candidate.currentWorkplace && (
                  <div className="flex items-center mt-0.5">
                    <span className="material-icons text-xs mr-1">business</span>
                    <span>{candidate.currentWorkplace}</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center mt-0.5">
                    <span className="material-icons text-xs mr-1">location_on</span>
                    <span>{candidate.location}</span>
                  </div>
                )}
                {candidate.education && (
                  <div className="flex items-center mt-0.5">
                    <span className="material-icons text-xs mr-1">school</span>
                    <span>{candidate.education}</span>
                  </div>
                )}
              </div>
              
              {candidate.pastPosition1 && candidate.pastWorkplace1 && (
                <div className="mt-2 text-xs text-neutral-500">
                  <div className="flex items-center">
                    <span className="material-icons text-xs mr-1">history</span>
                    <span>Previous: {candidate.pastPosition1} at {candidate.pastWorkplace1}</span>
                  </div>
                </div>
              )}
              
              {candidate.connectionType && (
                <div className="mt-2 flex items-center text-xs text-primary">
                  <span className="material-icons text-xs mr-1">people</span>
                  <span>{candidate.connectionType} • {candidate.mutualConnections || candidate.profileStatus}</span>
                </div>
              )}
            </div>
          ))}
          
          {isExpanded && searchResults.length > 3 && (
            <div className="space-y-2 mt-2">
              {searchResults.slice(3).map((candidate, index) => (
                <div key={`expanded-candidate-${index}`} className="p-3 bg-white rounded shadow-elevation-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-base truncate">{candidate.name}</h3>
                    {candidate.matchScore && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.matchScore >= 90 ? "bg-green-100 text-green-800" : 
                        candidate.matchScore >= 80 ? "bg-blue-100 text-blue-800" : 
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {candidate.matchScore}% Match
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-1 text-sm text-neutral-600">
                    <div className="flex items-center">
                      <span className="material-icons text-xs mr-1">work</span>
                      <span>{candidate.currentPosition || candidate.title || "Not specified"}</span>
                    </div>
                    {candidate.currentWorkplace && (
                      <div className="flex items-center mt-0.5">
                        <span className="material-icons text-xs mr-1">business</span>
                        <span>{candidate.currentWorkplace}</span>
                      </div>
                    )}
                    {candidate.location && (
                      <div className="flex items-center mt-0.5">
                        <span className="material-icons text-xs mr-1">location_on</span>
                        <span>{candidate.location}</span>
                      </div>
                    )}
                    {candidate.education && (
                      <div className="flex items-center mt-0.5">
                        <span className="material-icons text-xs mr-1">school</span>
                        <span>{candidate.education}</span>
                      </div>
                    )}
                  </div>
                  
                  {candidate.pastPosition1 && candidate.pastWorkplace1 && (
                    <div className="mt-2 text-xs text-neutral-500">
                      <div className="flex items-center">
                        <span className="material-icons text-xs mr-1">history</span>
                        <span>Previous: {candidate.pastPosition1} at {candidate.pastWorkplace1}</span>
                      </div>
                    </div>
                  )}
                  
                  {candidate.connectionType && (
                    <div className="mt-2 flex items-center text-xs text-primary">
                      <span className="material-icons text-xs mr-1">people</span>
                      <span>{candidate.connectionType} • {candidate.mutualConnections || candidate.profileStatus}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Form */}
      <div className="bg-white rounded shadow-elevation-1 mb-4 overflow-hidden">
        <div className="p-4">
          <h2 className="font-medium mb-3">Rate these candidate results</h2>
          
          {/* Relevance Rating */}
          <div className="mb-4">
            <label className="block text-sm text-neutral-600 mb-1">Relevance to your search criteria</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={`relevance-${rating}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-full ripple focus:outline-none focus:ring-2 focus:ring-primary ${
                    relevanceRating === rating
                      ? "bg-primary text-white border-primary"
                      : "border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                  }`}
                  onClick={() => handleRelevanceRating(rating)}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Not relevant</span>
              <span>Very relevant</span>
            </div>
          </div>
          
          {/* Quality Rating */}
          <div className="mb-4">
            <label className="block text-sm text-neutral-600 mb-1">Quality of candidates</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={`quality-${rating}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-full ripple focus:outline-none focus:ring-2 focus:ring-primary ${
                    qualityRating === rating
                      ? "bg-primary text-white border-primary"
                      : "border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                  }`}
                  onClick={() => handleQualityRating(rating)}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Poor quality</span>
              <span>Excellent quality</span>
            </div>
          </div>
          
          {/* Comment */}
          <div className="mb-4">
            <label htmlFor="feedback-comment" className="block text-sm text-neutral-600 mb-1">
              Additional comments (optional)
            </label>
            <textarea
              id="feedback-comment"
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="What could be improved about these candidate matches?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        
        {/* Reward Info */}
        <div className="bg-neutral-100 p-4 border-t border-neutral-200">
          <div className="flex items-center">
            <span className="material-icons text-secondary mr-2">stars</span>
            <p className="text-sm">You'll earn <span className="font-medium">5 coins</span> for your feedback</p>
          </div>
          
          {/* Submit Button */}
          <button 
            className="mt-3 w-full py-2 px-4 bg-primary text-white rounded ripple shadow-elevation-1 hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary-dark"
            onClick={handleSubmit}
            disabled={isSubmitting || relevanceRating === null || qualityRating === null}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackTab;
