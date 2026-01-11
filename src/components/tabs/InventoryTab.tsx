import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
  const [viewInventoryReport, setViewInventoryReport] = useState<any>(null);
  const [tempQuantities, setTempQuantities] = useState<{[key: number]: string}>({});

  const handleStartInventory = () => {
    if (!inventoryProducts.trim()) return;
    const products = inventoryProducts.split('\n').filter(p => p.trim()).map(p => ({ 
      name: p.trim(), 
      entries: [] // { user: string, quantity: number }[]
    }));
    const inventory = {
      id: Date.now(),
      name: `Инвентаризация ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString().split('T')[0],
      responsible: userName,
      products,
      status: 'in_progress'
    };
    setActiveInventory(inventory);
    localStorage.setItem('kitchenCosmo_activeInventory', JSON.stringify(inventory));
    setInventoryProducts('');
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
    const productNames = inv.products.map((p: any) => p.name).join('\n');
    setInventoryProducts(productNames);
  };

  const handleSubmitEntry = (productIndex: number, quantity: number) => {
    if (!activeInventory || quantity <= 0) return;
    const updated = {...activeInventory};
    const product = updated.products[productIndex];
    
    // Add entry for current user
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Icon name="Plus" size={18} />
                        Начать инвентаризацию
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Новая инвентаризация</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="inv-responsible">Ответственный</Label>
                          <Input id="inv-responsible" placeholder="ФИО сотрудника" value={userName} readOnly />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="inv-products">Перечень продуктов (каждый с новой строки)</Label>
                            {inventoryHistory.length > 0 && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1 h-7"
                                onClick={handleCopyLastInventory}
                              >
                                <Icon name="Copy" size={14} />
                                Копировать предыдущий
                              </Button>
                            )}
                          </div>
                          <Textarea 
                            id="inv-products" 
                            placeholder="Томаты&#10;Говядина&#10;Базилик&#10;Лосось&#10;Оливковое масло"
                            rows={10}
                            value={inventoryProducts}
                            onChange={(e) => setInventoryProducts(e.target.value)}
                          />
                        </div>
                        <Button className="w-full" onClick={handleStartInventory}>Начать инвентаризацию</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
              <div className="space-y-3">
                <div className="mb-4 p-4 rounded-lg bg-primary/5">
                  <p className="font-semibold">{activeInventory.name}</p>
                  <p className="text-sm text-muted-foreground">Ответственный: {activeInventory.responsible}</p>
                </div>
                {getUserPendingProducts().map((item: any, idx: number) => {
                  const originalIdx = activeInventory.products.findIndex((p: any) => p.name === item.name);
                  
                  return (
                    <div key={originalIdx} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                          <Icon name="Package" size={24} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          placeholder="Граммы"
                          className="w-32"
                          value={tempQuantities[originalIdx] || ''}
                          onChange={(e) => setTempQuantities({...tempQuantities, [originalIdx]: e.target.value})}
                        />
                        <Button 
                          size="sm"
                          onClick={() => {
                            handleSubmitEntry(originalIdx, Number(tempQuantities[originalIdx]));
                            const updated = {...tempQuantities};
                            delete updated[originalIdx];
                            setTempQuantities(updated);
                          }}
                        >
                          <Icon name="Check" size={16} className="mr-2" />
                          Внести
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {getUserPendingProducts().length === 0 && (
                  <div className="text-center py-12">
                    <Icon name="CheckCircle" size={48} className="mx-auto text-green-500 mb-4" />
                    <p className="text-muted-foreground">Вы внесли данные по всем продуктам</p>
                  </div>
                )}
              </div>
            ) : !isChefOrSousChef() ? (
              <div className="text-center py-12">
                <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Шеф или су-шеф должны начать инвентаризацию</p>
              </div>
            ) : activeInventory ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-lg">{activeInventory.name}</p>
                      <p className="text-sm text-muted-foreground">Ответственный: {activeInventory.responsible}</p>
                      <p className="text-sm text-muted-foreground">Продуктов: {activeInventory.products.length}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={handleCompleteInventory}
                      >
                        <Icon name="CheckCircle" size={16} className="mr-2" />
                        Завершить
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDeleteInventory}
                      >
                        <Icon name="Trash2" size={16} className="mr-2" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">Статистика внесения данных</h3>
                  {activeInventory.products.map((product: any, idx: number) => {
                    const entriesCount = product.entries ? product.entries.length : 0;
                    const totalQuantity = product.entries && product.entries.length > 0 
                      ? product.entries.reduce((sum: number, e: any) => sum + e.quantity, 0)
                      : 0;
                    const uniqueUsers = product.entries 
                      ? [...new Set(product.entries.map((e: any) => e.user))]
                      : [];

                    return (
                      <Card key={idx} className="border-border/50">
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{product.name}</p>
                              {entriesCount > 0 ? (
                                <div className="mt-1">
                                  <p className="text-sm text-muted-foreground">
                                    Внесли данные: {uniqueUsers.join(', ')}
                                  </p>
                                  <p className="text-sm font-medium text-primary">
                                    Общее количество: {totalQuantity}г
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground mt-1">Ожидает внесения</p>
                              )}
                            </div>
                            <Badge variant={entriesCount > 0 ? 'default' : 'secondary'}>
                              {entriesCount} {entriesCount === 1 ? 'запись' : 'записи'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {inventoryHistory.length > 0 ? (
                  inventoryHistory.map((inv: any) => (
                    <Card key={inv.id} className="border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">{inv.name}</p>
                            <p className="text-sm text-muted-foreground">Ответственный: {inv.responsible}</p>
                            <p className="text-sm text-muted-foreground">Продуктов: {inv.products.length} | Завершено: {inv.completedDate}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCopyFromHistory(inv)}
                            >
                              <Icon name="Copy" size={16} className="mr-2" />
                              Копировать
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setViewInventoryReport(inv)}
                            >
                              <Icon name="FileText" size={16} className="mr-2" />
                              Отчёт
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : null}
                {[
                  { id: 1, name: 'Плановая январь 2026', date: '2026-01-15', status: 'in_progress', items: 45, checked: 28, responsible: 'Иванов П.' },
                  { id: 2, name: 'Внеплановая проверка', date: '2026-01-08', status: 'completed', items: 32, checked: 32, responsible: 'Петров С.' },
                  { id: 3, name: 'Квартальная декабрь', date: '2025-12-30', status: 'completed', items: 50, checked: 50, responsible: 'Сидоров А.' },
                ].map((inventory) => (
                  <Card key={inventory.id} className="border-border/50 hover:border-primary/50 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <Icon name="Package" size={28} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{inventory.name}</p>
                            <p className="text-sm text-muted-foreground">Ответственный: {inventory.responsible}</p>
                          </div>
                        </div>
                        <Badge variant={inventory.status === 'completed' ? 'default' : 'secondary'}>
                          {inventory.status === 'completed' ? 'Завершена' : 'В процессе'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Позиций</p>
                          <p className="text-lg font-semibold">{inventory.items}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Проверено</p>
                          <p className="text-lg font-semibold text-primary">{inventory.checked}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Дата</p>
                          <p className="text-lg font-semibold">{inventory.date}</p>
                        </div>
                      </div>
                      <Progress value={(inventory.checked / inventory.items) * 100} className="h-2 mb-4" />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Icon name="Eye" size={16} className="mr-2" />
                          Просмотр отчёта
                        </Button>
                        <Button size="sm" variant="outline">
                          <Icon name="MoreVertical" size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <Dialog open={!!viewInventoryReport} onOpenChange={() => setViewInventoryReport(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Отчёт по инвентаризации</DialogTitle>
          </DialogHeader>
          {viewInventoryReport && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                <div>
                  <Label className="text-muted-foreground">Название</Label>
                  <p className="font-medium">{viewInventoryReport.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Дата завершения</Label>
                  <p className="font-medium">{viewInventoryReport.completedDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ответственный</Label>
                  <p className="font-medium">{viewInventoryReport.responsible}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Всего позиций</Label>
                  <p className="font-medium">{viewInventoryReport.products.length}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">Список продуктов</Label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 border-b">№</th>
                        <th className="text-left p-3 border-b">Наименование</th>
                        <th className="text-right p-3 border-b">Количество (г)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewInventoryReport.products.map((product: any, idx: number) => {
                        const totalQuantity = product.entries && product.entries.length > 0 
                          ? product.entries.reduce((sum: number, e: any) => sum + e.quantity, 0)
                          : 0;
                        return (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="p-3 text-muted-foreground">{idx + 1}</td>
                            <td className="p-3">{product.name}</td>
                            <td className="p-3 text-right font-medium">{totalQuantity || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать отчёт
                </Button>
                <Button variant="outline" className="flex-1">
                  <Icon name="Printer" size={16} className="mr-2" />
                  Печать
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}