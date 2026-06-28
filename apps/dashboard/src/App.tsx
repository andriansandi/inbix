import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { PricingPage } from "./pages/PricingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SignInPage, SignUpPage } from "./pages/AuthPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ScrollManager } from "./components/ScrollManager";
import { ProtectedRoute } from "./components/ProtectedRoute";

export function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/:inboxId" element={<DashboardPage />} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/auth" element={<Navigate to="/sign-in" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
