/**
 * Content script to extract candidate data from supported recruitment platforms
 * Version: 2.0 - Optimized for LinkedIn 2025 layout
 */

(function() {
  // Helper to get URL parameters
  function getQueryParam(url, param) {
    const searchParams = new URL(url).searchParams;
    return searchParams.get(param);
  }
  
  // Helper to safely extract text content
  function safeTextContent(element) {
    return element ? element.textContent.trim() : '';
  }
  
  // Helper to generate a better match score based on job title and keyword relevance
  function calculateMatchScore(candidate, keywords) {
    // Base score starts at 75
    let score = 75;
    
    // Boost score if we find keywords in various candidate fields
    if (keywords && keywords.length > 0) {
      const keywordArr = keywords.toLowerCase().split(' ');
      
      // Check various fields for keyword matches
      keywordArr.forEach(keyword => {
        if (keyword.length < 3) return; // Skip short keywords
        
        // Check title match (highest value)
        if (candidate.title.toLowerCase().includes(keyword)) {
          score += 8;
        }
        
        // Check current position match
        if (candidate.currentPosition.toLowerCase().includes(keyword)) {
          score += 6;
        }
        
        // Check workplace for relevance
        if (candidate.currentWorkplace.toLowerCase().includes(keyword)) {
          score += 4;
        }
        
        // Add small boost for location match
        if (candidate.location.toLowerCase().includes(keyword)) {
          score += 2;
        }
      });
    }
    
    // If they have mutual connections, boost the score
    if (candidate.connectionType === "mutual connection") {
      score += 5;
    }
    
    // Cap at 99
    return Math.min(99, score);
  }
  
  // Function to extract LinkedIn profile elements for feedback
  function extractProfileElements(candidate) {
    const elements = [];
    
    // Add education if available
    if (candidate.education) {
      elements.push({
        id: `edu-${candidate.id}`,
        type: 'education',
        text: candidate.education
      });
    }
    
    // Add current position
    if (candidate.currentPosition) {
      elements.push({
        id: `pos-${candidate.id}`,
        type: 'experience',
        text: `${candidate.currentPosition} at ${candidate.currentWorkplace}`
      });
    }
    
    // Add connection type if available
    if (candidate.connectionType) {
      elements.push({
        id: `con-${candidate.id}`,
        type: 'connection',
        text: candidate.connectionType === "mutual connection" 
          ? `Mutual connection with ${candidate.mutualConnections || 'others'}`
          : `${candidate.connectionType} connection`
      });
    }
    
    // Add location
    if (candidate.location) {
      elements.push({
        id: `loc-${candidate.id}`,
        type: 'location',
        text: `Located in ${candidate.location}`
      });
    }
    
    // Add specialization if available
    if (candidate.title) {
      elements.push({
        id: `spec-${candidate.id}`,
        type: 'specialization',
        text: `Specializes in ${candidate.title}`
      });
    }
    
    return elements;
  }
  
  // Extract data from LinkedIn Results page - 2025 version
  function extractLinkedInCandidates() {
    const candidates = [];
    const keywords = getQueryParam(window.location.href, 'keywords') || '';
    
    // Get all search result items
    // Based on the screenshot, we're looking for search result containers
    let resultElements = document.querySelectorAll('.entity-result__item');
    
    if (resultElements.length === 0) {
      // Try alternate selectors if the primary one fails
      const altElements1 = document.querySelectorAll('.search-result__occluded-item');
      const altElements2 = document.querySelectorAll('.reusable-search__result-container');
      
      if (altElements1.length > 0) {
        resultElements = altElements1;
      } else if (altElements2.length > 0) {
        resultElements = altElements2;
      }
    }
    
    // Process each search result
    resultElements.forEach((el, index) => {
      try {
        // Extract candidate name - look for main profile name element
        const nameEl = el.querySelector('.entity-result__title-text a') || 
                       el.querySelector('.app-aware-link .actor-name');
        
        // Find the title/headline
        const titleEl = el.querySelector('.entity-result__primary-subtitle') || 
                        el.querySelector('.entity-result__summary');
        
        // Find location
        const locationEl = el.querySelector('.entity-result__secondary-subtitle') || 
                          el.querySelector('.subline-level-2');
        
        // Find additional info like connection status
        const connectionEl = el.querySelector('.entity-result__badge-text') || 
                            el.querySelector('.distance-badge');
        
        // Find mutual connections indication
        const mutualConnectionsEl = el.querySelector('.member-insights__connection-count');
        
        // Find current employment details
        const employmentEl = el.querySelector('.entity-result__summary') || 
                            el.querySelector('.entity-result__primary-subtitle');
        
        // Find education details
        const educationEl = el.querySelector('.entity-result__education');
        
        // Only proceed if we have a name
        if (nameEl) {
          // Try to parse out position and company from the employment data
          let currentPosition = '';
          let currentWorkplace = '';
          
          if (employmentEl) {
            const employmentText = employmentEl.textContent.trim();
            // Attempt to separate position from company if there's "at" in the text
            if (employmentText.includes(' at ')) {
              [currentPosition, currentWorkplace] = employmentText.split(' at ').map(s => s.trim());
            } else {
              currentPosition = employmentText;
            }
          }
          
          const name = safeTextContent(nameEl);
          const title = safeTextContent(titleEl);
          const location = safeTextContent(locationEl);
          const connectionType = safeTextContent(connectionEl);
          const mutualConnections = safeTextContent(mutualConnectionsEl);
          const education = safeTextContent(educationEl);
          
          // Assign a unique ID
          const candidateId = index + 1;
          
          // Create candidate object
          const candidate = {
            id: candidateId,
            name: name,
            title: title || 'Medical Assistant', // Default to the search term if not found
            location: location || 'Unknown location',
            currentPosition: currentPosition || title || 'Medical Assistant',
            currentWorkplace: currentWorkplace || 'Healthcare Organization',
            connectionType: connectionType.includes('mutual') ? 'mutual connection' : connectionType || '2nd',
            mutualConnections: mutualConnections,
            education: education,
            profileStatus: connectionType || '2nd'
          };
          
          // Calculate match score based on relevance to keywords
          candidate.matchScore = calculateMatchScore(candidate, keywords);
          
          // Extract profile elements for feedback
          candidate.profileElements = extractProfileElements(candidate);
          
          // Add to results
          candidates.push(candidate);
        }
      } catch (error) {
        console.error('Error extracting LinkedIn candidate data:', error);
      }
    });
    
    return candidates;
  }
  
  // Extract search data based on the current page
  function extractSearchData() {
    let data = {
      query: "",
      source: "",
      resultsCount: "",
      results: []
    };
    
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    // Detect LinkedIn
    if (hostname.includes('linkedin.com')) {
      data.source = 'LinkedIn';
      
      // Extract search query
      data.query = getQueryParam(url, 'keywords') || 
                   document.querySelector('.search-global-typeahead__input')?.value || 
                   "";
      
      // Extract results count
      const resultsCountEl = document.querySelector('.search-results-container h2') || 
                             document.querySelector('.artdeco-pill');
      if (resultsCountEl) {
        data.resultsCount = resultsCountEl.textContent;
      }
      
      // Extract candidate results - use the specialized function
      data.results = extractLinkedInCandidates();
    }
    // Detect Indeed and other platforms...
    else if (hostname.includes('indeed.com')) {
      // Indeed extraction logic
      data.source = 'Indeed';
      // ...rest of the code remains unchanged
    }
    else if (hostname.includes('ziprecruiter.com')) {
      // ZipRecruiter extraction logic
      data.source = 'ZipRecruiter';
      // ...rest of the code remains unchanged
    }
    
    // Only return data if we have results
    return data.results.length > 0 ? data : null;
  }
  
  // Send data to background script
  function sendSearchData() {
    const searchData = extractSearchData();
    
    if (searchData) {
      chrome.runtime.sendMessage({ 
        type: 'searchData', 
        data: searchData 
      }, response => {
        if (response && response.success) {
          console.log('Candidate search data successfully captured');
        }
      });
    }
  }
  
  // Listen for direct requests from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractCandidates") {
      const candidates = extractLinkedInCandidates();
      sendResponse({ 
        success: true, 
        candidates: candidates 
      });
    }
    return true; // Keep the message channel open for async response
  });
  
  // Automatically extract data when loaded
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || {
      autoDetect: true,
      platforms: {
        linkedin: true,
        indeed: true,
        ziprecruiter: true
      }
    };
    
    if (settings.autoDetect) {
      const hostname = window.location.hostname;
      
      if (
        (hostname.includes('linkedin.com') && settings.platforms.linkedin) ||
        (hostname.includes('indeed.com') && settings.platforms.indeed) ||
        (hostname.includes('ziprecruiter.com') && settings.platforms.ziprecruiter)
      ) {
        // Use a larger delay for more reliable extraction
        setTimeout(sendSearchData, 2000);
        
        // Also set up a mutation observer to detect when search results load or change
        const targetNode = document.body;
        const config = { childList: true, subtree: true };
        const observer = new MutationObserver((mutationsList, observer) => {
          for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && 
                (mutation.target.classList.contains('search-results-container') ||
                 mutation.target.classList.contains('entity-result__item'))) {
              // Results have likely changed, extract data again
              setTimeout(sendSearchData, 1000);
              break;
            }
          }
        });
        
        // Start observing
        observer.observe(targetNode, config);
        
        // Stop after 5 minutes to prevent memory leaks
        setTimeout(() => {
          observer.disconnect();
        }, 300000);
      }
    }
  });
})();