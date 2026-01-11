import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/components/AuthContext';
import LoginPage from '@/components/LoginPage';
import TtkTab from '@/components/tabs/TtkTab';
import ChecklistsTab from '@/components/tabs/ChecklistsTab';
import InventoryTab from '@/components/tabs/InventoryTab';
import { OrdersTab, WriteoffTab } from '@/components/tabs/OrdersAndWriteoffTabs';

const Index = () => {
  const { user, logout, isChefOrSousChef } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  const [ttkList, setTtkList] = useState(() => {
    const saved = localStorage.getItem('kitchenCosmo_ttk');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Стейк с овощами гриль', category: 'Основные блюда', output: 300, ingredients: 'Говядина - 300г\nТрюфельное масло - 10мл', tech: 'Разогреть сковороду...' },
      { id: 2, name: 'Паста Карбонара', category: 'Паста', output: 350, ingredients: 'Паста - 250г\nСливки - 100мл', tech: 'Отварить пасту...' },
    ];
  });

  const [activeInventory, setActiveInventory] = useState<any>(() => {
    const saved = localStorage.getItem('kitchenCosmo_activeInventory');
    return saved ? JSON.parse(saved) : null;
  });

  const [inventoryHistory, setInventoryHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('kitchenCosmo_inventoryHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [checklistList, setChecklistList] = useState(() => {
    const saved = localStorage.getItem('kitchenCosmo_checklists');
    return saved ? JSON.parse(saved) : [
      { 
        id: 1, 
        name: 'Открытие горячего цеха', 
        workshop: 'Горячий цех',
        items: [
          { text: 'Проверить температуру плит', status: 'done' },
          { text: 'Проверить чистоту рабочих поверхностей', status: 'done' },
          { text: 'Проверить наличие инвентаря', status: 'in_stop' },
        ]
      },
    ];
  });

  const mockIngredients = [
    { id: 1, name: 'Томаты', category: 'Овощи', quantity: 15, unit: 'кг', minStock: 10, price: 120 },
    { id: 2, name: 'Говядина', category: 'Мясо', quantity: 8, unit: 'кг', minStock: 12, price: 650 },
    { id: 3, name: 'Базилик', category: 'Специи', quantity: 0.5, unit: 'кг', minStock: 1, price: 450 },
    { id: 4, name: 'Оливковое масло', category: 'Масла', quantity: 3, unit: 'л', minStock: 5, price: 890 },
    { id: 5, name: 'Лосось', category: 'Рыба', quantity: 6, unit: 'кг', minStock: 8, price: 1200 },
  ];

  const mockOrders = [
    { id: 1, supplier: 'Мясной двор', status: 'pending', items: 5, total: 12500, date: '2026-01-15' },
    { id: 2, supplier: 'ОвощБаза', status: 'sent', items: 8, total: 4200, date: '2026-01-12' },
    { id: 3, supplier: 'Рыбный мир', status: 'delivered', items: 3, total: 8900, date: '2026-01-10' },
  ];

  const lowStockItems = mockIngredients.filter(item => item.quantity < item.minStock);
  const totalInventoryValue = mockIngredients.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                KitchenCosmo
              </h1>
              <p className="text-muted-foreground mt-1">Система управления профессиональной кухней</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {user.role === 'chef' ? 'Шеф-повар' : user.role === 'sous_chef' ? 'Су-шеф' : 'Повар-универсал'}: {user.name}
              </Badge>
              <Button variant="outline" size="icon" className="hover-scale">
                <Icon name="Bell" size={20} />
              </Button>
              <Button variant="outline" size="icon" className="hover-scale" onClick={logout}>
                <Icon name="LogOut" size={20} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Активные заявки</p>
                    <p className="text-3xl font-bold text-primary">{mockOrders.filter(o => o.status !== 'delivered').length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="ShoppingCart" size={24} className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 hover:border-destructive/40 transition-all hover:shadow-lg hover:shadow-destructive/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Низкий остаток</p>
                    <p className="text-3xl font-bold text-destructive">{lowStockItems.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Icon name="AlertTriangle" size={24} className="text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 hover:border-secondary/40 transition-all hover:shadow-lg hover:shadow-secondary/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Стоимость склада</p>
                    <p className="text-3xl font-bold text-secondary">{totalInventoryValue.toLocaleString()} ₽</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Icon name="TrendingUp" size={24} className="text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        <Tabs defaultValue="ttk" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="ttk" className="gap-2">
              <Icon name="FileText" size={18} />
              <span className="hidden sm:inline">ТТК</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Icon name="ClipboardList" size={18} />
              <span className="hidden sm:inline">Инвентаризация</span>
            </TabsTrigger>
            <TabsTrigger value="checklists" className="gap-2">
              <Icon name="CheckSquare" size={18} />
              <span className="hidden sm:inline">Чек-листы</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Icon name="ShoppingCart" size={18} />
              <span className="hidden sm:inline">Заявки</span>
            </TabsTrigger>
            <TabsTrigger value="writeoff" className="gap-2">
              <Icon name="MinusCircle" size={18} />
              <span className="hidden sm:inline">Списание</span>
            </TabsTrigger>
          </TabsList>

          <TtkTab 
            ttkList={ttkList} 
            setTtkList={setTtkList} 
            isChefOrSousChef={isChefOrSousChef} 
          />

          <ChecklistsTab 
            checklistList={checklistList} 
            setChecklistList={setChecklistList} 
            isChefOrSousChef={isChefOrSousChef} 
          />

          <InventoryTab 
            activeInventory={activeInventory} 
            setActiveInventory={setActiveInventory} 
            inventoryHistory={inventoryHistory} 
            setInventoryHistory={setInventoryHistory} 
            isChefOrSousChef={isChefOrSousChef} 
            userName={user.name} 
          />

          <OrdersTab />
          
          <WriteoffTab />
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
