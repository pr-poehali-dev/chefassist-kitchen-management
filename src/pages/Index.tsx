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
import EmployeesTab from '@/components/tabs/EmployeesTab';
import { OrdersTab, WriteoffTab } from '@/components/tabs/OrdersAndWriteoffTabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    const lastResetDate = localStorage.getItem('kitchenCosmo_lastChecklistReset');
    const today = new Date().toISOString().split('T')[0];
    
    if (saved) {
      const checklists = JSON.parse(saved);
      
      if (lastResetDate !== today) {
        const resetChecklists = checklists.map((cl: any) => ({
          ...cl,
          items: cl.items.map((item: any) => ({ ...item, status: 'pending', timestamp: undefined }))
        }));
        localStorage.setItem('kitchenCosmo_checklists', JSON.stringify(resetChecklists));
        localStorage.setItem('kitchenCosmo_lastChecklistReset', today);
        return resetChecklists;
      }
      
      return checklists;
    }
    
    localStorage.setItem('kitchenCosmo_lastChecklistReset', today);
    return [];
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

  const [showWorkshopReport, setShowWorkshopReport] = useState(false);
  const [expandedStatus, setExpandedStatus] = useState<{workshop: string, status: string} | null>(null);

  const lowStockItems = mockIngredients.filter(item => item.quantity < item.minStock);
  const totalInventoryValue = mockIngredients.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const getWorkshopStats = () => {
    const stats: any = {};
    checklistList.forEach(cl => {
      if (!stats[cl.workshop]) {
        stats[cl.workshop] = { 
          done: 0, 
          inRestriction: 0, 
          inStop: 0, 
          pending: 0,
          items: { done: [], inRestriction: [], inStop: [], pending: [] }
        };
      }
      cl.items.forEach((item: any) => {
        const itemWithChecklist = { ...item, checklistName: cl.name };
        if (item.status === 'done') {
          stats[cl.workshop].done++;
          stats[cl.workshop].items.done.push(itemWithChecklist);
        } else if (item.status === 'in_restriction') {
          stats[cl.workshop].inRestriction++;
          stats[cl.workshop].items.inRestriction.push(itemWithChecklist);
        } else if (item.status === 'in_stop') {
          stats[cl.workshop].inStop++;
          stats[cl.workshop].items.inStop.push(itemWithChecklist);
        } else {
          stats[cl.workshop].pending++;
          stats[cl.workshop].items.pending.push(itemWithChecklist);
        }
      });
    });
    return stats;
  };

  const workshopStats = getWorkshopStats();
  const totalIssues = Object.values(workshopStats).reduce((sum: number, ws: any) => 
    sum + ws.inRestriction + ws.inStop, 0
  );

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

            <Card 
              className="border-secondary/20 hover:border-secondary/40 transition-all hover:shadow-lg hover:shadow-secondary/10 cursor-pointer"
              onClick={() => setShowWorkshopReport(true)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Отчёты по цехам</p>
                    <p className="text-3xl font-bold text-secondary">{totalIssues}</p>
                    <p className="text-xs text-muted-foreground mt-1">проблем выявлено</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Icon name="BarChart" size={24} className="text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        <Tabs defaultValue="ttk" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid bg-card/50 backdrop-blur-sm">
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
            {isChefOrSousChef() && (
              <TabsTrigger value="employees" className="gap-2">
                <Icon name="Users" size={18} />
                <span className="hidden sm:inline">Сотрудники</span>
              </TabsTrigger>
            )}
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
            userName={user.name}
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

          {isChefOrSousChef() && <EmployeesTab />}
        </Tabs>

        <Dialog 
          open={showWorkshopReport} 
          onOpenChange={(open) => {
            setShowWorkshopReport(open);
            if (!open) setExpandedStatus(null);
          }}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Отчёт по цехам</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {Object.entries(workshopStats).map(([workshop, stats]: [string, any]) => {
                const totalItems = stats.done + stats.inRestriction + stats.inStop + stats.pending;
                const completionRate = totalItems > 0 ? Math.round((stats.done / totalItems) * 100) : 0;
                
                return (
                  <Card key={workshop} className="border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{workshop}</h3>
                          <p className="text-sm text-muted-foreground">Всего пунктов: {totalItems}</p>
                        </div>
                        <Badge variant={completionRate === 100 ? 'default' : completionRate >= 70 ? 'secondary' : 'destructive'}>
                          {completionRate}% выполнено
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div 
                          className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 cursor-pointer hover:bg-green-500/20 transition-all"
                          onClick={() => setExpandedStatus(expandedStatus?.workshop === workshop && expandedStatus?.status === 'done' ? null : { workshop, status: 'done' })}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="Check" size={18} className="text-green-600" />
                            <p className="text-sm font-medium">Готово</p>
                          </div>
                          <p className="text-2xl font-bold text-green-600">{stats.done}</p>
                        </div>
                        <div 
                          className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-all"
                          onClick={() => setExpandedStatus(expandedStatus?.workshop === workshop && expandedStatus?.status === 'inRestriction' ? null : { workshop, status: 'inRestriction' })}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="AlertTriangle" size={18} className="text-orange-600" />
                            <p className="text-sm font-medium">В ограничении</p>
                          </div>
                          <p className="text-2xl font-bold text-orange-600">{stats.inRestriction}</p>
                        </div>
                        <div 
                          className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 cursor-pointer hover:bg-destructive/20 transition-all"
                          onClick={() => setExpandedStatus(expandedStatus?.workshop === workshop && expandedStatus?.status === 'inStop' ? null : { workshop, status: 'inStop' })}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="XCircle" size={18} className="text-destructive" />
                            <p className="text-sm font-medium">В стопе</p>
                          </div>
                          <p className="text-2xl font-bold text-destructive">{stats.inStop}</p>
                        </div>
                        <div 
                          className="p-4 rounded-lg bg-muted/50 border border-border cursor-pointer hover:bg-muted transition-all"
                          onClick={() => setExpandedStatus(expandedStatus?.workshop === workshop && expandedStatus?.status === 'pending' ? null : { workshop, status: 'pending' })}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="Clock" size={18} className="text-muted-foreground" />
                            <p className="text-sm font-medium">Ожидает</p>
                          </div>
                          <p className="text-2xl font-bold text-muted-foreground">{stats.pending}</p>
                        </div>
                      </div>
                      {expandedStatus?.workshop === workshop && stats.items && stats.items[expandedStatus.status] && (
                        <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Icon name="List" size={18} />
                            {expandedStatus.status === 'done' && 'Готовые пункты'}
                            {expandedStatus.status === 'inRestriction' && 'Пункты в ограничении'}
                            {expandedStatus.status === 'inStop' && 'Пункты в стопе'}
                            {expandedStatus.status === 'pending' && 'Пункты в ожидании'}
                          </h4>
                          <div className="space-y-2">
                            {stats.items[expandedStatus.status].map((item: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-lg bg-background border border-border/50">
                                <p className="text-sm font-medium">{item.text}</p>
                                <p className="text-xs text-muted-foreground mt-1">Чек-лист: {item.checklistName}</p>
                                {item.timestamp && (
                                  <p className="text-xs text-muted-foreground">Обновлено: {new Date(item.timestamp).toLocaleString('ru-RU')}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {Object.keys(workshopStats).length === 0 && (
                <div className="text-center py-12">
                  <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет данных по чек-листам</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;