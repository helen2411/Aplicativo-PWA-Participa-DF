export interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

import { createContext } from 'react';
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
