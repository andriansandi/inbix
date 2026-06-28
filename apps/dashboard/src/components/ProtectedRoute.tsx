import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isAuthenticated } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}
