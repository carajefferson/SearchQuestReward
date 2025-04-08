import React, { useState } from "react";
import { Settings } from "@shared/schema";

interface SettingsModalProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  settings: Settings | null;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isVisible,
  setIsVisible,
  settings,
  updateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<Partial<Settings> | null>(settings);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local settings when props settings change
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isVisible || !localSettings) {
    return null;
  }

  const handleToggle = (key: keyof Settings, value: boolean) => {
    setLocalSettings((prev) => prev ? { ...prev, [key]: value } : null);
  };

  const handleSave = async () => {
    if (!localSettings) return;
    
    setIsUpdating(true);
    try {
      await updateSettings(localSettings);
      setIsVisible(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    // Reset to original settings
    setLocalSettings(settings);
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-elevation-3 w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="font-medium">Settings</h2>
          <button 
            className="p-1 rounded-full hover:bg-neutral-100" 
            aria-label="Close settings"
            onClick={handleCancel}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Enable notifications</h3>
                <p className="text-sm text-neutral-500">Get notified when you earn rewards</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={localSettings.notifications}
                  onChange={(e) => handleToggle("notifications", e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Privacy mode</h3>
                <p className="text-sm text-neutral-500">Only capture essential search data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={localSettings.privacyMode}
                  onChange={(e) => handleToggle("privacyMode", e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto-detect search engines</h3>
                <p className="text-sm text-neutral-500">Automatically identify supported search engines</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={localSettings.autoDetect}
                  onChange={(e) => handleToggle("autoDetect", e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Supported search engines</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    id="google-engine" 
                    type="checkbox" 
                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    checked={localSettings.googleEnabled}
                    onChange={(e) => handleToggle("googleEnabled", e.target.checked)}
                  />
                  <label htmlFor="google-engine" className="ml-2 text-sm text-neutral-700">Google</label>
                </div>
                <div className="flex items-center">
                  <input 
                    id="bing-engine" 
                    type="checkbox" 
                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    checked={localSettings.bingEnabled}
                    onChange={(e) => handleToggle("bingEnabled", e.target.checked)}
                  />
                  <label htmlFor="bing-engine" className="ml-2 text-sm text-neutral-700">Bing</label>
                </div>
                <div className="flex items-center">
                  <input 
                    id="duckduckgo-engine" 
                    type="checkbox" 
                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    checked={localSettings.duckDuckGoEnabled}
                    onChange={(e) => handleToggle("duckDuckGoEnabled", e.target.checked)}
                  />
                  <label htmlFor="duckduckgo-engine" className="ml-2 text-sm text-neutral-700">DuckDuckGo</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-neutral-200 flex justify-end">
          <button 
            className="px-4 py-2 text-primary ripple rounded hover:bg-neutral-100 mr-2"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-primary text-white rounded ripple shadow-elevation-1"
            onClick={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
