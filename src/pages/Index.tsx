import { useState } from 'react';
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
import ProductOrdersTab from '@/components/tabs/ProductOrdersTab';
import { WriteoffTab } from '@/components/tabs/OrdersAndWriteoffTabs';
import { useWorkshopStatistics, WorkshopReportDialog } from '@/components/WorkshopStatistics';
import { useInventoryManagement } from '@/components/InventoryManagement';
import { useOrdersManagement, OrdersDialog } from '@/components/OrdersManagement';

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

  const {
    activeInventory,
    setActiveInventory,
    inventoryHistory,
    setInventoryHistory,
    lowStockItems,
    totalInventoryValue,
    mockIngredients,
    mockOrders
  } = useInventoryManagement();

  const {
    orderStats,
    ordersData,
    showOrdersDialog,
    setShowOrdersDialog,
    selectedOrderStatus,
    setSelectedOrderStatus
  } = useOrdersManagement(user?.restaurantId);

  const {
    showWorkshopReport,
    setShowWorkshopReport,
    expandedStatus,
    setExpandedStatus,
    workshopStats,
    totalIssues
  } = useWorkshopStatistics(checklistList);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <img 
                src="https://cdn.poehali.dev/projects/ca4481ee-9d03-47bf-afcd-998c0128f9ce/files/2f8a5a42-7dbe-437b-9787-b8cd165e8f90.jpg" 
                alt="KitchenCosmo Logo" 
                className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
                  KitchenCosmo
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role === 'chef' ? 'Шеф' : user?.role === 'sous_chef' ? 'Су-шеф' : 'Повар'} • {user?.name}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => { logout(); window.location.reload(); }}>
              <Icon name="LogOut" size={18} />
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-3 py-4 pb-24">

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <Card 
            className="cursor-pointer active:scale-95 transition-all duration-150 border-2" 
            onClick={() => setShowWorkshopReport(true)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="CheckSquare" size={18} className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{Object.keys(workshopStats).length}</p>
                </div>
                <p className="text-xs font-medium text-muted-foreground truncate">Чек-листы</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer active:scale-95 transition-all duration-150 border-2" 
            onClick={() => setShowOrdersDialog(true)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="Package" size={18} className="text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{orderStats.total}</p>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-medium text-muted-foreground truncate">Заявки</p>
                  {orderStats.pending > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 flex-shrink-0">
                      {orderStats.pending}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="checklists" className="w-full">
          <div className="sticky top-[53px] z-40 bg-gradient-to-br from-background via-background to-muted/20 pb-2 pt-1">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-0.5 gap-0.5 scrollbar-hide">
              <TabsTrigger value="checklists" className="flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="CheckSquare" size={14} />
                <span>Чек-листы</span>
              </TabsTrigger>
              <TabsTrigger value="ttk" className="flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="BookOpen" size={14} />
                <span>ТТК</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="Package" size={14} />
                <span>Инвент.</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="ShoppingCart" size={14} />
                <span>Закупки</span>
              </TabsTrigger>
              <TabsTrigger value="writeoffs" className="flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="Trash2" size={14} />
                <span>Списания</span>
              </TabsTrigger>
              {isChefOrSousChef() && (
                <TabsTrigger value="employees" className="flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Icon name="Users" size={14} />
                  <span>Команда</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="mt-2">
            <ChecklistsTab 
              checklistList={checklistList}
              isChefOrSousChef={isChefOrSousChef}
              userName={user?.name || ''}
              onCreateChecklist={createChecklist}
              onUpdateChecklist={updateChecklist}
              onDeleteChecklist={deleteChecklist}
              onUpdateItem={updateChecklistItem}
            />

            <TtkTab 
              ttkList={ttkList}
              isChefOrSousChef={isChefOrSousChef}
              onCreateTTK={createTTK}
              onUpdateTTK={updateTTK}
              onDeleteTTK={deleteTTK}
            />

            <InventoryTab 
              activeInventory={activeInventory}
              setActiveInventory={setActiveInventory}
              inventoryHistory={inventoryHistory}
              setInventoryHistory={setInventoryHistory}
              isChefOrSousChef={isChefOrSousChef}
              userName={user?.name || ''}
              restaurantId={user?.restaurantId}
            />

            <ProductOrdersTab 
              restaurantId={user?.restaurantId} 
              userId={user?.id}
              isChefOrSousChef={isChefOrSousChef}
            />

            <WriteoffTab restaurantId={user?.restaurantId} />

            {isChefOrSousChef() && (
              <EmployeesTab restaurantId={user?.restaurantId} />
            )}
          </div>
        </Tabs>
      </div>

      <WorkshopReportDialog 
        open={showWorkshopReport}
        onOpenChange={setShowWorkshopReport}
        workshopStats={workshopStats}
        expandedStatus={expandedStatus}
        setExpandedStatus={setExpandedStatus}
      />

      <OrdersDialog 
        open={showOrdersDialog}
        onOpenChange={setShowOrdersDialog}
        ordersData={ordersData}
        selectedOrderStatus={selectedOrderStatus}
        setSelectedOrderStatus={setSelectedOrderStatus}
      />
    </div>
  );
};

export default Index;