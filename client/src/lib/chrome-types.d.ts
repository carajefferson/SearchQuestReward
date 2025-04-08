// Type definitions for Chrome extension API
interface Chrome {
  tabs: {
    query: (queryInfo: { active: boolean; currentWindow: boolean }) => Promise<ChromeTab[]>;
    executeScript: (tabId: number, details: { code: string }) => Promise<any[]>;
    onUpdated: {
      addListener: (callback: (tabId: number, changeInfo: any, tab: ChromeTab) => void) => void;
    };
  };
  runtime: {
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: (response?: any) => void) => boolean | void) => void;
    };
    sendMessage: (message: any, callback?: (response: any) => void) => void;
  };
  storage: {
    sync: {
      get: (keys: string | string[], callback: (items: { [key: string]: any }) => void) => void;
      set: (items: { [key: string]: any }, callback?: () => void) => void;
    };
  };
  action: {
    setBadgeText: (details: { text: string }) => void;
    setBadgeBackgroundColor: (details: { color: string }) => void;
    onClicked: {
      addListener: (callback: (tab: ChromeTab) => void) => void;
    };
  };
}

interface Window {
  chrome?: Chrome;
}

interface ChromeTab {
  id?: number;
  url?: string;
  title?: string;
  active?: boolean;
}