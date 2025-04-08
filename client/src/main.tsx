import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Check if the app is running as an extension
const isExtension = window.location.protocol === "chrome-extension:";

// Additional setup for extension environment if needed
if (isExtension) {
  console.log("Running in Chrome extension context");
}

createRoot(document.getElementById("root")!).render(<App />);
