"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null; // Ensure this runs only on the client
    return Cookies.get("access_token") ?? null;
  });
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null; // Ensure this runs only on the client
    const savedUser = localStorage.getItem("user");
    return savedUser ? (JSON.parse(savedUser) as User) : null;
  });

  const login = (token: string, user: User) => {
    Cookies.set("access_token", token, { expires: 1 }); // Expires in 1 day
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    Cookies.remove("access_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!token }}
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
