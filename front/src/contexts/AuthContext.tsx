import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import * as authApi from "../api/auth";

interface AuthContextType {
  user: any;
  token: string | null;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (data: any) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refresh"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar usuario al montar si hay token
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const userProfile = await authApi.getProfile(token);
          setUser(userProfile);
        } catch (error) {
          setUser(null);
          setToken(null);
          setRefreshToken(null);
          localStorage.removeItem("token");
          localStorage.removeItem("refresh");
        }
      }
      setIsLoading(false);
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [token]);

  const loginUser = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    if (data.access) {
      setToken(data.access);
      setRefreshToken(data.refresh);
      setUser(data.user);
      localStorage.setItem("token", data.access);
      localStorage.setItem("refresh", data.refresh);
    } else {
      throw new Error(data.error || "Login failed");
    }
  };

  const registerUser = async (data: any) => {
    return await authApi.register(data);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, registerUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
