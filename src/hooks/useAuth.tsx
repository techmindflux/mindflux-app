import { createContext, useContext, useState, ReactNode } from "react";

type AuthType = "guest" | "google" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  authType: AuthType;
  login: (type: "guest" | "google") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authType, setAuthType] = useState<AuthType>(null);

  const login = (type: "guest" | "google") => {
    setAuthType(type);
  };

  const logout = () => {
    setAuthType(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authType !== null,
        authType,
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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
