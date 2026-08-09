// lib/auth-context.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  schoolName?: string;
  subscriptionStatus?: string;
  subscriptionEnd?: string;
  subscriptionType?: string;
  class?: string;
  section?: string;
  subjects?: string[];
  classTeacherOf?: string;
  transport?: any;
  hostel?: any;
};

type AuthContextType = {
  token: string | null | undefined;
  user: User | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;   // ← must be declared here
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function storageGet(key: string) {
  return Platform.OS === "web"
    ? AsyncStorage.getItem(key)
    : SecureStore.getItemAsync(key);
}
async function storageSet(key: string, value: string) {
  return Platform.OS === "web"
    ? AsyncStorage.setItem(key, value)
    : SecureStore.setItemAsync(key, value);
}
async function storageDelete(key: string) {
  return Platform.OS === "web"
    ? AsyncStorage.removeItem(key)
    : SecureStore.deleteItemAsync(key);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          storageGet("token"),
          storageGet("user"),
        ]);
        setToken(storedToken);
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (err) {
        console.log("Auth restore error:", err);
        setToken(null);
      }
    })();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    await Promise.all([
      storageSet("token", newToken),
      storageSet("user", JSON.stringify(newUser)),
    ]);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await Promise.all([storageDelete("token"), storageDelete("user")]);
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    const currentToken = await storageGet("token");
    if (!currentToken) return;
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        await storageSet("user", JSON.stringify(data.data));
      }
    } catch (err) {
      console.log("Profile refresh error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}