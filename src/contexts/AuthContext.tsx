import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types";
import api from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Restore session on page refresh
   */
  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.clear();
        sessionStorage.clear();
      }
    }

    setIsLoading(false);
  }, []);

  /**
   * REAL login implementation
   */
  const login = async (
    email: string,
    password: string,
    remember: boolean
  ) => {
    const response = await api.post("/users/login", {
      email,
      password,
    });

    const { success, access_token, user } = response.data;

    if (!success || !access_token || !user) {
      throw new Error("Invalid login response");
    }

    const storage = remember ? localStorage : sessionStorage;

    storage.setItem("access_token", access_token);
    storage.setItem("user", JSON.stringify(user));

    setUser(user);
  };

  /**
   * Logout and clear session
   */
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");

    setUser(null);

    // optional hard redirect (recommended)
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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
