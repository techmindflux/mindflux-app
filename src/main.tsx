import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Capacitor
import { Capacitor } from "@capacitor/core";

// Log platform info in development
if (import.meta.env.DEV && Capacitor.isNativePlatform()) {
  console.log("Running on native platform:", Capacitor.getPlatform());
}

createRoot(document.getElementById("root")!).render(<App />);
