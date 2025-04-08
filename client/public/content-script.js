/**
 * Content script to extract candidate data from supported recruitment platforms
 */

(function() {
  // Helper to get URL parameters
  function getQueryParam(url, param) {
    const searchParams = new URL(url).searchParams;
    return searchParams.get(param);
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
      const resultsCountEl = document.querySelector('.search-results-container h2');
      if (resultsCountEl) {
        data.resultsCount = resultsCountEl.textContent;
      }
      
      // Extract candidate results
      const resultElements = document.querySelectorAll('.search-result');
      resultElements.forEach((el, index) => {
        try {
          // Extract candidate name
          const nameEl = el.querySelector('.actor-name');
          // Extract candidate title
          const titleEl = el.querySelector('.subline-level-1');
          // Extract location
          const locationEl = el.querySelector('.subline-level-2');
          // Extract current position
          const currentPositionEl = el.querySelector('.entity-result__primary-subtitle');
          // Mutual connections
          const mutualConnectionsEl = el.querySelector('.member-insights__connection-count');
          
          // Only add to results if we have at least a name
          if (nameEl) {
            // Generate a match score (in a real app, this would be based on AI/ML)
            const matchScore = Math.floor(Math.random() * 25) + 75; // Random score between 75-99
            
            data.results.push({
              name: nameEl.textContent.trim(),
              title: titleEl ? titleEl.textContent.trim() : undefined,
              location: locationEl ? locationEl.textContent.trim() : undefined,
              currentPosition: currentPositionEl ? currentPositionEl.textContent.trim() : undefined,
              connectionType: mutualConnectionsEl ? "mutual connection" : "2nd",
              mutualConnections: mutualConnectionsEl ? mutualConnectionsEl.textContent.trim() : undefined,
              profileStatus: "2nd",
              matchScore: matchScore
            });
          }
        } catch (error) {
          console.error('Error extracting candidate data:', error);
        }
      });
    }
    // Detect Indeed
    else if (hostname.includes('indeed.com')) {
      data.source = 'Indeed';
      data.query = getQueryParam(url, 'q') || document.querySelector('#what')?.value || "";
      data.resultsCount = document.querySelector('#searchCountPages')?.textContent || "";
      
      // Extract results
      const resultElements = document.querySelectorAll('.jobsearch-SerpJobCard');
      resultElements.forEach(el => {
        const nameEl = el.querySelector('.title a');
        const companyEl = el.querySelector('.company');
        const locationEl = el.querySelector('.location');
        
        if (nameEl) {
          const matchScore = Math.floor(Math.random() * 25) + 75;
          
          data.results.push({
            name: nameEl.textContent.trim(),
            currentPosition: nameEl.textContent.trim(),
            currentWorkplace: companyEl ? companyEl.textContent.trim() : undefined,
            location: locationEl ? locationEl.textContent.trim() : undefined,
            matchScore: matchScore
          });
        }
      });
    }
    // Detect ZipRecruiter
    else if (hostname.includes('ziprecruiter.com')) {
      data.source = 'ZipRecruiter';
      data.query = getQueryParam(url, 'search') || document.querySelector('#search-keyword')?.value || "";
      
      // Extract results
      const resultElements = document.querySelectorAll('.job_card');
      resultElements.forEach(el => {
        const nameEl = el.querySelector('.job_title');
        const companyEl = el.querySelector('.company_name');
        const locationEl = el.querySelector('.location');
        
        if (nameEl) {
          const matchScore = Math.floor(Math.random() * 25) + 75;
          
          data.results.push({
            name: nameEl.textContent.trim(),
            currentPosition: nameEl.textContent.trim(),
            currentWorkplace: companyEl ? companyEl.textContent.trim() : undefined,
            location: locationEl ? locationEl.textContent.trim() : undefined,
            matchScore: matchScore
          });
        }
      });
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
  
  // Check settings before extracting data
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
        // Small delay to ensure page is fully rendered
        setTimeout(sendSearchData, 1500);
      }
    }
  });
})();
