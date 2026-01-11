import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'chef' | 'sous_chef' | 'cook';

interface Restaurant {
  id: string;
  name: string;
  createdBy: string;
  inviteCode: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  role: UserRole;
  restaurantId: string;
  restaurantName: string;
}

interface Employee {
  id: string;
  name: string;
  role: UserRole;
  restaurantId: string;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  restaurant: Restaurant | null;
  employees: Employee[];
  login: (name: string, role: UserRole, restaurantId: string, restaurantName: string) => void;
  logout: () => void;
  isChefOrSousChef: () => boolean;
  createRestaurant: (chefName: string, restaurantName: string) => { restaurant: Restaurant; inviteLink: string };
  joinRestaurant: (name: string, role: UserRole, inviteCode: string) => boolean;
  getEmployees: () => Employee[];
  updateEmployeeRole: (employeeId: string, newRole: UserRole) => void;
  removeEmployee: (employeeId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('kitchenCosmoUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [restaurant, setRestaurant] = useState<Restaurant | null>(() => {
    const savedRestaurant = localStorage.getItem('kitchenCosmoRestaurant');
    return savedRestaurant ? JSON.parse(savedRestaurant) : null;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const savedEmployees = localStorage.getItem('kitchenCosmoEmployees');
    return savedEmployees ? JSON.parse(savedEmployees) : [];
  });

  const createRestaurant = (chefName: string, restaurantName: string) => {
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const newRestaurant: Restaurant = {
      id: Date.now().toString(),
      name: restaurantName,
      createdBy: chefName,
      inviteCode,
      createdAt: new Date().toISOString()
    };
    
    const newUser: User = {
      id: Date.now().toString(),
      name: chefName,
      role: 'chef',
      restaurantId: newRestaurant.id,
      restaurantName: restaurantName
    };

    const chefEmployee: Employee = {
      id: newUser.id,
      name: chefName,
      role: 'chef',
      restaurantId: newRestaurant.id,
      joinedAt: new Date().toISOString()
    };

    setRestaurant(newRestaurant);
    setUser(newUser);
    setEmployees([chefEmployee]);

    localStorage.setItem('kitchenCosmoRestaurant', JSON.stringify(newRestaurant));
    localStorage.setItem('kitchenCosmoUser', JSON.stringify(newUser));
    localStorage.setItem('kitchenCosmoEmployees', JSON.stringify([chefEmployee]));

    const inviteLink = `${window.location.origin}?invite=${inviteCode}`;
    return { restaurant: newRestaurant, inviteLink };
  };

  const joinRestaurant = (name: string, role: UserRole, inviteCode: string): boolean => {
    const savedRestaurant = localStorage.getItem('kitchenCosmoRestaurant');
    if (!savedRestaurant) return false;

    const rest: Restaurant = JSON.parse(savedRestaurant);
    if (rest.inviteCode !== inviteCode) return false;

    const newUser: User = {
      id: Date.now().toString(),
      name,
      role,
      restaurantId: rest.id,
      restaurantName: rest.name
    };

    const newEmployee: Employee = {
      id: newUser.id,
      name,
      role,
      restaurantId: rest.id,
      joinedAt: new Date().toISOString()
    };

    const currentEmployees = JSON.parse(localStorage.getItem('kitchenCosmoEmployees') || '[]');
    const updatedEmployees = [...currentEmployees, newEmployee];

    setUser(newUser);
    setRestaurant(rest);
    setEmployees(updatedEmployees);

    localStorage.setItem('kitchenCosmoUser', JSON.stringify(newUser));
    localStorage.setItem('kitchenCosmoEmployees', JSON.stringify(updatedEmployees));

    return true;
  };

  const login = (name: string, role: UserRole, restaurantId: string, restaurantName: string) => {
    const newUser: User = { id: Date.now().toString(), name, role, restaurantId, restaurantName };
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

  const getEmployees = (): Employee[] => {
    if (!user?.restaurantId) return [];
    return employees.filter(emp => emp.restaurantId === user.restaurantId);
  };

  const updateEmployeeRole = (employeeId: string, newRole: UserRole) => {
    const updated = employees.map(emp => 
      emp.id === employeeId ? { ...emp, role: newRole } : emp
    );
    setEmployees(updated);
    localStorage.setItem('kitchenCosmoEmployees', JSON.stringify(updated));

    if (user?.id === employeeId) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('kitchenCosmoUser', JSON.stringify(updatedUser));
    }
  };

  const removeEmployee = (employeeId: string) => {
    const updated = employees.filter(emp => emp.id !== employeeId);
    setEmployees(updated);
    localStorage.setItem('kitchenCosmoEmployees', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      restaurant, 
      employees,
      login, 
      logout, 
      isChefOrSousChef,
      createRestaurant,
      joinRestaurant,
      getEmployees,
      updateEmployeeRole,
      removeEmployee
    }}>
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