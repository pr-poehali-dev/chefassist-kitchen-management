import { useState, useEffect } from 'react';

const DATA_API_URL = 'https://functions.poehali.dev/07fa36e8-8d59-4ce4-b56e-49f4fb6241af';

export interface TTK {
  id: number;
  restaurant_id: number;
  name: string;
  category: string;
  output: number;
  ingredients: string;
  tech: string;
  created_at: string;
}

export interface ChecklistItem {
  id: number;
  checklist_id: number;
  text: string;
  status: string;
  timestamp?: string;
  item_order: number;
}

export interface Checklist {
  id: number;
  restaurant_id: number;
  name: string;
  workshop: string;
  responsible?: string;
  completed_date?: string;
  created_at: string;
  items: ChecklistItem[];
}

export const useRestaurantData = (restaurantId: number | undefined) => {
  const [ttkList, setTtkList] = useState<TTK[]>([]);
  const [checklistList, setChecklistList] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTTK = async () => {
    if (!restaurantId) return;
    
    try {
      const response = await fetch(`${DATA_API_URL}?action=get_ttk&restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setTtkList(data.ttk || []);
      } else {
        console.error('Failed to load TTK:', response.status);
        setTtkList([]);
      }
    } catch (error) {
      console.error('Error loading TTK:', error);
      setTtkList([]);
    }
  };

  const loadChecklists = async () => {
    if (!restaurantId) return;
    
    try {
      const response = await fetch(`${DATA_API_URL}?action=get_checklists&restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setChecklistList(data.checklists || []);
      } else {
        console.error('Failed to load checklists:', response.status);
        setChecklistList([]);
      }
    } catch (error) {
      console.error('Error loading checklists:', error);
      setChecklistList([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadTTK(), loadChecklists()]);
      setLoading(false);
    };
    
    if (restaurantId) {
      loadData();
    }
  }, [restaurantId]);

  const createTTK = async (ttk: Omit<TTK, 'id' | 'created_at' | 'restaurant_id'>) => {
    if (!restaurantId) return null;
    
    try {
      const response = await fetch(`${DATA_API_URL}?action=create_ttk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ttk, restaurantId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setTtkList(prev => [...prev, data.ttk]);
        return data.ttk;
      }
    } catch (error) {
      console.error('Error creating TTK:', error);
    }
    return null;
  };

  const updateTTK = async (ttk: Partial<TTK> & { id: number }) => {
    try {
      const response = await fetch(`${DATA_API_URL}?action=update_ttk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ttk)
      });
      
      if (response.ok) {
        setTtkList(prev => prev.map(t => t.id === ttk.id ? { ...t, ...ttk } : t));
        return true;
      }
    } catch (error) {
      console.error('Error updating TTK:', error);
    }
    return false;
  };

  const deleteTTK = async (id: number) => {
    try {
      const response = await fetch(`${DATA_API_URL}?action=delete_ttk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (response.ok) {
        setTtkList(prev => prev.filter(t => t.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting TTK:', error);
    }
    return false;
  };

  const createChecklist = async (checklist: { name: string; workshop: string; responsible?: string; items: { text: string }[] }) => {
    if (!restaurantId) return null;
    
    try {
      const response = await fetch(`${DATA_API_URL}?action=create_checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...checklist, restaurantId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setChecklistList(prev => [...prev, data.checklist]);
        return data.checklist;
      }
    } catch (error) {
      console.error('Error creating checklist:', error);
    }
    return null;
  };

  const updateChecklist = async (checklist: Partial<Checklist> & { id: number }) => {
    try {
      const response = await fetch(`${DATA_API_URL}?action=update_checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checklist)
      });
      
      if (response.ok) {
        setChecklistList(prev => prev.map(c => c.id === checklist.id ? { ...c, ...checklist } : c));
        return true;
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
    return false;
  };

  const deleteChecklist = async (id: number) => {
    try {
      const response = await fetch(`${DATA_API_URL}?action=delete_checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (response.ok) {
        setChecklistList(prev => prev.filter(c => c.id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error deleting checklist:', error);
    }
    return false;
  };

  const updateChecklistItem = async (itemId: number, status: string, timestamp?: string) => {
    try {
      const response = await fetch(`${DATA_API_URL}?action=update_checklist_item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status, timestamp })
      });
      
      if (response.ok) {
        setChecklistList(prev => prev.map(checklist => ({
          ...checklist,
          items: checklist.items.map(item => 
            item.id === itemId ? { ...item, status, timestamp } : item
          )
        })));
        return true;
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
    return false;
  };

  return {
    ttkList,
    checklistList,
    loading,
    createTTK,
    updateTTK,
    deleteTTK,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    updateChecklistItem,
    reload: () => Promise.all([loadTTK(), loadChecklists()])
  };
};