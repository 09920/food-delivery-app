"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/lib/permissions";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  restaurantId?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  availablePersonas: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    restaurantStaff?: { restaurant: { id: string; name: string } }[];
  }[];
  isLoading: boolean;
  switchPersona: (userId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [availablePersonas, setAvailablePersonas] = useState<AuthContextType["availablePersonas"]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      }
      if (data.availablePersonas) {
        setAvailablePersonas(data.availablePersonas);
      }
    } catch (e) {
      console.error("Auth fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const switchPersona = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        await fetchSession();
        window.location.reload();
      }
    } catch (e) {
      console.error("Switch persona error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        availablePersonas,
        isLoading,
        switchPersona,
        refreshUser: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
