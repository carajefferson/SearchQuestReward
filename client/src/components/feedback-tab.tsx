import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SearchData, FeedbackSubmission, CandidateData } from "@shared/schema";
import CandidateFeedback from "./candidate-feedback";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);

  const toggleResults = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCandidateSelect = (candidate: CandidateData) => {
    setSelectedCandidate(candidate);
  };

  const handleCloseFeedback = () => {
    setSelectedCandidate(null);
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
          <h2 className="text-sm font-medium text-neutral-500">CANDIDATES</h2>
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
          {searchResults.slice(0, isExpanded ? searchResults.length : 3).map((candidate, index) => (
            <div 
              key={`candidate-${index}`} 
              className="p-3 bg-white rounded shadow-elevation-1 cursor-pointer hover:shadow-elevation-2 transition-shadow"
              onClick={() => handleCandidateSelect(candidate)}
            >
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
              
              <div className="mt-3 flex justify-between items-center">
                {candidate.connectionType && (
                  <div className="flex items-center text-xs text-primary">
                    <span className="material-icons text-xs mr-1">people</span>
                    <span>{candidate.connectionType} • {candidate.mutualConnections || candidate.profileStatus}</span>
                  </div>
                )}
                
                <button 
                  className="px-3 py-1 text-xs bg-primary text-white rounded shadow-sm hover:bg-primary-dark transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCandidateSelect(candidate);
                  }}
                >
                  <span className="flex items-center">
                    <span className="material-icons text-xs mr-1">rate_review</span>
                    Give Feedback
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {!isExpanded && searchResults.length > 3 && (
          <button 
            className="mt-3 w-full py-2 text-sm text-primary border border-primary rounded hover:bg-primary-50 transition-colors"
            onClick={toggleResults}
          >
            Show {searchResults.length - 3} more candidates
          </button>
        )}
      </div>

      {/* Instructions Card */}
      <div className="bg-white rounded shadow-elevation-1 p-4 text-center mb-4">
        <span className="material-icons text-primary text-2xl mb-2">touch_app</span>
        <h3 className="font-medium mb-1">Select a Candidate</h3>
        <p className="text-neutral-600 text-sm">
          Click on any candidate to provide detailed feedback on how well they match your search criteria.
        </p>
        <div className="mt-3 flex items-center justify-center text-sm">
          <div className="flex items-center mx-2">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            <span>Good match</span>
          </div>
          <div className="flex items-center mx-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
            <span>Poor match</span>
          </div>
        </div>
      </div>
      
      {/* Help Section */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <span className="material-icons text-blue-500 mr-2 mt-0.5">info</span>
          <div>
            <p className="text-sm text-blue-800">
              Your feedback on each candidate helps us improve our matching algorithm. For each candidate you review, you'll earn <span className="font-medium">5 coins</span> in your wallet!
            </p>
          </div>
        </div>
      </div>
      
      {/* Candidate Feedback Modal */}
      {selectedCandidate && (
        <CandidateFeedback 
          candidate={selectedCandidate}
          searchId={1} // This would be the actual search ID in a real implementation
          onSubmitFeedback={onSubmitFeedback}
          onClose={handleCloseFeedback}
        />
      )}
    </div>
  );
};

export default FeedbackTab;
