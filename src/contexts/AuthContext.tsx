import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { getAuthErrorMessage, normalizeEmail } from "@/lib/authErrors";

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
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { email: string; password: string; fullName: string; phone: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  applications: Application[];
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const fetchProfile = async (authUser: User): Promise<UserProfile> => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    return {
      id: authUser.id,
      email: authUser.email || "",
      fullName: data?.full_name || "",
      phone: data?.phone || "",
      avatar: data?.avatar_url || undefined,
    };
  };

  useEffect(() => {
    // Get the initial session first, then set up the listener
    // This avoids the "lock steal" race condition
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user);
          setUser(profile);
        }
      } catch (e) {
        console.error("Error getting session:", e);
      } finally {
        setLoading(false);
        initialized.current = true;
      }
    };

    init();

    // Set up the listener AFTER initial check
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip if we haven't finished the initial load yet
        if (!initialized.current) return;

        if (event === "SIGNED_OUT") {
          setUser(null);
          return;
        }

        if (session?.user) {
          // Use setTimeout to avoid Supabase internal lock contention
          setTimeout(async () => {
            try {
              const profile = await fetchProfile(session.user);
              setUser(profile);
            } catch (e) {
              console.error("Error fetching profile:", e);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) return { success: false, error: getAuthErrorMessage(error, "login") || error.message };
    // Immediately set user from the login response
    if (data.user) {
      const profile = await fetchProfile(data.user);
      setUser(profile);
    }
    return { success: true };
  };

  const signup = async (data: { email: string; password: string; fullName: string; phone: string }) => {
    const normalizedEmail = normalizeEmail(data.email);
    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: data.password,
      options: {
        data: { full_name: data.fullName, phone: data.phone },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, error: getAuthErrorMessage(error, "signup") || error.message };
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updates: Record<string, string | undefined> = {};
    if (data.fullName !== undefined) updates.full_name = data.fullName;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.avatar !== undefined) updates.avatar_url = data.avatar;

    await supabase.from("profiles").update(updates).eq("id", user.id);
    setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, signup, logout, updateProfile, applications: [] }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
