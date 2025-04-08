import { SearchData } from "@shared/schema";

// Mock for development environment
const isDev = process.env.NODE_ENV === "development";

interface ChromeTab {
  id?: number;
  url?: string;
  title?: string;
}

// Utility to get current tab
export async function getChromeCurrentTab(): Promise<ChromeTab | null> {
  if (isDev || !window.chrome?.tabs) {
    return mockGetCurrentTab();
  }
  
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
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
    const results = await chrome.tabs.executeScript(tab.id, {
      code: `
        (function() {
          // Logic to extract search query and results from the page
          // This would be tailored to specific search engines
          const data = {
            query: "",
            engine: "",
            resultsCount: "",
            results: []
          };
          
          // Detect search engine
          if (window.location.hostname.includes("google")) {
            data.engine = "Google";
            data.query = document.querySelector('input[name="q"]')?.value || "";
            data.resultsCount = document.querySelector("#result-stats")?.textContent || "";
            
            // Extract results
            const resultElements = document.querySelectorAll(".g");
            resultElements.forEach(el => {
              const titleEl = el.querySelector("h3");
              const snippetEl = el.querySelector(".VwiC3b");
              const linkEl = el.querySelector("a");
              
              if (titleEl && linkEl) {
                data.results.push({
                  title: titleEl.textContent || "",
                  snippet: snippetEl ? snippetEl.textContent : undefined,
                  url: linkEl.href
                });
              }
            });
          } else if (window.location.hostname.includes("bing")) {
            data.engine = "Bing";
            data.query = document.querySelector('input[name="q"]')?.value || "";
            
            // Extract results
            const resultElements = document.querySelectorAll(".b_algo");
            resultElements.forEach(el => {
              const titleEl = el.querySelector("h2 a");
              const snippetEl = el.querySelector(".b_caption p");
              
              if (titleEl) {
                data.results.push({
                  title: titleEl.textContent || "",
                  snippet: snippetEl ? snippetEl.textContent : undefined,
                  url: titleEl.href
                });
              }
            });
          } else if (window.location.hostname.includes("duckduckgo")) {
            data.engine = "DuckDuckGo";
            data.query = document.querySelector('input[name="q"]')?.value || "";
            
            // Extract results
            const resultElements = document.querySelectorAll(".result");
            resultElements.forEach(el => {
              const titleEl = el.querySelector("h2 a");
              const snippetEl = el.querySelector(".result__snippet");
              
              if (titleEl) {
                data.results.push({
                  title: titleEl.textContent || "",
                  snippet: snippetEl ? snippetEl.textContent : undefined,
                  url: titleEl.href
                });
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
    url: "https://www.google.com/search?q=machine+learning+vs+deep+learning",
    title: "machine learning vs deep learning - Google Search"
  });
}

function mockExtractSearchData(tab: ChromeTab): Promise<SearchData> {
  return Promise.resolve({
    query: "machine learning vs deep learning differences",
    engine: "Google",
    resultsCount: "About 255M results",
    results: [
      {
        title: "Difference Between Machine Learning and Deep Learning",
        snippet: "Machine learning uses algorithms to parse data, learn from it and make decisions, while deep learning structures algorithms in layers...",
        url: "https://simplilearn.com/tutorials/machine-learning-tutorial/machine-learning-vs-deep-learning"
      },
      {
        title: "Machine Learning vs. Deep Learning: What's the Difference?",
        snippet: "Deep learning is a subset of machine learning that deals with neural networks to mimic the human brain's functionality...",
        url: "https://www.ibm.com/cloud/blog/machine-learning-vs-deep-learning"
      },
      {
        title: "Understanding the Differences Between ML and DL",
        snippet: "Machine learning requires more feature engineering while deep learning automatically extracts features from raw data...",
        url: "https://towardsdatascience.com/differences-between-machine-learning-and-deep-learning"
      },
      {
        title: "Deep Learning vs. Machine Learning – What's The Difference?",
        snippet: "Deep learning is a subset of machine learning that deals with neural networks containing multiple hidden layers...",
        url: "https://ibm.com/cloud/learn/deep-learning-vs-machine-learning"
      },
      {
        title: "ML vs DL: Key Differences and Applications",
        snippet: "Machine learning works best with structured data, while deep learning excels at unstructured data like images, audio and text...",
        url: "https://nvidia.com/en-us/glossary/machine-learning-vs-deep-learning/"
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
    chrome.storage.sync.get(key, (result) => {
      resolve(result[key] || null);
    });
  });
}

// Set chrome storage API
export async function setChromeStorage<T>(key: string, value: T): Promise<void> {
  if (isDev || !window.chrome?.storage) {
    return setLocalStorage(key, value);
  }
  
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      resolve();
    });
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
