import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/clerk-react";

export interface AuthUser {
  id: string;
  email: string;
}

export function useAuth() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useClerkAuth();

  const user: AuthUser | null =
    isSignedIn && clerkUser
      ? {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        }
      : null;

  return {
    user,
    isAuthenticated: isSignedIn ?? false,
    isLoaded,
    signOut: () => signOut(),
    getToken: () => getToken(),
  };
}
