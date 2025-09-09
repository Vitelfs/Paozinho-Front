import { authService } from "@/services/auth.service";
import type { LoginType } from "@/types/login.type";
import type { User } from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthContextProps {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  login: (credentials: LoginType) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.authStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setAuthenticated(!!firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (credentials: LoginType) => {
    await authService.login(credentials);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setAuthenticated(false);
  }, []);

  const contextValue = useMemo(
    () => ({ authenticated, loading, setAuthenticated, login, logout, user }),
    [authenticated, loading, setAuthenticated, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
