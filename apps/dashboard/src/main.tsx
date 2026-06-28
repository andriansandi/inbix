import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { App } from "./App";
import { ClerkTokenSync } from "./components/ClerkTokenSync";
import "./index.css";

const clerkPubKey =
  (window as unknown as { __CLERK_PUBLISHABLE_KEY__?: string }).__CLERK_PUBLISHABLE_KEY__ ||
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <ClerkTokenSync />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);
