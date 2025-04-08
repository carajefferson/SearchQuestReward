import React, { useEffect } from "react";

interface ToastNotificationProps {
  message: string;
  isVisible: boolean;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  isVisible,
  type = "success",
  onClose,
}) => {
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isVisible) {
      timeout = setTimeout(() => {
        onClose();
      }, 3000);
    }
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isVisible, onClose]);
  
  if (!isVisible) {
    return null;
  }
  
  const bgColorClass = type === "success" 
    ? "bg-success" 
    : type === "error" 
      ? "bg-error" 
      : "bg-primary";
  
  const iconName = type === "success" 
    ? "check_circle" 
    : type === "error" 
      ? "error" 
      : "info";
  
  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 ${bgColorClass} text-white px-4 py-2 rounded shadow-elevation-2 flex items-center z-50`}>
      <span className="material-icons mr-2">{iconName}</span>
      <span>{message}</span>
    </div>
  );
};

export default ToastNotification;
