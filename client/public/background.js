// Background service worker for the extension
let currentCandidateData = null;

// Listen for tab updates to detect recruitment platform visits
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only run when the page is fully loaded
  if (changeInfo.status === 'complete' && tab.active) {
    // Check if the URL is from a supported recruitment platform
    const isRecruitmentPage = 
      tab.url.includes('linkedin.com/search/results') || 
      tab.url.includes('indeed.com/jobs') || 
      tab.url.includes('ziprecruiter.com/candidate/search');
    
    if (isRecruitmentPage) {
      // Extract candidate data from the page
      setTimeout(() => {
        chrome.tabs.executeScript(tabId, { file: 'content-script.js' });
      }, 1500); // Small delay to ensure page is fully rendered
    }
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'searchData') {
    // Store the candidate search data
    currentCandidateData = message.data;
    
    // Update extension badge to indicate candidate data is available
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#0077B5" }); // LinkedIn blue color
    
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
        platforms: {
          linkedin: true,
          indeed: true,
          ziprecruiter: true
        }
      }
    });
  }
});
