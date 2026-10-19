/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserProfile } from "../types";

const PROFILE_KEY = "food_stay_hub_user";
const TOKEN_KEY = "food_stay_hub_token";

interface AuthContextType {
  currentUser: UserProfile | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  demoLogin: (role: "user" | "business" | "admin") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function requestAuth(path: string, body: Record<string, string>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Authentication request failed");
  return data as { user: UserProfile; token: string };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const saveSession = (user: UserProfile, token: string) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
    setUserProfile(user);
  };

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
      } catch {
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const data = await requestAuth("/api/auth/register", { email, password, name });
    saveSession(data.user, data.token);
  };

  const signIn = async (email: string, password: string) => {
    const data = await requestAuth("/api/auth/login", { email, password });
    saveSession(data.user, data.token);
  };

  const signOut = async () => {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUserProfile(null);
  };

  const demoLogin = async (role: "user" | "business" | "admin") => {
    const demoProfiles: Record<string, UserProfile> = {
      user: {
        id: "demo-user-123", uid: "demo-user-123", name: "Ahmad Foodie",
        email: "foodlover@malaysia.my", photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: "user", createdAt: new Date().toISOString(),
      },
      business: {
        id: "demo-owner-456", uid: "demo-owner-456", name: "Chef Zul (Heritage Kitchen)",
        email: "chefzul@heritagekitchen.my", photoURL: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80",
        role: "business", createdAt: new Date().toISOString(),
      },
      admin: {
        id: "demo-admin-789", uid: "demo-admin-789", name: "System Admin",
        email: "admin@foodstayhub.com", photoURL: "", role: "admin",
        createdAt: new Date().toISOString(),
      },
    };
    const selected = demoProfiles[role];
    saveSession(selected, `session_${selected.id}`);
  };

  return (
    <AuthContext.Provider value={{ currentUser: userProfile, userProfile, loading, signUp, signIn, signOut, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
