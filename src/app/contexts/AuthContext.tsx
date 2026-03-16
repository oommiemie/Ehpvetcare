import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthUser {
  username: string;
  displayName: string;
  role: string;
  avatar: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  admin: {
    password: "admin",
    user: { username: "admin", displayName: "สพ.ญ. อรพิน", role: "สัตวแพทย์", avatar: "สพ" },
  },
  vet: {
    password: "vet123",
    user: { username: "vet", displayName: "สพ.ว. สมชาย", role: "สัตวแพทย์", avatar: "ส" },
  },
  nurse: {
    password: "nurse123",
    user: { username: "nurse", displayName: "น.ส. สุภาพร", role: "ผู้ช่วยสัตวแพทย์", avatar: "น" },
  },
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("vet_clinic_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("vet_clinic_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800)); // simulate API delay
    const entry = MOCK_USERS[username.toLowerCase()];
    if (!entry || entry.password !== password) {
      return { success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    }
    setUser(entry.user);
    localStorage.setItem("vet_clinic_user", JSON.stringify(entry.user));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vet_clinic_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
