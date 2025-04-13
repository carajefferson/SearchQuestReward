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
export async function extractSearchData(tab: ChromeTab, searchQuery?: string): Promise<SearchData | null> {
  if (isDev || !window.chrome?.tabs || !tab.id) {
    return mockExtractSearchData(tab, searchQuery);
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

function mockExtractSearchData(tab: ChromeTab, customQuery?: string): Promise<SearchData> {
  const query = customQuery || "";
  
  // Create base mock data
  const allResults = [
    {
      name: "Alexandra Gonzalez",
      title: "Medical Assistant",
      location: "Tustin CA",
      currentPosition: "Medical Assistant",
      currentWorkplace: "Tustin Ear Nose & Throat Sinus and Allergy Center",
      education: "B.A Public Health",
      specialization: "ENT & Allergy Care",
      connectionType: "mutual connection",
      mutualConnections: "Ben Lazaroff",
      profileStatus: "2nd",
      matchScore: 95,
      profileElements: [
        { id: "element2", type: "title", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "element3", type: "location", value: "Tustin CA", highlighted: false, highlightType: "neutral" },
        { id: "element4", type: "currentPosition", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "element5", type: "currentWorkplace", value: "Tustin Ear Nose & Throat Sinus and Allergy Center", highlighted: false, highlightType: "neutral" },
        { id: "element6", type: "education", value: "B.A Public Health", highlighted: false, highlightType: "neutral" },
        { id: "element7", type: "specialization", value: "ENT & Allergy Care", highlighted: false, highlightType: "neutral" },
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
      specialization: "Primary Care & Geriatrics",
      connectionType: "mutual connection",
      mutualConnections: "Kumaresh Mudliar",
      profileStatus: "2nd",
      matchScore: 92,
      profileElements: [
        { id: "el2", type: "title", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "el3", type: "location", value: "Newport Beach CA", highlighted: false, highlightType: "neutral" },
        { id: "el4", type: "currentPosition", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "el5", type: "currentWorkplace", value: "Newport Family Medicine", highlighted: false, highlightType: "neutral" },
        { id: "el6", type: "education", value: "B.S. Psychological and Brain Sciences", highlighted: false, highlightType: "neutral" },
        { id: "el7", type: "specialization", value: "Primary Care & Geriatrics", highlighted: false, highlightType: "neutral" },
        { id: "el8", type: "skills", value: "Patient coordination, Medical records", highlighted: false, highlightType: "neutral" },
        { id: "el9", type: "experience", value: "2 years in family medicine", highlighted: false, highlightType: "neutral" }
      ]
    },
    {
      name: "Ray W.",
      title: "Medical Student",
      location: "Cupertino CA",
      currentPosition: "Computer Science Teacher",
      currentWorkplace: "Washington University in St. Louis",
      education: "Drexel University College of Medicine",
      specialization: "Medical Education & Technology",
      connectionType: "mutual connection",
      mutualConnections: "Ron Cytron, Andrew D. Martin, and 22 other mutual connections",
      profileStatus: "2nd",
      matchScore: 78,
      profileElements: [
        { id: "rw1", type: "title", value: "Medical Student", highlighted: false, highlightType: "neutral" },
        { id: "rw2", type: "location", value: "Cupertino CA", highlighted: false, highlightType: "neutral" },
        { id: "rw3", type: "currentPosition", value: "Computer Science Teacher", highlighted: false, highlightType: "neutral" },
        { id: "rw4", type: "currentWorkplace", value: "Washington University in St. Louis", highlighted: false, highlightType: "neutral" },
        { id: "rw5", type: "education", value: "Drexel University College of Medicine", highlighted: false, highlightType: "neutral" },
        { id: "rw6", type: "specialization", value: "Medical Education & Technology", highlighted: false, highlightType: "neutral" },
        { id: "rw7", type: "skills", value: "Teaching, Computer Science, Medical Education", highlighted: false, highlightType: "neutral" },
        { id: "rw8", type: "experience", value: "Teaching Computer Science at University Level", highlighted: false, highlightType: "neutral" }
      ]
    },
    {
      name: "Margot Bellon",
      title: "Medical Student",
      location: "San Mateo CA",
      pastPosition1: "Medical Fellow",
      pastWorkplace1: "Saving Mothers",
      education: "Drexel University College of Medicine",
      specialization: "Women's Health & Global Medicine",
      connectionType: "mutual connection",
      mutualConnections: "Wauson Liang",
      profileStatus: "2nd",
      matchScore: 81,
      profileElements: [
        { id: "mb1", type: "title", value: "Medical Student", highlighted: false, highlightType: "neutral" },
        { id: "mb2", type: "location", value: "San Mateo CA", highlighted: false, highlightType: "neutral" },
        { id: "mb3", type: "pastPosition", value: "Medical Fellow", highlighted: false, highlightType: "neutral" },
        { id: "mb4", type: "pastWorkplace", value: "Saving Mothers", highlighted: false, highlightType: "neutral" },
        { id: "mb5", type: "education", value: "Drexel University College of Medicine", highlighted: false, highlightType: "neutral" },
        { id: "mb6", type: "specialization", value: "Women's Health & Global Medicine", highlighted: false, highlightType: "neutral" },
        { id: "mb7", type: "skills", value: "Women's health, Global medicine, Research", highlighted: false, highlightType: "neutral" },
        { id: "mb8", type: "experience", value: "Medical fellowship in global health", highlighted: false, highlightType: "neutral" }
      ]
    },
    {
      name: "Dexter Wong",
      title: "Clinical Manager",
      location: "San Francisco Bay Area",
      currentPosition: "Medical Assistant",
      currentWorkplace: "Grace Pacific Medical Associates",
      specialization: "Primary Care & Clinical Management",
      connectionType: "mutual connection",
      mutualConnections: "Jerry Lee",
      profileStatus: "2nd",
      matchScore: 88,
      profileElements: [
        { id: "dw1", type: "title", value: "Clinical Manager", highlighted: false, highlightType: "neutral" },
        { id: "dw2", type: "location", value: "San Francisco Bay Area", highlighted: false, highlightType: "neutral" },
        { id: "dw3", type: "currentPosition", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "dw4", type: "currentWorkplace", value: "Grace Pacific Medical Associates", highlighted: false, highlightType: "neutral" },
        { id: "dw5", type: "education", value: "B.S. Health Administration", highlighted: false, highlightType: "neutral" },
        { id: "dw6", type: "specialization", value: "Primary Care & Clinical Management", highlighted: false, highlightType: "neutral" },
        { id: "dw7", type: "skills", value: "Team management, Primary care, Clinic operations", highlighted: false, highlightType: "neutral" },
        { id: "dw8", type: "experience", value: "5+ years in medical office management", highlighted: false, highlightType: "neutral" }
      ]
    },
    {
      name: "Kaiti Ness",
      title: "Pre-Med Medical Assistant",
      location: "Dallas TX",
      currentPosition: "Medical Assistant",
      currentWorkplace: "Advanced Dermatology and Cosmetic Surgery",
      specialization: "Dermatology & Cosmetic Procedures",
      connectionType: "mutual connection",
      mutualConnections: "Matthew Zweig",
      profileStatus: "2nd",
      matchScore: 90,
      profileElements: [
        { id: "kn1", type: "title", value: "Pre-Med Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "kn2", type: "location", value: "Dallas TX", highlighted: false, highlightType: "neutral" },
        { id: "kn3", type: "currentPosition", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "kn4", type: "currentWorkplace", value: "Advanced Dermatology and Cosmetic Surgery", highlighted: false, highlightType: "neutral" },
        { id: "kn5", type: "education", value: "Pre-Medical Studies", highlighted: false, highlightType: "neutral" },
        { id: "kn6", type: "specialization", value: "Dermatology & Cosmetic Procedures", highlighted: false, highlightType: "neutral" },
        { id: "kn7", type: "skills", value: "Dermatology treatments, Patient care, Cosmetic procedures", highlighted: false, highlightType: "neutral" },
        { id: "kn8", type: "experience", value: "3 years in dermatology practice", highlighted: false, highlightType: "neutral" }
      ]
    },
    {
      name: "Vincent Pham",
      title: "Medical Assistant",
      location: "Pittsburg CA",
      currentPosition: "Medical Assistant",
      currentWorkplace: "Golden State Dermatology",
      education: "UC Santa Barbara Biopsychology Alumni",
      specialization: "Dermatology & Skin Care",
      connectionType: "mutual connection",
      mutualConnections: "Kumaresh Mudliar",
      profileStatus: "2nd",
      matchScore: 94,
      profileElements: [
        { id: "vp1", type: "title", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "vp2", type: "location", value: "Pittsburg CA", highlighted: false, highlightType: "neutral" },
        { id: "vp3", type: "currentPosition", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "vp4", type: "currentWorkplace", value: "Golden State Dermatology", highlighted: false, highlightType: "neutral" },
        { id: "vp5", type: "education", value: "UC Santa Barbara Biopsychology Alumni", highlighted: false, highlightType: "neutral" },
        { id: "vp6", type: "specialization", value: "Dermatology & Skin Care", highlighted: false, highlightType: "neutral" },
        { id: "vp7", type: "skills", value: "Patient care, Dermatology procedures, Medical records", highlighted: false, highlightType: "neutral" },
        { id: "vp8", type: "experience", value: "2+ years in dermatology practice", highlighted: false, highlightType: "neutral" }
      ]
    },
    {
      name: "Sarah Johnson",
      title: "Pediatric Medical Assistant",
      location: "San Diego CA",
      currentPosition: "Medical Assistant",
      currentWorkplace: "Children's Primary Care Medical Group",
      education: "B.S. Child Development",
      specialization: "Pediatric Care",
      connectionType: "mutual connection",
      mutualConnections: "Melissa Chen",
      profileStatus: "2nd",
      matchScore: 93,
      profileElements: [
        { id: "sj1", type: "title", value: "Pediatric Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "sj2", type: "location", value: "San Diego CA", highlighted: false, highlightType: "neutral" },
        { id: "sj3", type: "currentPosition", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "sj4", type: "currentWorkplace", value: "Children's Primary Care Medical Group", highlighted: false, highlightType: "neutral" },
        { id: "sj5", type: "education", value: "B.S. Child Development", highlighted: false, highlightType: "neutral" },
        { id: "sj6", type: "specialization", value: "Pediatric Care", highlighted: false, highlightType: "neutral" },
        { id: "sj7", type: "skills", value: "Pediatric assessment, Parent education, Developmental screening", highlighted: false, highlightType: "neutral" },
        { id: "sj8", type: "experience", value: "4 years in pediatric care", highlighted: false, highlightType: "neutral" }
      ]
    },
    {
      name: "Michael Rodriguez",
      title: "Cardiology Medical Assistant",
      location: "Los Angeles CA",
      currentPosition: "Medical Assistant",
      currentWorkplace: "Cedars-Sinai Heart Institute",
      education: "Associate's Degree in Medical Assisting",
      specialization: "Cardiology & EKG Monitoring",
      connectionType: "mutual connection",
      mutualConnections: "David Park",
      profileStatus: "2nd",
      matchScore: 91,
      profileElements: [
        { id: "mr1", type: "title", value: "Cardiology Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "mr2", type: "location", value: "Los Angeles CA", highlighted: false, highlightType: "neutral" },
        { id: "mr3", type: "currentPosition", value: "Medical Assistant", highlighted: false, highlightType: "neutral" },
        { id: "mr4", type: "currentWorkplace", value: "Cedars-Sinai Heart Institute", highlighted: false, highlightType: "neutral" },
        { id: "mr5", type: "education", value: "Associate's Degree in Medical Assisting", highlighted: false, highlightType: "neutral" },
        { id: "mr6", type: "specialization", value: "Cardiology & EKG Monitoring", highlighted: false, highlightType: "neutral" },
        { id: "mr7", type: "skills", value: "EKG administration, Cardiac monitoring, Patient vitals", highlighted: false, highlightType: "neutral" },
        { id: "mr8", type: "experience", value: "3 years in cardiology department", highlighted: false, highlightType: "neutral" }
      ]
    }
  ];
  
  // If there's a search query, filter the results based on it
  let filteredResults = allResults;
  let resultsCount = "About 1,200 results";
  
  if (query) {
    const lowercaseQuery = query.toLowerCase();
    filteredResults = allResults.filter(candidate => {
      // Check various fields for matches
      return (
        (candidate.title && candidate.title.toLowerCase().includes(lowercaseQuery)) ||
        (candidate.currentPosition && candidate.currentPosition.toLowerCase().includes(lowercaseQuery)) ||
        (candidate.specialization && candidate.specialization.toLowerCase().includes(lowercaseQuery)) ||
        (candidate.currentWorkplace && candidate.currentWorkplace.toLowerCase().includes(lowercaseQuery)) ||
        (candidate.location && candidate.location.toLowerCase().includes(lowercaseQuery))
      );
    });
    
    // Adjust the results count based on the filtering
    resultsCount = `About ${filteredResults.length * 120} results`;
  }
  
  return Promise.resolve({
    query: query,
    source: "LinkedIn",
    resultsCount: resultsCount,
    results: filteredResults
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
