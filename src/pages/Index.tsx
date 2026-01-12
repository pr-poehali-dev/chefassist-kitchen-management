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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 safe-top safe-bottom">
      <div className="max-w-7xl mx-auto p-4 pb-24">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://cdn.poehali.dev/projects/ca4481ee-9d03-47bf-afcd-998c0128f9ce/files/2f8a5a42-7dbe-437b-9787-b8cd165e8f90.jpg" 
              alt="KitchenCosmo Logo" 
              className="h-12 w-12 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                KitchenCosmo
              </h1>
              <p className="text-sm text-muted-foreground">
                {user?.role === 'chef' ? '👨‍🍳 Шеф-повар' : user?.role === 'sous_chef' ? '👨‍🍳 Су-шеф' : '👨‍🍳 Повар'} • {user?.name}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => { logout(); window.location.reload(); }}>
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowWorkshopReport(true)}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Цехи</p>
                  <p className="text-2xl font-bold">{Object.keys(workshopStats).length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Icon name="Factory" size={24} className="text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowWorkshopReport(true)}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Проблемы</p>
                  <p className="text-2xl font-bold">{totalIssues}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                  <Icon name="AlertCircle" size={24} className="text-red-500" />
                </div>
              </div>
              {totalIssues > 0 && (
                <Badge variant="destructive" className="mt-2">
                  Требуется внимание
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowOrdersDialog(true)}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Заявки</p>
                  <p className="text-2xl font-bold">{orderStats.total}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Icon name="Package" size={24} className="text-green-500" />
                </div>
              </div>
              {orderStats.pending > 0 && (
                <Badge variant="outline" className="mt-2">
                  {orderStats.pending} ожидает
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Склад</p>
                  <p className="text-2xl font-bold">{totalInventoryValue.toLocaleString()}₽</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <Icon name="Warehouse" size={24} className="text-orange-500" />
                </div>
              </div>
              {lowStockItems.length > 0 && (
                <Badge variant="outline" className="mt-2 border-orange-500 text-orange-500">
                  {lowStockItems.length} на исходе
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="checklists" className="w-full">
          <div className="sticky top-0 z-10 bg-gradient-to-br from-background via-background to-muted/20 pb-4 safe-top">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1">
              <TabsTrigger value="checklists" className="flex items-center gap-2 whitespace-nowrap touch-target">
                <Icon name="CheckSquare" size={18} />
                <span className="hidden sm:inline">Чек-листы</span>
                <span className="sm:hidden">Чек-л.</span>
              </TabsTrigger>
              <TabsTrigger value="ttk" className="flex items-center gap-2 whitespace-nowrap touch-target">
                <Icon name="BookOpen" size={18} />
                <span className="hidden sm:inline">ТТК</span>
                <span className="sm:hidden">ТТК</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2 whitespace-nowrap touch-target">
                <Icon name="Package" size={18} />
                <span className="hidden sm:inline">Инвентаризация</span>
                <span className="sm:hidden">Инвент.</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2 whitespace-nowrap touch-target">
                <Icon name="ShoppingCart" size={18} />
                <span className="hidden sm:inline">Заявки на закупку</span>
                <span className="sm:hidden">Закупки</span>
              </TabsTrigger>
              <TabsTrigger value="writeoffs" className="flex items-center gap-2 whitespace-nowrap touch-target">
                <Icon name="Trash2" size={18} />
                <span className="hidden sm:inline">Списания</span>
                <span className="sm:hidden">Списан.</span>
              </TabsTrigger>
              {isChefOrSousChef() && (
                <TabsTrigger value="employees" className="flex items-center gap-2 whitespace-nowrap touch-target">
                  <Icon name="Users" size={18} />
                  <span className="hidden sm:inline">Сотрудники</span>
                  <span className="sm:hidden">Сотруд.</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="mt-6">
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
              onCreateTTK={createTTK}
              onUpdateTTK={updateTTK}
              onDeleteTTK={deleteTTK}
              loading={loading}
            />

            <InventoryTab 
              activeInventory={activeInventory}
              setActiveInventory={setActiveInventory}
              inventoryHistory={inventoryHistory}
              setInventoryHistory={setInventoryHistory}
              isChefOrSousChef={isChefOrSousChef}
              userName={user?.name || ''}
            />

            <ProductOrdersTab restaurantId={user?.restaurantId} />

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