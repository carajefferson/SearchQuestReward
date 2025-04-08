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
                <p className="text-sm text-neutral-500">Only capture essential candidate data</p>
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
                <h3 className="font-medium">Auto-detect recruitment platforms</h3>
                <p className="text-sm text-neutral-500">Automatically identify supported platforms</p>
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
              <h3 className="font-medium mb-2">Supported recruitment platforms</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    id="linkedin-platform" 
                    type="checkbox" 
                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    checked={localSettings.linkedInEnabled}
                    onChange={(e) => handleToggle("linkedInEnabled", e.target.checked)}
                  />
                  <label htmlFor="linkedin-platform" className="ml-2 text-sm text-neutral-700">LinkedIn</label>
                </div>
                <div className="flex items-center">
                  <input 
                    id="indeed-platform" 
                    type="checkbox" 
                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    checked={localSettings.indeedEnabled}
                    onChange={(e) => handleToggle("indeedEnabled", e.target.checked)}
                  />
                  <label htmlFor="indeed-platform" className="ml-2 text-sm text-neutral-700">Indeed</label>
                </div>
                <div className="flex items-center">
                  <input 
                    id="ziprecruiter-platform" 
                    type="checkbox" 
                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                    checked={localSettings.zipRecruiterEnabled}
                    onChange={(e) => handleToggle("zipRecruiterEnabled", e.target.checked)}
                  />
                  <label htmlFor="ziprecruiter-platform" className="ml-2 text-sm text-neutral-700">ZipRecruiter</label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Candidate feedback preferences</h3>
              <div className="p-3 bg-neutral-100 rounded">
                <p className="text-sm text-neutral-600 mb-2">Help us improve candidate matching by collecting:</p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      id="collect-skills" 
                      type="checkbox" 
                      className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                      checked={true}
                      readOnly
                    />
                    <label htmlFor="collect-skills" className="ml-2 text-sm text-neutral-700">Skills relevance</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      id="collect-experience" 
                      type="checkbox" 
                      className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                      checked={true}
                      readOnly
                    />
                    <label htmlFor="collect-experience" className="ml-2 text-sm text-neutral-700">Experience level match</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      id="collect-location" 
                      type="checkbox" 
                      className="w-4 h-4 text-primary focus:ring-primary border-neutral-300 rounded"
                      checked={true}
                      readOnly
                    />
                    <label htmlFor="collect-location" className="ml-2 text-sm text-neutral-700">Location preferences</label>
                  </div>
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
