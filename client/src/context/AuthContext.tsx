import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { DemoSessionUser, UserRole } from '../../shared/types/network.ts';
import { ROLE_DEMO_PERSONAS } from '../data/demoPortalData.ts';

interface AuthContextType {
  user: DemoSessionUser | null;
  isAuthenticated: boolean;
  login: (role: UserRole, email?: string, password?: string) => Promise<boolean>;
  logout: () => void;
  requireAuth: (requiredRoles?: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoSessionUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('blood-network-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        sessionStorage.removeItem('blood-network-user');
      }
    }
    setIsInitialized(true);
  }, []);

  const login = async (role: UserRole, _email?: string, _password?: string): Promise<boolean> => {
    const persona = ROLE_DEMO_PERSONAS[role];
    if (persona) {
      setUser(persona);
      sessionStorage.setItem('blood-network-user', JSON.stringify(persona));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('blood-network-user');
  };

  const requireAuth = (requiredRoles?: UserRole[]): boolean => {
    if (!user) return false;
    if (requiredRoles && !requiredRoles.includes(user.role)) return false;
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, requireAuth }}>
      {isInitialized && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };