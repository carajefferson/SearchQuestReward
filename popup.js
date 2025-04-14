// This script runs when the popup opens
document.addEventListener('DOMContentLoaded', function() {
  // Initialize app state
  let currentTab = null;
  let currentUser = {
    id: 1,
    username: 'recruiter',
    coinBalance: 50
  };
  let currentSearch = null;
  let searchResults = [];
  let transactions = [{
    id: 1,
    userId: 1,
    amount: 50,
    description: 'Welcome Bonus',
    timestamp: new Date()
  }];
  let balance = 50;
  
  // Function to format dates
  function formatDate(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const inputDate = new Date(date);
    const inputDateDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
    
    if (inputDateDay.getTime() === today.getTime()) {
      return 'Today';
    } else if (inputDateDay.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return inputDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
  
  // Tab switching functionality
  const feedbackTab = document.getElementById('feedback-tab');
  const walletTab = document.getElementById('wallet-tab');
  const feedbackContent = document.getElementById('feedback-content');
  const walletContent = document.getElementById('wallet-content');
  
  feedbackTab.addEventListener('click', function() {
    feedbackTab.classList.add('active');
    walletTab.classList.remove('active');
    feedbackContent.classList.add('active');
    walletContent.classList.remove('active');
  });
  
  walletTab.addEventListener('click', function() {
    walletTab.classList.add('active');
    feedbackTab.classList.remove('active');
    walletContent.classList.add('active');
    feedbackContent.classList.remove('active');
    
    // Update wallet display
    updateWalletDisplay();
  });
  
  // Function to update wallet display
  function updateWalletDisplay() {
    document.getElementById('balance-amount').textContent = balance;
    
    const transactionsList = document.getElementById('transaction-list');
    transactionsList.innerHTML = '';
    
    transactions.forEach(transaction => {
      const transactionItem = document.createElement('div');
      transactionItem.className = 'transaction-item';
      
      const details = document.createElement('div');
      details.className = 'transaction-details';
      
      const description = document.createElement('span');
      description.textContent = transaction.description;
      
      const date = document.createElement('span');
      date.className = 'transaction-date';
      date.textContent = formatDate(transaction.timestamp);
      
      details.appendChild(description);
      details.appendChild(date);
      
      const amount = document.createElement('span');
      amount.className = transaction.amount >= 0 ? 'transaction-amount' : 'transaction-amount negative';
      amount.textContent = transaction.amount >= 0 ? `+${transaction.amount}` : transaction.amount;
      
      transactionItem.appendChild(details);
      transactionItem.appendChild(amount);
      
      transactionsList.appendChild(transactionItem);
    });
  }
  
  // Medical specialties for candidates
  const specialties = [
    'Dermatology', 'Family Medicine', 'Fertility', 'ENT & Allergy', 
    'Plastic Surgery', 'Primary Care', 'Aesthetics', 'Orthopedics'
  ];
  
  function getRandomSpecialty() {
    return specialties[Math.floor(Math.random() * specialties.length)];
  }
  
  // Real candidate data based on medical assistants
  function generateMockCandidates(query = '') {
    // Define set of real candidates
    const realCandidates = [
      {
        id: 1,
        name: "Alexandra Gonzalez",
        title: "Medical Assistant",
        location: "Tustin, CA",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Tustin Ear Nose & Throat Sinus and Allergy Center",
        specialization: "ENT & Allergy",
        education: "B.A Public Health",
        connectionType: "mutual connection",
        matchScore: 92,
        profileElements: [
          { id: "edu-1-1", type: "education", text: "B.A Public Health" },
          { id: "exp-1-1", type: "experience", text: "Medical Assistant at Tustin Ear Nose & Throat Sinus and Allergy Center" },
          { id: "spec-1-1", type: "specialization", text: "ENT & Allergy specialist" },
          { id: "conn-1-1", type: "connection", text: "Mutual connection with Ben Lazaroff" }
        ]
      },
      {
        id: 2,
        name: "Isabella Teets",
        title: "Medical Assistant",
        location: "Newport Beach, CA",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Newport Family Medicine",
        specialization: "Family Medicine",
        education: "B.S. Psychological and Brain Sciences",
        connectionType: "mutual connection",
        matchScore: 88,
        profileElements: [
          { id: "edu-2-1", type: "education", text: "B.S. Psychological and Brain Sciences" },
          { id: "exp-2-1", type: "experience", text: "Medical Assistant at Newport Family Medicine" },
          { id: "spec-2-1", type: "specialization", text: "Family Medicine specialist" },
          { id: "conn-2-1", type: "connection", text: "Mutual connection with Kumaresh Mudliar" }
        ]
      },
      {
        id: 3,
        name: "Vincent Pham",
        title: "Medical Assistant",
        location: "Pittsburg, CA",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Golden State Dermatology",
        specialization: "Dermatology",
        education: "UC Santa Barbara Biopsychology Alumni",
        connectionType: "mutual connection",
        matchScore: 85,
        profileElements: [
          { id: "edu-3-1", type: "education", text: "UC Santa Barbara Biopsychology Alumni" },
          { id: "exp-3-1", type: "experience", text: "Medical Assistant at Golden State Dermatology" },
          { id: "spec-3-1", type: "specialization", text: "Dermatology specialist" },
          { id: "conn-3-1", type: "connection", text: "Mutual connection with Kumaresh Mudliar" }
        ]
      },
      {
        id: 4,
        name: "Chelsea P.",
        title: "Medical Assistant",
        location: "San Francisco, CA",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Spring Fertility",
        specialization: "Fertility",
        education: "Customer Support/Customer Service background",
        connectionType: "2nd",
        matchScore: 79,
        profileElements: [
          { id: "exp-4-1", type: "experience", text: "Medical Assistant at Spring Fertility" },
          { id: "spec-4-1", type: "specialization", text: "Fertility specialist" },
          { id: "bkg-4-1", type: "background", text: "Customer Support/Customer Service background" }
        ]
      },
      {
        id: 5,
        name: "Chikasi Eze",
        title: "Medical Assistant",
        location: "Valley Cottage, NY",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Tribeca Park Dermatology",
        specialization: "Dermatology",
        education: "Vassar College Alumn",
        connectionType: "mutual connection",
        matchScore: 84,
        profileElements: [
          { id: "edu-5-1", type: "education", text: "Vassar College Alumn" },
          { id: "exp-5-1", type: "experience", text: "Medical Assistant at Tribeca Park Dermatology" },
          { id: "spec-5-1", type: "specialization", text: "Dermatology specialist" },
          { id: "conn-5-1", type: "connection", text: "Mutual connection with Pablo Crisostomo Suarez" }
        ]
      },
      {
        id: 6,
        name: "Aaron Moy",
        title: "Medical Assistant",
        location: "Oakland, CA",
        currentPosition: "Primary Care Medical Assistant",
        currentWorkplace: "UHS Tang Center",
        specialization: "Primary Care",
        connectionType: "mutual connection",
        matchScore: 81,
        profileElements: [
          { id: "exp-6-1", type: "experience", text: "Primary Care Medical Assistant at UHS Tang Center" },
          { id: "spec-6-1", type: "specialization", text: "Primary Care specialist" },
          { id: "conn-6-1", type: "connection", text: "Mutual connection with Max Roitblat" }
        ]
      },
      {
        id: 7,
        name: "Kelsey C.",
        title: "Medical Assistant",
        location: "San Francisco, CA",
        currentPosition: "Medical Assistant / Patient Coordinator",
        currentWorkplace: "450Dermatology (Office of David MacGregor M.D)",
        specialization: "Dermatology",
        connectionType: "2nd",
        matchScore: 78,
        profileElements: [
          { id: "exp-7-1", type: "experience", text: "Medical Assistant / Patient Coordinator at 450Dermatology" },
          { id: "spec-7-1", type: "specialization", text: "Dermatology specialist with patient coordination experience" }
        ]
      }
    ];
    
    // Filter by query if provided
    let filteredCandidates = realCandidates;
    if (query && query.trim() !== '') {
      const queryLower = query.toLowerCase();
      filteredCandidates = realCandidates.filter(candidate => {
        return (
          candidate.name.toLowerCase().includes(queryLower) ||
          candidate.currentPosition.toLowerCase().includes(queryLower) ||
          candidate.currentWorkplace.toLowerCase().includes(queryLower) ||
          candidate.specialization.toLowerCase().includes(queryLower) ||
          candidate.location.toLowerCase().includes(queryLower) ||
          (candidate.education && candidate.education.toLowerCase().includes(queryLower))
        );
      });
    }
    
    // Return filtered candidates or at least 3 if none match
    return filteredCandidates.length > 0 ? filteredCandidates : realCandidates.slice(0, 3);
  }
  
  // Search functionality
  const searchButton = document.getElementById('search-button');
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('results-container');
  
  searchButton.addEventListener('click', function() {
    const query = searchInput.value.trim();
    performSearch(query);
  });
  
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      performSearch(query);
    }
  });
  
  function performSearch(query) {
    // Show loading state
    resultsContainer.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Searching for candidates...</p>
      </div>
    `;
    
    // Simulate API delay
    setTimeout(() => {
      // Generate mock search data
      currentSearch = {
        id: Date.now(),
        query: query,
        timestamp: new Date(),
        source: 'LinkedIn',
        resultsCount: `About ${10 + Math.floor(Math.random() * 90)} results`
      };
      
      // Generate mock candidates
      searchResults = generateMockCandidates(query);
      
      // Display results
      displaySearchResults();
    }, 1000);
  }
  
  function displaySearchResults() {
    if (!searchResults || searchResults.length === 0) {
      resultsContainer.innerHTML = `
        <div class="card">
          <p>No candidates found. Try a different search term.</p>
        </div>
      `;
      return;
    }
    
    resultsContainer.innerHTML = '';
    
    searchResults.forEach(candidate => {
      const candidateCard = document.createElement('div');
      candidateCard.className = 'card';
      
      candidateCard.innerHTML = `
        <h3>${candidate.name}</h3>
        <p><span class="highlight">${candidate.currentPosition}</span> at ${candidate.currentWorkplace}</p>
        <p>${candidate.location} • ${candidate.title}</p>
        <p>Match Score: <span class="highlight">${candidate.matchScore}%</span></p>
        <button class="provide-feedback" data-id="${candidate.id}">Provide Feedback</button>
      `;
      
      resultsContainer.appendChild(candidateCard);
      
      // Add event listener to the feedback button
      candidateCard.querySelector('.provide-feedback').addEventListener('click', function() {
        const candidateId = this.getAttribute('data-id');
        openFeedbackForm(parseInt(candidateId));
      });
    });
  }
  
  // Feedback form functionality
  function openFeedbackForm(candidateId) {
    const candidate = searchResults.find(c => c.id === candidateId);
    
    if (!candidate) return;
    
    // Clear previous content and show feedback form
    resultsContainer.innerHTML = '';
    
    const feedbackForm = document.createElement('div');
    feedbackForm.className = 'card';
    feedbackForm.innerHTML = `
      <h3>Provide Feedback for ${candidate.name}</h3>
      <p>${candidate.currentPosition} at ${candidate.currentWorkplace}</p>
      
      <div class="profile-elements">
        <h4>Highlight Elements for Feedback</h4>
        <p>Click elements to mark as good (green) or poor (red) match.</p>
        
        <div class="elements-list" id="elements-list">
          ${candidate.profileElements.map(element => `
            <div class="profile-element" data-id="${element.id}">
              ${element.text}
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="feedback-comment">
        <h4>Additional Comments</h4>
        <textarea id="feedback-comment" rows="3" placeholder="Share your thoughts on this candidate match..."></textarea>
      </div>
      
      <div class="button-row">
        <button class="secondary" id="cancel-feedback">Back to Results</button>
        <button id="submit-feedback">Submit Feedback</button>
      </div>
    `;
    
    resultsContainer.appendChild(feedbackForm);
    
    // Add styles for profile elements
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .profile-elements {
        margin: 16px 0;
      }
      
      .profile-element {
        padding: 10px;
        margin: 8px 0;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .profile-element.good-match {
        background-color: rgba(39, 174, 96, 0.1);
        border-color: #27AE60;
      }
      
      .profile-element.poor-match {
        background-color: rgba(235, 87, 87, 0.1);
        border-color: #EB5757;
      }
      
      .feedback-comment {
        margin: 16px 0;
      }
      
      textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-family: inherit;
        resize: vertical;
      }
      
      .button-row {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
      }
    `;
    document.head.appendChild(styleEl);
    
    // Element highlighting functionality
    const elementsList = document.getElementById('elements-list');
    const profileElements = elementsList.querySelectorAll('.profile-element');
    
    profileElements.forEach(element => {
      element.addEventListener('click', function() {
        if (this.classList.contains('good-match')) {
          this.classList.remove('good-match');
          this.classList.add('poor-match');
        } else if (this.classList.contains('poor-match')) {
          this.classList.remove('poor-match');
        } else {
          this.classList.add('good-match');
        }
      });
    });
    
    // Cancel button functionality
    document.getElementById('cancel-feedback').addEventListener('click', function() {
      displaySearchResults();
    });
    
    // Submit button functionality
    document.getElementById('submit-feedback').addEventListener('click', function() {
      const goodMatchElements = [];
      const poorMatchElements = [];
      
      profileElements.forEach(element => {
        const elementId = element.getAttribute('data-id');
        
        if (element.classList.contains('good-match')) {
          goodMatchElements.push(elementId);
        } else if (element.classList.contains('poor-match')) {
          poorMatchElements.push(elementId);
        }
      });
      
      const comment = document.getElementById('feedback-comment').value.trim();
      
      // Validate feedback - must have at least one highlighted element
      if (goodMatchElements.length === 0 && poorMatchElements.length === 0) {
        alert('Please highlight at least one profile element as good or poor match.');
        return;
      }
      
      // Submit feedback
      submitFeedback({
        userId: currentUser.id,
        searchId: currentSearch.id,
        candidateId: candidate.id,
        goodMatchElements,
        poorMatchElements,
        comment: comment || null,
        timestamp: new Date()
      });
    });
  }
  
  function submitFeedback(feedback) {
    // Show loading state
    resultsContainer.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Processing your feedback...</p>
      </div>
    `;
    
    // Simulate API delay
    setTimeout(() => {
      // Calculate reward based on feedback quality
      const rewardCoins = 5 + Math.floor(Math.random() * 15); // 5-20 coins
      
      // Add transaction
      const newTransaction = {
        id: transactions.length + 1,
        userId: currentUser.id,
        amount: rewardCoins,
        description: `Feedback Reward - ${currentSearch.query}`,
        timestamp: new Date()
      };
      
      transactions.unshift(newTransaction);
      
      // Update balance
      balance += rewardCoins;
      
      // Show success message
      resultsContainer.innerHTML = `
        <div class="card">
          <h3>Feedback Submitted!</h3>
          <p>Thank you for your valuable feedback on this candidate.</p>
          <p>You've earned <span class="highlight">+${rewardCoins} coins</span> for your contribution.</p>
          <button id="back-to-search">Back to Search</button>
        </div>
      `;
      
      // Back to search button
      document.getElementById('back-to-search').addEventListener('click', function() {
        displaySearchResults();
      });
    }, 1500);
  }
  
  // Check if we're on a recruitment site
  try {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      currentTab = tabs[0];
      
      // Check if we're on a supported recruitment platform
      const isRecruitmentSite = 
        currentTab.url.includes('linkedin.com') ||
        currentTab.url.includes('indeed.com') ||
        currentTab.url.includes('ziprecruiter.com');
      
      // Show appropriate message if not on a supported site
      if (!isRecruitmentSite) {
        document.getElementById('not-supported-message').style.display = 'block';
        feedbackContent.style.display = 'none';
      } else {
        document.getElementById('not-supported-message').style.display = 'none';
        feedbackContent.style.display = 'block';
        
        // If on LinkedIn search results, attempt to extract real data
        if (currentTab.url.includes('linkedin.com/search/results')) {
          // Show loading state with message about extraction
          resultsContainer.innerHTML = `
            <div class="loading">
              <div class="spinner"></div>
              <p>Extracting candidate data from LinkedIn...</p>
            </div>
          `;
          
          // Attempt to get data from the content script
          chrome.tabs.sendMessage(currentTab.id, { action: "extractCandidates" }, function(response) {
            if (response && response.success && response.candidates && response.candidates.length > 0) {
              // Create search context based on the URL
              const url = new URL(currentTab.url);
              const keywords = url.searchParams.get('keywords') || '';
              
              currentSearch = {
                id: Date.now(),
                query: keywords,
                timestamp: new Date(),
                source: 'LinkedIn',
                resultsCount: `${response.candidates.length} results shown`
              };
              
              // Use the extracted candidates
              searchResults = response.candidates;
              displaySearchResults();
            } else {
              // Fall back to mock data if extraction fails
              performSearch('');
            }
          });
        } else {
          // Initialize search with empty query for other platforms
          performSearch('');
        }
      }
    });
  } catch (error) {
    console.log('Error accessing Chrome APIs:', error);
    // When testing outside of Chrome extension environment
    performSearch('');
  }
  
  // Initialize wallet display
  updateWalletDisplay();
});