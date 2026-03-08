import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super-admin";
}

interface AdminContextType {
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminContext = createContext<AdminContextType>({} as AdminContextType);

const MOCK_ADMIN_EMAIL = "admin@africanwaves.com";
const MOCK_ADMIN_PASSWORD = "admin123";

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem("aw_admin");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (admin) localStorage.setItem("aw_admin", JSON.stringify(admin));
    else localStorage.removeItem("aw_admin");
  }, [admin]);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    if (email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD) {
      setAdmin({ id: "admin_1", email, name: "Admin User", role: "super-admin" });
      return true;
    }
    return false;
  };

  const adminLogout = () => setAdmin(null);

  return (
    <AdminContext.Provider value={{ admin, isAdminAuthenticated: !!admin, adminLogin, adminLogout }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
