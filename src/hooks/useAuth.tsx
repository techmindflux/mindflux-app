import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  authType: "guest" | "google" | null;
  loginAsGuest: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authType, setAuthType] = useState<"guest" | "google" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setAuthType("google");
        } else if (authType !== "guest") {
          setAuthType(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setAuthType("google");
      }
      
      setIsLoading(false);
    });

    // Check for guest session in localStorage
    const guestSession = localStorage.getItem("mindflux_guest");
    if (guestSession === "true") {
      setAuthType("guest");
      setIsLoading(false);
    }

    return () => subscription.unsubscribe();
  }, []);

  const loginAsGuest = () => {
    localStorage.setItem("mindflux_guest", "true");
    setAuthType("guest");
  };

  const loginWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/home`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    
    if (error) {
      console.error("Google login error:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem("mindflux_guest");
    
    if (session) {
      await supabase.auth.signOut();
    }
    
    setUser(null);
    setSession(null);
    setAuthType(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authType !== null,
        user,
        session,
        authType,
        loginAsGuest,
        loginWithGoogle,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
