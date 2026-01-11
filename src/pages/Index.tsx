import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/components/AuthContext';
import { useRestaurantData } from '@/hooks/useRestaurantData';
import LoginPage from '@/components/LoginPage';
import TtkTab from '@/components/tabs/TtkTab';
import ChecklistsTab from '@/components/tabs/ChecklistsTab';
import InventoryTab from '@/components/tabs/InventoryTab';
import EmployeesTab from '@/components/tabs/EmployeesTab';
import { OrdersTab, WriteoffTab } from '@/components/tabs/OrdersAndWriteoffTabs';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Index = () => {
  const { user, logout, isChefOrSousChef } = useAuth();
  const {
    ttkList,
    checklistList,
    loading,
    createTTK,
    updateTTK,
    deleteTTK,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    updateChecklistItem
  } = useRestaurantData(user?.restaurantId);

  if (!user) {
    return <LoginPage />;
  }

  if (user.restaurantId && user.restaurantId > 1000000000000) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <Icon name="AlertCircle" size={64} className="mx-auto text-orange-500 mb-4" />
            <h2 className="text-2xl font-bold">Требуется обновление</h2>
            <p className="text-muted-foreground">
              Обнаружены устаревшие данные. Пожалуйста, выйдите и войдите заново.
            </p>
            <Button onClick={() => { logout(); window.location.reload(); }} className="w-full">
              Выйти и обновить
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [activeInventory, setActiveInventory] = useState<any>(() => {
    const saved = localStorage.getItem('kitchenCosmo_activeInventory');
    return saved ? JSON.parse(saved) : null;
  });

  const [inventoryHistory, setInventoryHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('kitchenCosmo_inventoryHistory');
    return saved ? JSON.parse(saved) : [];
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
  const [notifiedIssues, setNotifiedIssues] = useState<Set<string>>(new Set());

  useEffect(() => {
    checklistList.forEach(checklist => {
      checklist.items.forEach((item: any) => {
        const itemKey = `${checklist.id}-${item.id}`;
        if ((item.status === 'in_restriction' || item.status === 'in_stop') && !notifiedIssues.has(itemKey)) {
          const statusText = item.status === 'in_restriction' ? 'В ограничении' : 'В стопе';
          toast.error(`${statusText}: ${item.text}`, {
            description: `Цех: ${checklist.workshop} | Чек-лист: ${checklist.name}`,
            duration: 8000,
          });
          setNotifiedIssues(prev => new Set(prev).add(itemKey));
        }
      });
    });
  }, [checklistList]);

  useEffect(() => {
    const lowStock = mockIngredients.filter(item => item.quantity < item.minStock);
    if (lowStock.length > 0) {
      lowStock.forEach(item => {
        const itemKey = `inventory-${item.id}`;
        if (!notifiedIssues.has(itemKey)) {
          toast.warning(`Низкий остаток: ${item.name}`, {
            description: `Осталось: ${item.quantity}${item.unit}, минимум: ${item.minStock}${item.unit}`,
            duration: 6000,
          });
          setNotifiedIssues(prev => new Set(prev).add(itemKey));
        }
      });
    }
  }, [activeInventory]);

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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        <header className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                KitchenCosmo
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">Система управления профессиональной кухней</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 truncate max-w-[180px] sm:max-w-none">
                {user.role === 'chef' ? 'Шеф-повар' : user.role === 'sous_chef' ? 'Су-шеф' : 'Повар-универсал'}: {user.name}
              </Badge>
              <Button variant="outline" size="icon" className="hover-scale flex-shrink-0">
                <Icon name="Bell" size={18} />
              </Button>
              <Button variant="outline" size="icon" className="hover-scale flex-shrink-0" onClick={logout}>
                <Icon name="LogOut" size={18} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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

            {isChefOrSousChef() && (
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
            )}
          </div>
        </header>

        <Tabs defaultValue="ttk" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 lg:w-auto lg:inline-grid bg-card/50 backdrop-blur-sm gap-1">
            <TabsTrigger value="ttk" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Icon name="FileText" size={16} />
              <span>ТТК</span>
            </TabsTrigger>
            <TabsTrigger value="checklists" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Icon name="CheckSquare" size={16} />
              <span>Чек-листы</span>
            </TabsTrigger>
            {isChefOrSousChef() && (
              <TabsTrigger value="employees" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Icon name="Users" size={16} />
                <span>Сотрудники</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="inventory" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 col-span-3 sm:col-span-1">
              <Icon name="ClipboardList" size={16} />
              <span className="hidden sm:inline">Инвентаризация</span>
              <span className="sm:hidden">Инвент.</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Icon name="ShoppingCart" size={16} />
              <span>Заявки</span>
            </TabsTrigger>
            <TabsTrigger value="writeoff" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Icon name="MinusCircle" size={16} />
              <span>Списание</span>
            </TabsTrigger>
          </TabsList>

          <TtkTab 
            ttkList={ttkList} 
            isChefOrSousChef={isChefOrSousChef}
            onCreateTTK={createTTK}
            onUpdateTTK={updateTTK}
            onDeleteTTK={deleteTTK}
          />

          <ChecklistsTab 
            checklistList={checklistList} 
            isChefOrSousChef={isChefOrSousChef}
            userName={user.name}
            onCreateChecklist={createChecklist}
            onUpdateChecklist={updateChecklist}
            onDeleteChecklist={deleteChecklist}
            onUpdateItem={updateChecklistItem}
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
          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Отчёт по цехам</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6 pt-4">
              {Object.entries(workshopStats).map(([workshop, stats]: [string, any]) => {
                const totalItems = stats.done + stats.inRestriction + stats.inStop + stats.pending;
                const completionRate = totalItems > 0 ? Math.round((stats.done / totalItems) * 100) : 0;
                
                return (
                  <Card key={workshop} className="border-border/50">
                    <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg">{workshop}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">Всего пунктов: {totalItems}</p>
                        </div>
                        <Badge variant={completionRate === 100 ? 'default' : completionRate >= 70 ? 'secondary' : 'destructive'} className="text-xs sm:text-sm">
                          {completionRate}% выполнено
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div 
                          className="p-3 sm:p-4 rounded-lg bg-green-500/10 border border-green-500/20 cursor-pointer hover:bg-green-500/20 transition-all"
                          onClick={() => setExpandedStatus(expandedStatus?.workshop === workshop && expandedStatus?.status === 'done' ? null : { workshop, status: 'done' })}
                        >
                          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                            <Icon name="Check" size={16} className="text-green-600" />
                            <p className="text-xs sm:text-sm font-medium">Готово</p>
                          </div>
                          <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.done}</p>
                        </div>
                        <div 
                          className="p-3 sm:p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-all"
                          onClick={() => setExpandedStatus(expandedStatus?.workshop === workshop && expandedStatus?.status === 'inRestriction' ? null : { workshop, status: 'inRestriction' })}
                        >
                          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                            <Icon name="AlertTriangle" size={16} className="text-orange-600" />
                            <p className="text-xs sm:text-sm font-medium">В ограничении</p>
                          </div>
                          <p className="text-xl sm:text-2xl font-bold text-orange-600">{stats.inRestriction}</p>
                        </div>
                        <div 
                          className="p-3 sm:p-4 rounded-lg bg-destructive/10 border border-destructive/20 cursor-pointer hover:bg-destructive/20 transition-all"
                          onClick={() => setExpandedStatus(expandedStatus?.workshop === workshop && expandedStatus?.status === 'inStop' ? null : { workshop, status: 'inStop' })}
                        >
                          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                            <Icon name="XCircle" size={16} className="text-destructive" />
                            <p className="text-xs sm:text-sm font-medium">В стопе</p>
                          </div>
                          <p className="text-xl sm:text-2xl font-bold text-destructive">{stats.inStop}</p>
                        </div>
                        <div 
                          className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border cursor-pointer hover:bg-muted transition-all"
                          onClick={() => setExpandedStatus(expandedStatus?.workshop === workshop && expandedStatus?.status === 'pending' ? null : { workshop, status: 'pending' })}
                        >
                          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                            <Icon name="Clock" size={16} className="text-muted-foreground" />
                            <p className="text-xs sm:text-sm font-medium">Ожидает</p>
                          </div>
                          <p className="text-xl sm:text-2xl font-bold text-muted-foreground">{stats.pending}</p>
                        </div>
                      </div>
                      {expandedStatus?.workshop === workshop && stats.items && stats.items[expandedStatus.status] && (
                        <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border">
                          <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                            <Icon name="List" size={16} />
                            {expandedStatus.status === 'done' && 'Готовые пункты'}
                            {expandedStatus.status === 'inRestriction' && 'Пункты в ограничении'}
                            {expandedStatus.status === 'inStop' && 'Пункты в стопе'}
                            {expandedStatus.status === 'pending' && 'Пункты в ожидании'}
                          </h4>
                          <div className="space-y-2">
                            {stats.items[expandedStatus.status].map((item: any, idx: number) => (
                              <div key={idx} className="p-2 sm:p-3 rounded-lg bg-background border border-border/50">
                                <p className="text-xs sm:text-sm font-medium">{item.text}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Чек-лист: {item.checklistName}</p>
                                {item.timestamp && (
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">Обновлено: {new Date(item.timestamp).toLocaleString('ru-RU')}</p>
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