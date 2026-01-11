import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type UserRole = 'chef' | 'sous_chef' | 'cook';

const API_URL = 'https://functions.poehali.dev/a5fa1696-9db4-42e2-95a7-573d876feb30';

interface Restaurant {
  id: number;
  name: string;
  created_by: string;
  invite_code: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  role: UserRole;
  restaurantId: number;
  restaurantName: string;
}

interface Employee {
  id: number;
  name: string;
  role: UserRole;
  restaurant_id: number;
  joined_at: string;
}

interface AuthContextType {
  user: User | null;
  restaurant: Restaurant | null;
  employees: Employee[];
  login: (name: string, role: UserRole, restaurantId: number, restaurantName: string) => void;
  logout: () => void;
  isChefOrSousChef: () => boolean;
  createRestaurant: (chefName: string, restaurantName: string) => Promise<{ restaurant: Restaurant; inviteLink: string }>;
  joinRestaurant: (name: string, role: UserRole, inviteCode: string) => Promise<boolean>;
  getEmployees: () => Promise<Employee[]>;
  updateEmployeeRole: (employeeId: number, newRole: UserRole) => Promise<void>;
  removeEmployee: (employeeId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('kitchenCosmoUser');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.restaurantId && parsed.restaurantId > 1000000000000) {
        console.warn('⚠️ Detected old localStorage data, clearing...');
        localStorage.removeItem('kitchenCosmoUser');
        localStorage.removeItem('kitchenCosmo_allRestaurants');
        localStorage.removeItem('kitchenCosmo_allEmployees');
        return null;
      }
      return parsed;
    }
    return null;
  });

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (user) {
      loadEmployees();
    }
  }, [user?.restaurantId]);

  const createRestaurant = async (chefName: string, restaurantName: string) => {
    const response = await fetch(`${API_URL}?action=create_restaurant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chefName, restaurantName })
    });

    if (!response.ok) {
      throw new Error('Failed to create restaurant');
    }

    const data = await response.json();
    const rest = data.restaurant;
    const emp = data.employee;

    const newUser: User = {
      id: emp.id,
      name: chefName,
      role: 'chef',
      restaurantId: rest.id,
      restaurantName: rest.name
    };

    setRestaurant(rest);
    setUser(newUser);
    localStorage.setItem('kitchenCosmoUser', JSON.stringify(newUser));

    const inviteLink = `${window.location.origin}?invite=${rest.invite_code}`;
    return { restaurant: rest, inviteLink };
  };

  const joinRestaurant = async (name: string, role: UserRole, inviteCode: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}?action=join_restaurant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, inviteCode })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      const rest = data.restaurant;
      const emp = data.employee;

      const newUser: User = {
        id: emp.id,
        name,
        role,
        restaurantId: rest.id,
        restaurantName: rest.name
      };

      setUser(newUser);
      setRestaurant(rest);
      localStorage.setItem('kitchenCosmoUser', JSON.stringify(newUser));

      return true;
    } catch (error) {
      console.error('Join restaurant error:', error);
      return false;
    }
  };

  const login = (name: string, role: UserRole, restaurantId: number, restaurantName: string) => {
    const newUser: User = { id: Date.now(), name, role, restaurantId, restaurantName };
    setUser(newUser);
    localStorage.setItem('kitchenCosmoUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setRestaurant(null);
    setEmployees([]);
    localStorage.removeItem('kitchenCosmoUser');
  };

  const isChefOrSousChef = () => {
    return user?.role === 'chef' || user?.role === 'sous_chef';
  };

  const loadEmployees = async () => {
    if (!user?.restaurantId) return;
    
    try {
      const response = await fetch(`${API_URL}?action=get_employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: user.restaurantId })
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Load employees error:', error);
    }
  };

  const getEmployees = async (): Promise<Employee[]> => {
    await loadEmployees();
    return employees;
  };

  const updateEmployeeRole = async (employeeId: number, newRole: UserRole) => {
    try {
      const response = await fetch(`${API_URL}?action=update_employee_role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, newRole })
      });

      if (response.ok) {
        await loadEmployees();
        
        if (user?.id === employeeId) {
          const updatedUser = { ...user, role: newRole };
          setUser(updatedUser);
          localStorage.setItem('kitchenCosmoUser', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Update employee role error:', error);
    }
  };

  const removeEmployee = async (employeeId: number) => {
    try {
      const response = await fetch(`${API_URL}?action=remove_employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });

      if (response.ok) {
        await loadEmployees();
      }
    } catch (error) {
      console.error('Remove employee error:', error);
    }
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