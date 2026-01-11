import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'chef' | 'sous_chef' | 'cook';

interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (name: string, role: UserRole) => void;
  logout: () => void;
  isChefOrSousChef: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('kitchenCosmoUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (name: string, role: UserRole) => {
    const newUser = { id: Date.now().toString(), name, role };
    setUser(newUser);
    localStorage.setItem('kitchenCosmoUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kitchenCosmoUser');
  };

  const isChefOrSousChef = () => {
    return user?.role === 'chef' || user?.role === 'sous_chef';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isChefOrSousChef }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
