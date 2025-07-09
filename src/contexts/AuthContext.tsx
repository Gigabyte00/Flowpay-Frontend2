import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: any; // or a more specific type if you have one
  setUser: React.Dispatch<React.SetStateAction<any>>;
}
const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext; 