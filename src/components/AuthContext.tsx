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
    if (!user) return null;
    const allRestaurants = JSON.parse(localStorage.getItem('kitchenCosmo_allRestaurants') || '[]');
    return allRestaurants.find((r: Restaurant) => r.id === user.restaurantId) || null;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const savedEmployees = localStorage.getItem('kitchenCosmo_allEmployees');
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

    const allRestaurants = JSON.parse(localStorage.getItem('kitchenCosmo_allRestaurants') || '[]');
    allRestaurants.push(newRestaurant);
    localStorage.setItem('kitchenCosmo_allRestaurants', JSON.stringify(allRestaurants));

    const allEmployees = JSON.parse(localStorage.getItem('kitchenCosmo_allEmployees') || '[]');
    allEmployees.push(chefEmployee);
    localStorage.setItem('kitchenCosmo_allEmployees', JSON.stringify(allEmployees));

    setRestaurant(newRestaurant);
    setUser(newUser);
    setEmployees(allEmployees);

    localStorage.setItem('kitchenCosmoUser', JSON.stringify(newUser));

    const inviteLink = `${window.location.origin}?invite=${inviteCode}`;
    return { restaurant: newRestaurant, inviteLink };
  };

  const joinRestaurant = (name: string, role: UserRole, inviteCode: string): boolean => {
    const allRestaurants = JSON.parse(localStorage.getItem('kitchenCosmo_allRestaurants') || '[]');
    console.log('🔍 Поиск ресторана по коду:', inviteCode);
    console.log('📋 Все рестораны в localStorage:', allRestaurants);
    const rest = allRestaurants.find((r: Restaurant) => r.inviteCode === inviteCode);
    console.log('✅ Найденный ресторан:', rest);
    
    if (!rest) {
      console.error('❌ Ресторан с кодом', inviteCode, 'не найден');
      return false;
    }

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

    const allEmployees = JSON.parse(localStorage.getItem('kitchenCosmo_allEmployees') || '[]');
    allEmployees.push(newEmployee);
    localStorage.setItem('kitchenCosmo_allEmployees', JSON.stringify(allEmployees));

    setUser(newUser);
    setRestaurant(rest);
    setEmployees(allEmployees);

    localStorage.setItem('kitchenCosmoUser', JSON.stringify(newUser));

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
    const allEmployees = JSON.parse(localStorage.getItem('kitchenCosmo_allEmployees') || '[]');
    const updated = allEmployees.map((emp: Employee) => 
      emp.id === employeeId ? { ...emp, role: newRole } : emp
    );
    setEmployees(updated);
    localStorage.setItem('kitchenCosmo_allEmployees', JSON.stringify(updated));

    if (user?.id === employeeId) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('kitchenCosmoUser', JSON.stringify(updatedUser));
    }
  };

  const removeEmployee = (employeeId: string) => {
    const allEmployees = JSON.parse(localStorage.getItem('kitchenCosmo_allEmployees') || '[]');
    const updated = allEmployees.filter((emp: Employee) => emp.id !== employeeId);
    setEmployees(updated);
    localStorage.setItem('kitchenCosmo_allEmployees', JSON.stringify(updated));
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