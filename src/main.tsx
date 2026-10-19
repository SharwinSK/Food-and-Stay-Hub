// Intercept global uncaught errors and unhandled rejections related to Google Maps
if (typeof window !== "undefined") {
  const handleGlobalError = (event: ErrorEvent) => {
    const msg = event.message || "";
    const src = event.filename || "";
    if (
      msg.includes("google") || 
      msg.includes("maps") || 
      msg.includes("InvalidKeyMapError") || 
      msg.includes("gm_authFailure") ||
      msg.includes("Script error.") ||
      src.includes("maps.googleapis")
    ) {
      console.warn("Caught and suppressed Google Maps script error:", msg);
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason?.message || String(event.reason || "");
    if (
      reason.includes("google") || 
      reason.includes("maps") || 
      reason.includes("InvalidKeyMapError")
    ) {
      console.warn("Caught and suppressed Google Maps promise rejection:", reason);
      event.preventDefault();
      event.stopPropagation();
    }
  };

  window.addEventListener("error", handleGlobalError, true);
  window.addEventListener("unhandledrejection", handleUnhandledRejection, true);

  // Override window.onerror as well for standard script errors
  const prevOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msg = String(message || "");
    const src = String(source || "");
    if (
      msg.includes("google") || 
      msg.includes("maps") || 
      msg.includes("InvalidKeyMapError") || 
      msg.includes("Script error.") ||
      src.includes("maps.googleapis")
    ) {
      console.warn("Suppressed via window.onerror:", msg);
      return true; // Prevents default browser handling
    }
    if (prevOnError) {
      return prevOnError.apply(this, arguments as any);
    }
    return false;
  };

  // Intercept console.error to handle InvalidKeyMapError output from Google Maps
  const originalConsoleError = console.error;
  console.error = function (...args) {
    const firstArg = String(args[0] || "");
    if (
      firstArg.includes("InvalidKeyMapError") ||
      firstArg.includes("Google Maps JavaScript API error") ||
      firstArg.includes("gm_authFailure") ||
      args.some(arg => String(arg).includes("maps.googleapis.com"))
    ) {
      console.warn("Suppressed Google Maps console.error:", ...args);
      // Trigger the fallback immediately if console sees InvalidKeyMapError!
      if (typeof (window as any).gm_authFailure === "function") {
        try {
          (window as any).gm_authFailure();
        } catch (e) {}
      }
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
