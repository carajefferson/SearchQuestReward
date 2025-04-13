// This script runs when the popup opens
document.addEventListener('DOMContentLoaded', function() {
  // Load main app iframe
  const iframe = document.getElementById('app-iframe');
  
  // Handle messages from the iframe
  window.addEventListener('message', function(event) {
    // Check if the message is from our app
    if (event.data && event.data.type === 'RESIZE_POPUP') {
      // Resize popup if needed
      document.body.style.width = event.data.width + 'px';
      document.body.style.height = event.data.height + 'px';
    }
  });

  // Get the current tab to check if we're on a recruitment platform
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    
    // Check if we're on a supported recruitment platform
    const isRecruitmentSite = 
      currentTab.url.includes('linkedin.com') ||
      currentTab.url.includes('indeed.com') ||
      currentTab.url.includes('ziprecruiter.com');
    
    // Show appropriate message if not on a supported site
    if (!isRecruitmentSite) {
      document.getElementById('not-supported-message').style.display = 'block';
      document.getElementById('app-iframe').style.display = 'none';
    } else {
      document.getElementById('not-supported-message').style.display = 'none';
      document.getElementById('app-iframe').style.display = 'block';
    }
  });
});