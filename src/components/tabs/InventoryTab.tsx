import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import * as XLSX from 'xlsx';
import CreateInventoryDialog from './inventory/CreateInventoryDialog';
import CookInventoryView from './inventory/CookInventoryView';
import ChefInventoryView from './inventory/ChefInventoryView';
import InventoryHistoryView from './inventory/InventoryHistoryView';

interface InventoryTabProps {
  activeInventory: any;
  setActiveInventory: (inv: any) => void;
  inventoryHistory: any[];
  setInventoryHistory: (history: any[]) => void;
  isChefOrSousChef: () => boolean;
  userName: string;
}

export default function InventoryTab({ 
  activeInventory, 
  setActiveInventory, 
  inventoryHistory, 
  setInventoryHistory,
  isChefOrSousChef,
  userName
}: InventoryTabProps) {
  const [inventoryProducts, setInventoryProducts] = useState<string>('');
  const [inventorySemis, setInventorySemis] = useState<string>('');
  const [inventoryDate, setInventoryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewInventoryReport, setViewInventoryReport] = useState<any>(null);
  const [tempQuantities, setTempQuantities] = useState<{[key: number]: string}>({});

  const handleStartInventory = () => {
    if (!inventoryProducts.trim() && !inventorySemis.trim()) return;
    const products = inventoryProducts.split('\n').filter(p => p.trim()).map(p => ({ 
      name: p.trim(),
      type: 'product',
      entries: []
    }));
    const semis = inventorySemis.split('\n').filter(p => p.trim()).map(p => ({ 
      name: p.trim(),
      type: 'semi',
      entries: []
    }));
    const inventory = {
      id: Date.now(),
      name: `Инвентаризация ${new Date(inventoryDate).toLocaleDateString()}`,
      date: inventoryDate,
      responsible: userName,
      products: [...products, ...semis],
      status: 'in_progress'
    };
    setActiveInventory(inventory);
    localStorage.setItem('kitchenCosmo_activeInventory', JSON.stringify(inventory));
    setInventoryProducts('');
    setInventorySemis('');
    setInventoryDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteInventory = () => {
    setActiveInventory(null);
    localStorage.removeItem('kitchenCosmo_activeInventory');
  };

  const handleCopyLastInventory = () => {
    if (inventoryHistory.length === 0) return;
    const last = inventoryHistory[inventoryHistory.length - 1];
    const productNames = last.products.map((p: any) => p.name).join('\n');
    setInventoryProducts(productNames);
  };

  const handleCopyFromHistory = (inv: any) => {
    const products = inv.products.filter((p: any) => p.type === 'product').map((p: any) => p.name).join('\n');
    const semis = inv.products.filter((p: any) => p.type === 'semi').map((p: any) => p.name).join('\n');
    setInventoryProducts(products);
    setInventorySemis(semis);
    setInventoryDate(inv.date);
  };

  const handleDeleteFromHistory = (invId: number) => {
    const updated = inventoryHistory.filter((inv: any) => inv.id !== invId);
    setInventoryHistory(updated);
    localStorage.setItem('kitchenCosmo_inventoryHistory', JSON.stringify(updated));
  };

  const handleExportToExcel = (inventory: any) => {
    const data = inventory.products.map((product: any, idx: number) => {
      const totalQuantity = product.entries && product.entries.length > 0 
        ? product.entries.reduce((sum: number, e: any) => sum + e.quantity, 0)
        : 0;
      const uniqueUsers = product.entries 
        ? [...new Set(product.entries.map((e: any) => e.user))]
        : [];
      
      return {
        '№': idx + 1,
        'Наименование': product.name,
        'Тип': product.type === 'semi' ? 'Полуфабрикат' : 'Продукт',
        'Количество (г)': totalQuantity || 0,
        'Внесли данные': uniqueUsers.join(', ') || 'Не внесено',
        'Записей': product.entries ? product.entries.length : 0
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Инвентаризация');

    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 30 },
      { wch: 10 }
    ];

    const fileName = `Инвентаризация_${new Date(inventory.date).toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleSubmitEntry = (productIndex: number, quantity: number) => {
    if (!activeInventory || quantity < 0) return;
    const updated = {...activeInventory};
    const product = updated.products[productIndex];
    
    if (!product.entries) product.entries = [];
    product.entries.push({ user: userName, quantity });
    
    setActiveInventory(updated);
    localStorage.setItem('kitchenCosmo_activeInventory', JSON.stringify(updated));
  };

  const getUserPendingProducts = () => {
    if (!activeInventory) return [];
    return activeInventory.products.filter((p: any) => {
      if (!p.entries || p.entries.length === 0) return true;
      return !p.entries.some((e: any) => e.user === userName);
    });
  };

  const handleCompleteInventory = () => {
    if (!activeInventory) return;
    const completed = {
      ...activeInventory,
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0]
    };
    const updatedHistory = [...inventoryHistory, completed];
    setInventoryHistory(updatedHistory);
    localStorage.setItem('kitchenCosmo_inventoryHistory', JSON.stringify(updatedHistory));
    setActiveInventory(null);
    localStorage.removeItem('kitchenCosmo_activeInventory');
  };

  return (
    <>
      <TabsContent value="inventory" className="animate-fade-in">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="ClipboardList" />
                Инвентаризация
              </CardTitle>
              <div className="flex gap-2">
                {isChefOrSousChef() ? (
                  <CreateInventoryDialog
                    userName={userName}
                    inventoryDate={inventoryDate}
                    setInventoryDate={setInventoryDate}
                    inventoryProducts={inventoryProducts}
                    setInventoryProducts={setInventoryProducts}
                    inventorySemis={inventorySemis}
                    setInventorySemis={setInventorySemis}
                    inventoryHistory={inventoryHistory}
                    handleCopyLastInventory={handleCopyLastInventory}
                    handleStartInventory={handleStartInventory}
                  />
                ) : (
                  <div className="flex-1">
                    <Input
                      placeholder="Поиск продукта для внесения данных..."
                      className="max-w-md"
                    />
                  </div>
                )}
                {isChefOrSousChef() && (
                  <>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Icon name="Download" size={18} />
                      Экспорт
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Icon name="History" size={18} />
                      История
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeInventory && !isChefOrSousChef() ? (
              <CookInventoryView
                activeInventory={activeInventory}
                userName={userName}
                getUserPendingProducts={getUserPendingProducts}
                tempQuantities={tempQuantities}
                setTempQuantities={setTempQuantities}
                handleSubmitEntry={handleSubmitEntry}
              />
            ) : !isChefOrSousChef() ? (
              <div className="text-center py-12">
                <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Шеф или су-шеф должны начать инвентаризацию</p>
              </div>
            ) : activeInventory ? (
              <ChefInventoryView
                activeInventory={activeInventory}
                handleCompleteInventory={handleCompleteInventory}
                handleDeleteInventory={handleDeleteInventory}
              />
            ) : (
              <InventoryHistoryView
                inventoryHistory={inventoryHistory}
                isChefOrSousChef={isChefOrSousChef}
                handleCopyFromHistory={handleCopyFromHistory}
                handleDeleteFromHistory={handleDeleteFromHistory}
                viewInventoryReport={viewInventoryReport}
                setViewInventoryReport={setViewInventoryReport}
                handleExportToExcel={handleExportToExcel}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
}
