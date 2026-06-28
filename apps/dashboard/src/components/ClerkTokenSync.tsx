import { useEffect } from "react";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { setAuthToken } from "../lib/authToken";

export function ClerkTokenSync() {
  const { getToken, isSignedIn } = useClerkAuth();

  useEffect(() => {
    const syncToken = async () => {
      const token = await getToken();
      setAuthToken(token);
    };

    if (isSignedIn) {
      syncToken();
      const interval = setInterval(syncToken, 50_000);
      return () => clearInterval(interval);
    } else {
      setAuthToken(null);
    }
  }, [isSignedIn, getToken]);

  return null;
}
