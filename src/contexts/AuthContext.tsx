import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatar?: string;
}

export interface Application {
  id: string;
  type: "work-permit" | "visa" | "travel" | "logistics";
  title: string;
  status: "pending" | "in-review" | "approved" | "rejected";
  date: string;
  details: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: { email: string; password: string; fullName: string; phone: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  applications: Application[];
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const MOCK_APPLICATIONS: Application[] = [
  { id: "APP-001", type: "work-permit", title: "Germany Opportunity Card", status: "in-review", date: "2026-02-15", details: "Chancenkarte application with 8 points" },
  { id: "APP-002", type: "visa", title: "Schengen Tourist Visa", status: "approved", date: "2026-01-20", details: "30-day tourist visa to France" },
  { id: "APP-003", type: "travel", title: "Flight Booking - Accra to London", status: "approved", date: "2026-03-01", details: "Round trip, Economy class" },
  { id: "APP-004", type: "logistics", title: "Cargo Shipment #SH-4821", status: "pending", date: "2026-03-05", details: "20ft container, Tema to Rotterdam" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem("aw_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("aw_user", JSON.stringify(user));
    else localStorage.removeItem("aw_user");
  }, [user]);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Mock login
    setUser({ id: "usr_1", email, fullName: "John Doe", phone: "+233 123 456 789" });
    return true;
  };

  const signup = async (data: { email: string; password: string; fullName: string; phone: string }): Promise<boolean> => {
    setUser({ id: "usr_" + Date.now(), email: data.email, fullName: data.fullName, phone: data.phone });
    return true;
  };

  const logout = () => setUser(null);

  const updateProfile = (data: Partial<UserProfile>) => {
    if (user) setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateProfile, applications: user ? MOCK_APPLICATIONS : [] }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
