/**
 * Content script to extract search data from supported search engines
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
      engine: "",
      resultsCount: "",
      results: []
    };
    
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    // Detect Google
    if (hostname.includes('google.com')) {
      data.engine = 'Google';
      data.query = getQueryParam(url, 'q') || document.querySelector('input[name="q"]')?.value || "";
      data.resultsCount = document.querySelector('#result-stats')?.textContent || "";
      
      // Extract results
      const resultElements = document.querySelectorAll('.g');
      resultElements.forEach(el => {
        const titleEl = el.querySelector('h3');
        const snippetEl = el.querySelector('.VwiC3b');
        const linkEl = el.querySelector('a');
        
        if (titleEl && linkEl) {
          data.results.push({
            title: titleEl.textContent || "",
            snippet: snippetEl ? snippetEl.textContent : undefined,
            url: linkEl.href
          });
        }
      });
    }
    // Detect Bing
    else if (hostname.includes('bing.com')) {
      data.engine = 'Bing';
      data.query = getQueryParam(url, 'q') || document.querySelector('input[name="q"]')?.value || "";
      data.resultsCount = document.querySelector('.sb_count')?.textContent || "";
      
      // Extract results
      const resultElements = document.querySelectorAll('.b_algo');
      resultElements.forEach(el => {
        const titleEl = el.querySelector('h2 a');
        const snippetEl = el.querySelector('.b_caption p');
        
        if (titleEl) {
          data.results.push({
            title: titleEl.textContent || "",
            snippet: snippetEl ? snippetEl.textContent : undefined,
            url: titleEl.href
          });
        }
      });
    }
    // Detect DuckDuckGo
    else if (hostname.includes('duckduckgo.com')) {
      data.engine = 'DuckDuckGo';
      data.query = document.querySelector('input[name="q"]')?.value || "";
      
      // DuckDuckGo doesn't show result count
      
      // Extract results
      const resultElements = document.querySelectorAll('.result');
      resultElements.forEach(el => {
        const titleEl = el.querySelector('h2 a');
        const snippetEl = el.querySelector('.result__snippet');
        
        if (titleEl) {
          data.results.push({
            title: titleEl.textContent || "",
            snippet: snippetEl ? snippetEl.textContent : undefined,
            url: titleEl.href
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
          console.log('Search data successfully captured');
        }
      });
    }
  }
  
  // Check settings before extracting data
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || {
      autoDetect: true,
      engines: {
        google: true,
        bing: true,
        duckduckgo: true
      }
    };
    
    if (settings.autoDetect) {
      const hostname = window.location.hostname;
      
      if (
        (hostname.includes('google.com') && settings.engines.google) ||
        (hostname.includes('bing.com') && settings.engines.bing) ||
        (hostname.includes('duckduckgo.com') && settings.engines.duckduckgo)
      ) {
        // Small delay to ensure page is fully rendered
        setTimeout(sendSearchData, 1000);
      }
    }
  });
})();
