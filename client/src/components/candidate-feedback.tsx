import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CandidateData, FeedbackSubmission, ProfileElement } from "@shared/schema";

interface FeedbackResponse {
  coinsAwarded?: number;
  [key: string]: any;
}

interface CandidateFeedbackProps {
  candidate: CandidateData;
  searchId: number;
  onSubmitFeedback: (feedback: FeedbackSubmission) => Promise<FeedbackResponse>;
  onClose: () => void;
}

const CandidateFeedback: React.FC<CandidateFeedbackProps> = ({ 
  candidate, 
  searchId,
  onSubmitFeedback,
  onClose 
}) => {
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileElements, setProfileElements] = useState<ProfileElement[]>(
    candidate.profileElements || []
  );

  const toggleElementHighlight = (elementId: string, highlightType: "good" | "poor" | "neutral") => {
    setProfileElements(prevElements => 
      prevElements.map(element => {
        if (element.id === elementId) {
          // If already highlighted with the same type, remove highlight
          if (element.highlighted && element.highlightType === highlightType) {
            return {
              ...element,
              highlighted: false,
              highlightType: "neutral"
            };
          }
          // Otherwise set the new highlight type
          return {
            ...element,
            highlighted: true,
            highlightType
          };
        }
        return element;
      })
    );
  };
  


  const handleSubmit = async () => {
    if (!candidate) {
      toast({
        title: "Error",
        description: "No candidate data available to submit feedback for.",
        variant: "destructive",
      });
      return;
    }

    // Check if user has provided some feedback by highlighting elements
    const hasHighlightedElements = profileElements.some(el => el.highlighted);
    if (!hasHighlightedElements && !comment.trim()) {
      toast({
        title: "Please provide feedback",
        description: "Highlight at least one profile element or add a comment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Extract good and poor match elements with improved formatting
    const formatElementType = (type: string): string => {
      switch(type) {
        case "currentPosition": return "Current Position";
        case "currentWorkplace": return "Current Workplace";
        case "pastPosition": return "Past Position";
        case "pastWorkplace": return "Past Workplace";
        default: return type.charAt(0).toUpperCase() + type.slice(1);
      }
    };
    
    const goodMatchElements = profileElements
      .filter(el => el.highlighted && el.highlightType === "good")
      .map(el => `${formatElementType(el.type)}: ${el.value}`);
      
    const poorMatchElements = profileElements
      .filter(el => el.highlighted && el.highlightType === "poor")
      .map(el => `${formatElementType(el.type)}: ${el.value}`);

    try {
      // In a real implementation, we would use the actual candidate ID from the database
      // For now, we're using a mock ID of 1
      const response = await onSubmitFeedback({
        searchId,
        candidateId: 1, // Mock ID for demonstration
        goodMatchElements,
        poorMatchElements,
        comment: comment.trim() || undefined,
      });
      
      // Update local storage coin balance directly
      const currentBalance = parseInt(localStorage.getItem('wallet_balance') || '0', 10);
      const coinsAwarded = response?.coinsAwarded || 5;
      localStorage.setItem('wallet_balance', (currentBalance + coinsAwarded).toString());
      
      toast({
        title: "Feedback submitted!",
        description: `Thank you! +${coinsAwarded} coins added to your wallet.`,
        variant: "default",
      });

      // Close the feedback modal
      onClose();
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Candidate Feedback</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="px-6 py-4">
          {/* Candidate Information */}
          <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{candidate.name}</h3>
                <p className="text-neutral-600">{candidate.title || candidate.currentPosition}</p>
              </div>
              {candidate.matchScore && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  candidate.matchScore >= 90 ? "bg-green-100 text-green-800" : 
                  candidate.matchScore >= 80 ? "bg-blue-100 text-blue-800" : 
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {candidate.matchScore}% Match
                </span>
              )}
            </div>
            
            <div className="mt-3 space-y-1 text-sm">
              {candidate.currentWorkplace && (
                <div className="flex items-center">
                  <span className="material-icons text-xs mr-2">business</span>
                  <span>{candidate.currentWorkplace}</span>
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center">
                  <span className="material-icons text-xs mr-2">location_on</span>
                  <span>{candidate.location}</span>
                </div>
              )}
              {candidate.education && (
                <div className="flex items-center">
                  <span className="material-icons text-xs mr-2">school</span>
                  <span>{candidate.education}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Elements to Highlight */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Highlight Elements</h3>
            <p className="text-sm text-neutral-600 mb-3">
              Select which elements of the candidate's profile are good or poor matches for your search criteria.
            </p>
            
            <div className="space-y-3">
              {profileElements.map(element => (
                <div 
                  key={element.id} 
                  className={`p-3 border rounded-md transition-all ${
                    element.highlighted && element.highlightType === "good" ? "border-green-500 bg-green-50" :
                    element.highlighted && element.highlightType === "poor" ? "border-red-500 bg-red-50" :
                    "border-neutral-300 hover:border-neutral-400"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium text-sm capitalize">
                        {element.type === "currentPosition" ? "Current Position" :
                         element.type === "currentWorkplace" ? "Current Workplace" : 
                         element.type === "pastPosition" ? "Past Position" :
                         element.type === "pastWorkplace" ? "Past Workplace" :
                         element.type}
                      </div>
                      <div className="break-words pr-2">{element.value}</div>
                      
                      {element.type === "specialization" && (
                        <div className="mt-1 text-xs text-neutral-500">
                          Specializations are specific areas of expertise within the profession
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <button
                        onClick={() => toggleElementHighlight(element.id, "good")}
                        className={`p-2 rounded-full ${
                          element.highlighted && element.highlightType === "good" 
                            ? "bg-green-100 text-green-700" 
                            : "text-neutral-500 hover:bg-neutral-100"
                        }`}
                        title="Good match"
                      >
                        <span className="material-icons text-base">thumb_up</span>
                      </button>
                      <button
                        onClick={() => toggleElementHighlight(element.id, "poor")}
                        className={`p-2 rounded-full ${
                          element.highlighted && element.highlightType === "poor" 
                            ? "bg-red-100 text-red-700" 
                            : "text-neutral-500 hover:bg-neutral-100"
                        }`}
                        title="Poor match"
                      >
                        <span className="material-icons text-base">thumb_down</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Comment Section */}
          <div className="mb-6">
            <label htmlFor="feedback-comment" className="block text-sm text-neutral-600 mb-1">
              Additional comments (optional)
            </label>
            <textarea
              id="feedback-comment"
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="What could be improved about this candidate match?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        
        {/* Footer with Submit Button */}
        <div className="bg-neutral-100 px-6 py-4 border-t flex justify-between items-center">
          <div className="flex items-center">
            <span className="material-icons text-secondary mr-2">stars</span>
            <p className="text-sm">You'll earn <span className="font-medium">5 coins</span> for your feedback</p>
          </div>
          <div className="flex space-x-2">
            <button 
              className="px-4 py-2 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-primary text-white rounded shadow-elevation-1 hover:bg-primary-dark disabled:bg-neutral-300"
              onClick={handleSubmit}
              disabled={isSubmitting || !profileElements.some(el => el.highlighted)}
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateFeedback;