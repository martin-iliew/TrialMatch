import { createContext, useContext } from "react";
import type { AuthContextType } from "@shared/types/authContext";

export type { AuthContextType };

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
