import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthUser {
  username: string;
  displayName: string;
  role: string;
  avatar: string;
  photo?: string;
  /** คลินิกที่ผู้ใช้คนนี้สังกัด — ใช้ดึงชื่อ/รหัส/โลโก้คลินิกมาแสดง */
  clinicId?: string;
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
    user: {
      username: "admin",
      displayName: "สพ.ญ. อรพิน",
      role: "สัตวแพทย์",
      avatar: "สพ",
      photo: "https://randomuser.me/api/portraits/women/68.jpg",
      clinicId: "ehp-01",
    },
  },
  vet: {
    password: "vet123",
    user: {
      username: "vet",
      displayName: "สพ.ว. สมชาย",
      role: "สัตวแพทย์",
      avatar: "ส",
      photo: "https://randomuser.me/api/portraits/men/15.jpg",
      clinicId: "ehp-01",
    },
  },
  nurse: {
    password: "nurse123",
    user: {
      username: "nurse",
      displayName: "น.ส. สุภาพร",
      role: "ผู้ช่วยสัตวแพทย์",
      avatar: "น",
      photo: "https://randomuser.me/api/portraits/women/33.jpg",
      clinicId: "ehp-02",
    },
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
    await new Promise((r) => setTimeout(r, 600)); // simulate API delay
    if (!username.trim() || !password.trim()) {
      return { success: false, error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" };
    }
    // Demo mode: accept any credentials. Use known mock entry when matched,
    // otherwise generate a default profile from the username.
    const entry = MOCK_USERS[username.toLowerCase()];
    const resolved: AuthUser = entry
      ? entry.user
      : {
          username,
          displayName: username,
          role: "ผู้ใช้งาน",
          avatar: username.slice(0, 1).toUpperCase(),
          photo: "https://randomuser.me/api/portraits/lego/1.jpg",
          clinicId: "ehp-01",
        };
    setUser(resolved);
    localStorage.setItem("vet_clinic_user", JSON.stringify(resolved));
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
