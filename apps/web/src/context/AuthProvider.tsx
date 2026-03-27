import { useState, useEffect, useCallback, type ReactNode } from "react";
import { clearTokens, setAccessToken } from "@shared/utils/tokenStorage";
import { configureApiClient } from "@shared/api/client";
import { authApi } from "@shared/services/authService";
import type { User } from "@shared/api-types/auth";
import type { UserRole, Permission } from "@shared/constants/roles";
import { hasPermission } from "@shared/utils/permissions";
import { queryClient } from "../lib/queryClient";
import { AuthContext } from "./AuthContext";
import { WEB_API_BASE_URL } from "../config/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthFailure = useCallback(() => {
    clearTokens();
    setUser(null);
    queryClient.clear();
  }, []);

  useEffect(() => {
    let cancelled = false;

    configureApiClient({
      baseURL: WEB_API_BASE_URL,
      onAuthFailure: handleAuthFailure,
    });

    const restoreSession = async () => {
      try {
        const session = await authApi.refresh();
        setAccessToken(session.accessToken);
        const currentUser = await authApi.getMe();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        if (!cancelled) {
          clearTokens();
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [handleAuthFailure]);

  const login = async (email: string, password: string) => {
    const session = await authApi.login({ email, password });
    setAccessToken(session.accessToken);
    const currentUser = await authApi.getMe();
    setUser(currentUser);
  };

  const register = async (email: string, password: string) => {
    await authApi.register({ email, password });
    await login(email, password);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearTokens();
      setUser(null);
      queryClient.clear();
    }
  };

  const userRole = (user?.role as UserRole) ?? ("Customer" as UserRole);
  const hasRoleFn = (role: UserRole) => user?.role === role;
  const isAdmin = () => hasRoleFn("Admin" as UserRole);
  const canDo = (permission: Permission) => hasPermission(userRole, permission);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        hasRole: hasRoleFn,
        isAdmin,
        canDo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
