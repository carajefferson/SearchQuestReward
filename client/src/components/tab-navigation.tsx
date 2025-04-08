import React, { useEffect, useRef } from "react";

interface TabNavigationProps {
  activeTab: "feedback" | "wallet";
  setActiveTab: (tab: "feedback" | "wallet") => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (indicatorRef.current) {
      indicatorRef.current.style.transform = 
        activeTab === "feedback" ? "translateX(0%)" : "translateX(100%)";
    }
  }, [activeTab]);

  return (
    <div className="bg-primary text-white">
      <div className="flex relative">
        <button 
          className={`flex-1 py-3 px-4 text-center font-medium ripple ${
            activeTab === "feedback" ? "opacity-100" : "opacity-60"
          }`}
          onClick={() => setActiveTab("feedback")}
        >
          Feedback
        </button>
        <button 
          className={`flex-1 py-3 px-4 text-center font-medium ripple ${
            activeTab === "wallet" ? "opacity-100" : "opacity-60"
          }`}
          onClick={() => setActiveTab("wallet")}
        >
          Wallet
        </button>
        <div 
          ref={indicatorRef}
          className="tab-indicator absolute bottom-0 left-0 h-0.5 bg-white w-1/2 transform transition-transform duration-300"
        />
      </div>
    </div>
  );
};

export default TabNavigation;
