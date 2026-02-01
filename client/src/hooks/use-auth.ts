import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";

// Extended user type to include public mode info
interface AuthUser extends User {
  isPublic?: boolean;
  displayName?: string;
}

// Public user for unauthenticated visitors
const publicUser: AuthUser = {
  id: "public",
  email: "public@harriswildlands.com",
  firstName: "Public",
  lastName: "User",
  profileImageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isPublic: true,
  displayName: "Public User",
};

async function fetchUser(): Promise<AuthUser> {
  // First try to get the current user from /api/me
  const meResponse = await fetch("/api/me", {
    credentials: "include",
  });

  if (meResponse.ok) {
    const meData = await meResponse.json();
    
    // If user is public, return public user with data from API
    if (meData.isPublic) {
      return { ...publicUser, ...meData };
    }
    
    // Otherwise, get full user details
    const userResponse = await fetch("/api/auth/user", {
      credentials: "include",
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      return { ...userData, isPublic: false };
    }
  }
  
  // Fallback to public user
  return publicUser;
}

async function logout(): Promise<void> {
  window.location.href = "/api/logout";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], publicUser);
    },
  });

  const isPublic = user?.isPublic === true;
  // isAuthenticated means user is logged in with their own account (not public mode)
  const isAuthenticated = !!user && !isPublic;

  return {
    user,
    isLoading,
    isAuthenticated,
    isPublic,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    login: () => window.location.href = "/api/login",
  };
}

// Compatibility function - returns false since demo mode is replaced by public mode
export function isDemoMode(): boolean {
  return false;
}
