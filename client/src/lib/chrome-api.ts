// @ts-nocheck
import { SearchData } from "@shared/schema";

// Mock for development environment
const isDev = process.env.NODE_ENV === "development";

// Chrome Tab interface
interface ChromeTab {
  id?: number;
  url?: string;
  title?: string;
  active?: boolean;
}

// Utility to get current tab
export async function getChromeCurrentTab(): Promise<ChromeTab | null> {
  if (isDev || !window.chrome?.tabs) {
    return mockGetCurrentTab();
  }
  
  try {
    const tabs = await window.chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0] || null;
  } catch (error) {
    console.error("Error getting current tab:", error);
    return null;
  }
}

// Utility to extract search data from a tab
export async function extractSearchData(tab: ChromeTab): Promise<SearchData | null> {
  if (isDev || !window.chrome?.tabs || !tab.id) {
    return mockExtractSearchData(tab);
  }
  
  try {
    // Inject content script to extract data
    const results = await window.chrome.tabs.executeScript(tab.id, {
      code: `
        (function() {
          // Logic to extract candidate data from the page
          const data = {
            query: "",
            source: "",
            resultsCount: "",
            results: []
          };
          
          const url = window.location.href;
          const hostname = window.location.hostname;
          
          // Helper to get URL parameters
          function getQueryParam(url, param) {
            const searchParams = new URL(url).searchParams;
            return searchParams.get(param);
          }
          
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
            resultElements.forEach((el) => {
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
          
          return data;
        })();
      `
    });
    
    if (results && results[0]) {
      return results[0] as SearchData;
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting search data:", error);
    return null;
  }
}

// Mock functions for development
function mockGetCurrentTab(): Promise<ChromeTab> {
  return Promise.resolve({
    id: 1,
    url: "https://www.linkedin.com/search/results/people/?keywords=medical%20assistant",
    title: "medical assistant - LinkedIn People Search"
  });
}

function mockExtractSearchData(tab: ChromeTab): Promise<SearchData> {
  return Promise.resolve({
    query: "medical assistant",
    source: "LinkedIn",
    resultsCount: "About 1,200 results",
    results: [
      {
        name: "Alexandra Gonzalez",
        title: "Medical assistant",
        location: "Tustin CA",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Tustin Ear Nose & Throat Sinus and Allergy Center",
        education: "B.A Public Health",
        specialization: "Medical assistant",
        connectionType: "mutual connection",
        mutualConnections: "Ben Lazaroff",
        profileStatus: "2nd",
        matchScore: 95,
        profileElements: [
          { id: "element1", type: "name", value: "Alexandra Gonzalez", highlighted: false, highlightType: "neutral" },
          { id: "element2", type: "title", value: "Medical assistant", highlighted: false, highlightType: "neutral" },
          { id: "element3", type: "location", value: "Tustin CA", highlighted: false, highlightType: "neutral" },
          { id: "element4", type: "currentPosition", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
          { id: "element5", type: "currentWorkplace", value: "Tustin Ear Nose & Throat Sinus and Allergy Center", highlighted: false, highlightType: "neutral" },
          { id: "element6", type: "education", value: "B.A Public Health", highlighted: false, highlightType: "neutral" },
          { id: "element7", type: "specialization", value: "Medical assistant", highlighted: false, highlightType: "neutral" },
          { id: "element8", type: "skills", value: "Patient care, Medical records, Vital signs", highlighted: false, highlightType: "neutral" },
          { id: "element9", type: "experience", value: "3+ years in clinical settings", highlighted: false, highlightType: "neutral" }
        ]
      },
      {
        name: "Isabella Teets",
        title: "Medical Assistant",
        location: "Newport Beach CA",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Newport Family Medicine",
        education: "B.S. Psychological and Brain Sciences",
        connectionType: "mutual connection",
        mutualConnections: "Kumaresh Mudliar",
        profileStatus: "2nd",
        matchScore: 92,
        profileElements: [
          { id: "el1", type: "name", value: "Isabella Teets", highlighted: false, highlightType: "neutral" },
          { id: "el2", type: "title", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
          { id: "el3", type: "location", value: "Newport Beach CA", highlighted: false, highlightType: "neutral" },
          { id: "el4", type: "currentPosition", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
          { id: "el5", type: "currentWorkplace", value: "Newport Family Medicine", highlighted: false, highlightType: "neutral" },
          { id: "el6", type: "education", value: "B.S. Psychological and Brain Sciences", highlighted: false, highlightType: "neutral" },
          { id: "el7", type: "skills", value: "Patient coordination, Medical records", highlighted: false, highlightType: "neutral" },
          { id: "el8", type: "experience", value: "2 years in family medicine", highlighted: false, highlightType: "neutral" }
        ]
      },
      {
        name: "Ray W.",
        title: "Medical Student",
        location: "Cupertino CA",
        currentPosition: "Computer Science Teacher",
        currentWorkplace: "Washington University in St. Louis",
        education: "Drexel University College of Medicine",
        connectionType: "mutual connection",
        mutualConnections: "Ron Cytron, Andrew D. Martin, and 22 other mutual connections",
        profileStatus: "2nd",
        matchScore: 78
      },
      {
        name: "Margot Bellon",
        title: "Medical Student",
        location: "San Mateo CA",
        pastPosition1: "Medical Fellow",
        pastWorkplace1: "Saving Mothers",
        education: "Drexel University College of Medicine",
        connectionType: "mutual connection",
        mutualConnections: "Wauson Liang",
        profileStatus: "2nd",
        matchScore: 81
      },
      {
        name: "Dexter Wong",
        title: "Clinical Manager",
        location: "San Francisco Bay Area",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Grace Pacific Medical Associates",
        connectionType: "mutual connection",
        mutualConnections: "Jerry Lee",
        profileStatus: "2nd",
        matchScore: 88
      },
      {
        name: "Kaiti Ness",
        title: "Pre-Med Medical Assistant",
        location: "Dallas TX",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Advanced Dermatology and Cosmetic Surgery",
        connectionType: "mutual connection",
        mutualConnections: "Matthew Zweig",
        profileStatus: "2nd",
        matchScore: 90
      },
      {
        name: "Vincent Pham",
        title: "Medical Assistant",
        location: "Pittsburg CA",
        currentPosition: "Medical Assistant",
        currentWorkplace: "Golden State Dermatology",
        education: "UC Santa Barbara Biopsychology Alumni",
        connectionType: "mutual connection",
        mutualConnections: "Kumaresh Mudliar",
        profileStatus: "2nd",
        matchScore: 94
      }
    ]
  });
}

// Get chrome storage API
export async function getChromeStorage<T>(key: string): Promise<T | null> {
  if (isDev || !window.chrome?.storage) {
    return getLocalStorage<T>(key);
  }
  
  return new Promise((resolve) => {
    if (window.chrome?.storage?.sync) {
      window.chrome.storage.sync.get(key, (result: any) => {
        resolve(result[key] || null);
      });
    } else {
      resolve(null);
    }
  });
}

// Set chrome storage API
export async function setChromeStorage<T>(key: string, value: T): Promise<void> {
  if (isDev || !window.chrome?.storage) {
    return setLocalStorage(key, value);
  }
  
  return new Promise((resolve) => {
    if (window.chrome?.storage?.sync) {
      window.chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Local storage fallbacks for development
function getLocalStorage<T>(key: string): Promise<T | null> {
  try {
    const value = localStorage.getItem(key);
    return Promise.resolve(value ? JSON.parse(value) : null);
  } catch (error) {
    console.error("Error getting from localStorage:", error);
    return Promise.resolve(null);
  }
}

function setLocalStorage<T>(key: string, value: T): Promise<void> {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
  } catch (error) {
    console.error("Error setting localStorage:", error);
    return Promise.resolve();
  }
}
