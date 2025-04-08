// Background service worker for the extension
let currentSearchData = null;

// Listen for tab updates to detect search engine visits
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only run when the page is fully loaded
  if (changeInfo.status === 'complete' && tab.active) {
    // Check if the URL is from a supported search engine
    const isSearchPage = 
      tab.url.includes('google.com/search') || 
      tab.url.includes('bing.com/search') || 
      tab.url.includes('duckduckgo.com');
    
    if (isSearchPage) {
      // Extract search data from the page
      setTimeout(() => {
        chrome.tabs.executeScript(tabId, { file: 'content-script.js' });
      }, 1000); // Small delay to ensure page is fully rendered
    }
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'searchData') {
    // Store the search data
    currentSearchData = message.data;
    
    // Update extension badge to indicate search data is available
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#6200EE" });
    
    sendResponse({ success: true });
  }
  
  // Allow for async response
  return true;
});

// Listen for extension popup being opened
chrome.action.onClicked.addListener(() => {
  // Clear badge when popup is opened
  chrome.action.setBadgeText({ text: "" });
});

// Keep track of user settings
chrome.storage.sync.get(['settings'], (result) => {
  if (!result.settings) {
    // Set default settings
    chrome.storage.sync.set({
      settings: {
        notifications: true,
        privacyMode: true,
        autoDetect: true,
        engines: {
          google: true,
          bing: true,
          duckduckgo: true
        }
      }
    });
  }
});
