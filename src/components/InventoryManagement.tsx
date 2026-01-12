import { useState } from 'react';

export const mockIngredients = [
  { id: 1, name: 'Томаты', category: 'Овощи', quantity: 15, unit: 'кг', minStock: 10, price: 120 },
  { id: 2, name: 'Говядина', category: 'Мясо', quantity: 8, unit: 'кг', minStock: 12, price: 650 },
  { id: 3, name: 'Базилик', category: 'Специи', quantity: 0.5, unit: 'кг', minStock: 1, price: 450 },
  { id: 4, name: 'Оливковое масло', category: 'Масла', quantity: 3, unit: 'л', minStock: 5, price: 890 },
  { id: 5, name: 'Лосось', category: 'Рыба', quantity: 6, unit: 'кг', minStock: 8, price: 1200 },
];

export const mockOrders = [
  { id: 1, supplier: 'Мясной двор', status: 'pending', items: 5, total: 12500, date: '2026-01-15' },
  { id: 2, supplier: 'ОвощБаза', status: 'sent', items: 8, total: 4200, date: '2026-01-12' },
  { id: 3, supplier: 'Рыбный мир', status: 'delivered', items: 3, total: 8900, date: '2026-01-10' },
];

export const useInventoryManagement = () => {
  const [activeInventory, setActiveInventory] = useState<any>(() => {
    const saved = localStorage.getItem('kitchenCosmo_activeInventory');
    return saved ? JSON.parse(saved) : null;
  });

  const [inventoryHistory, setInventoryHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('kitchenCosmo_inventoryHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const lowStockItems = mockIngredients.filter(item => item.quantity < item.minStock);
  const totalInventoryValue = mockIngredients.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return {
    activeInventory,
    setActiveInventory,
    inventoryHistory,
    setInventoryHistory,
    lowStockItems,
    totalInventoryValue,
    mockIngredients,
    mockOrders
  };
};
