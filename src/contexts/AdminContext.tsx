import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { getAuthErrorMessage, normalizeEmail } from "@/lib/authErrors";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super-admin";
}

interface AdminContextType {
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({} as AdminContextType);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (user: User): Promise<boolean> => {
    const { data } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    } as any);
    return !!data;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setTimeout(async () => {
            const isAdmin = await checkAdminRole(session.user);
            if (isAdmin) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", session.user.id)
                .single();
              setAdmin({
                id: session.user.id,
                email: session.user.email || "",
                name: profile?.full_name || "Admin",
                role: "super-admin",
              });
            } else {
              setAdmin(null);
            }
            setLoading(false);
          }, 0);
        } else {
          setAdmin(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await checkAdminRole(session.user);
        if (isAdmin) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", session.user.id)
            .single();
          setAdmin({
            id: session.user.id,
            email: session.user.email || "",
            name: profile?.full_name || "Admin",
            role: "super-admin",
          });
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const adminLogin = async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) return { success: false, error: getAuthErrorMessage(error, "login") || error.message };
    
    if (data.user) {
      const isAdmin = await checkAdminRole(data.user);
      if (!isAdmin) {
        await supabase.auth.signOut();
        return { success: false, error: "You do not have admin privileges." };
      }
    }
    return { success: true };
  };

  const adminLogout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, isAdminAuthenticated: !!admin, loading, adminLogin, adminLogout }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
