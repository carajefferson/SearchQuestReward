import { useState } from "react";
import TabNavigation from "@/components/tab-navigation";
import FeedbackTab from "@/components/feedback-tab";
import WalletTab from "@/components/wallet-tab";
import SettingsModal from "@/components/settings-modal";
import { useSettings } from "@/hooks/use-settings";
import { useWallet } from "@/hooks/use-wallet";
import { useSearchData } from "@/hooks/use-search-data";

const Home = () => {
  const [activeTab, setActiveTab] = useState<"feedback" | "wallet">("feedback");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { settings, updateSettings } = useSettings();
  const { balance, transactions } = useWallet();
  const { 
    currentSearch,
    searchResults,
    submitFeedback
  } = useSearchData();

  return (
    <div className="font-sans bg-neutral-50 text-neutral-900 flex flex-col h-screen">
      {/* Header with Logo */}
      <header className="bg-primary p-4 shadow-elevation-1 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-icons mr-2">search</span>
            <h1 className="text-lg font-medium">SearchPro Feedback</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 rounded-full hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-white" 
              aria-label="Settings"
            >
              <span className="material-icons">settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "feedback" ? (
          <FeedbackTab
            currentSearch={currentSearch}
            searchResults={searchResults}
            onSubmitFeedback={submitFeedback}
          />
        ) : (
          <WalletTab 
            balance={balance} 
            transactions={transactions} 
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isVisible={isSettingsOpen}
        setIsVisible={setIsSettingsOpen}
        settings={settings}
        updateSettings={updateSettings}
      />
    </div>
  );
};

export default Home;
