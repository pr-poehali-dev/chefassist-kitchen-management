import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useAuth } from '@/components/AuthContext';
import LoginPage from '@/components/LoginPage';

const Index = () => {
  const { user, logout, isChefOrSousChef } = useAuth();

  if (!user) {
    return <LoginPage />;
  }
  const [activeTab, setActiveTab] = useState('ttk');
  const [searchQuery, setSearchQuery] = useState('');
  const [ttkList, setTtkList] = useState(() => {
    const saved = localStorage.getItem('kitchenCosmo_ttk');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Стейк с овощами гриль', category: 'Основные блюда', output: 300, ingredients: 'Говядина 300г\nТрюфельное масло 10мл', tech: 'Разогреть сковороду...' },
      { id: 2, name: 'Паста Карбонара', category: 'Паста', output: 350, ingredients: 'Паста 250г\nСливки 100мл', tech: 'Отварить пасту...' },
    ];
  });
  const [newTtk, setNewTtk] = useState({ name: '', category: '', output: '', ingredients: '', tech: '' });
  const [viewTtk, setViewTtk] = useState<any>(null);
  const [inventoryProducts, setInventoryProducts] = useState<string>('');
  const [activeInventory, setActiveInventory] = useState<any>(() => {
    const saved = localStorage.getItem('kitchenCosmo_activeInventory');
    return saved ? JSON.parse(saved) : null;
  });
  const [inventoryHistory, setInventoryHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('kitchenCosmo_inventoryHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewInventoryReport, setViewInventoryReport] = useState<any>(null);
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
  const [newChecklist, setNewChecklist] = useState({ name: '', workshop: '', items: '' });
  const [showChecklistStats, setShowChecklistStats] = useState(false);

  const mockIngredients = [
    { id: 1, name: 'Томаты', category: 'Овощи', quantity: 15, unit: 'кг', minStock: 10, price: 120 },
    { id: 2, name: 'Говядина', category: 'Мясо', quantity: 8, unit: 'кг', minStock: 12, price: 650 },
    { id: 3, name: 'Базилик', category: 'Специи', quantity: 0.5, unit: 'кг', minStock: 1, price: 450 },
    { id: 4, name: 'Оливковое масло', category: 'Масла', quantity: 3, unit: 'л', minStock: 5, price: 890 },
    { id: 5, name: 'Лосось', category: 'Рыба', quantity: 6, unit: 'кг', minStock: 8, price: 1200 },
  ];

  const mockRecipes = ttkList;

  const mockOrders = [
    { id: 1, supplier: 'Мясной двор', status: 'pending', items: 5, total: 12500, date: '2026-01-15' },
    { id: 2, supplier: 'ОвощБаза', status: 'sent', items: 8, total: 4200, date: '2026-01-12' },
    { id: 3, supplier: 'Рыбный мир', status: 'delivered', items: 3, total: 8900, date: '2026-01-10' },
  ];

  const lowStockItems = mockIngredients.filter(item => item.quantity < item.minStock);
  const totalInventoryValue = mockIngredients.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  const handleSaveTtk = () => {
    if (!newTtk.name || !newTtk.category || !newTtk.ingredients) return;
    const ttk = { ...newTtk, id: Date.now(), output: Number(newTtk.output) || 0 };
    const updated = [...ttkList, ttk];
    setTtkList(updated);
    localStorage.setItem('kitchenCosmo_ttk', JSON.stringify(updated));
    setNewTtk({ name: '', category: '', output: '', ingredients: '', tech: '' });
  };

  const handleDeleteTtk = (id: number) => {
    const updated = ttkList.filter(t => t.id !== id);
    setTtkList(updated);
    localStorage.setItem('kitchenCosmo_ttk', JSON.stringify(updated));
  };

  const handleSaveChecklist = () => {
    if (!newChecklist.name || !newChecklist.workshop || !newChecklist.items) return;
    const items = newChecklist.items.split('\n').filter(i => i.trim()).map(text => ({ text: text.trim(), status: 'pending' }));
    const checklist = { id: Date.now(), name: newChecklist.name, workshop: newChecklist.workshop, items };
    const updated = [...checklistList, checklist];
    setChecklistList(updated);
    localStorage.setItem('kitchenCosmo_checklists', JSON.stringify(updated));
    setNewChecklist({ name: '', workshop: '', items: '' });
  };

  const handleToggleChecklistItem = (checklistId: number, itemIndex: number, newStatus: string) => {
    const updated = checklistList.map(cl => {
      if (cl.id === checklistId) {
        const items = [...cl.items];
        items[itemIndex] = { ...items[itemIndex], status: newStatus };
        const completedDate = new Date().toISOString().split('T')[0];
        return { ...cl, items, completedDate };
      }
      return cl;
    });
    setChecklistList(updated);
    localStorage.setItem('kitchenCosmo_checklists', JSON.stringify(updated));
  };

  const handleStartInventory = () => {
    if (!inventoryProducts.trim()) return;
    const products = inventoryProducts.split('\n').filter(p => p.trim()).map(p => ({ name: p.trim(), quantity: 0 }));
    const inventory = {
      id: Date.now(),
      name: `Инвентаризация ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString().split('T')[0],
      responsible: user.name,
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

  const getChecklistStats = () => {
    const stats: any = {};
    checklistList.forEach(cl => {
      if (!stats[cl.workshop]) stats[cl.workshop] = [];
      const completed = cl.items.filter((i: any) => i.status === 'done').length;
      const inStop = cl.items.filter((i: any) => i.status === 'in_stop').length;
      stats[cl.workshop].push({
        name: cl.name,
        date: cl.completedDate || 'Не заполнен',
        completed,
        total: cl.items.length,
        inStop
      });
    });
    return stats;
  };

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
                    <p className="text-sm text-muted-foreground">Всего ингредиентов</p>
                    <p className="text-3xl font-bold mt-1">{mockIngredients.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon name="Package" size={24} className="text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20 hover:border-destructive/40 transition-all hover:shadow-lg hover:shadow-destructive/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Низкий остаток</p>
                    <p className="text-3xl font-bold mt-1 text-destructive">{lowStockItems.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Icon name="AlertTriangle" size={24} className="text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 hover:border-secondary/40 transition-all hover:shadow-lg hover:shadow-secondary/10">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Рецептов</p>
                    <p className="text-3xl font-bold mt-1">{mockRecipes.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Icon name="BookOpen" size={24} className="text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

          <TabsContent value="ttk" className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="FileText" />
                    Технико-технологические карты
                  </CardTitle>
                  {isChefOrSousChef() && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Icon name="Plus" size={18} />
                          Создать ТТК
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Новая ТТК</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="ttk-name">Название блюда</Label>
                          <Input 
                            id="ttk-name" 
                            placeholder="Стейк Рибай с трюфельным маслом"
                            value={newTtk.name}
                            onChange={(e) => setNewTtk({...newTtk, name: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ttk-category">Категория</Label>
                            <Input 
                              id="ttk-category" 
                              placeholder="Основные блюда"
                              value={newTtk.category}
                              onChange={(e) => setNewTtk({...newTtk, category: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ttk-output">Выход (г)</Label>
                            <Input 
                              id="ttk-output" 
                              type="number" 
                              placeholder="300"
                              value={newTtk.output}
                              onChange={(e) => setNewTtk({...newTtk, output: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ttk-ingredients">Состав продуктов</Label>
                          <p className="text-xs text-muted-foreground mb-2">Формат: Наименование - Количество (каждый с новой строки)</p>
                          <Textarea 
                            id="ttk-ingredients" 
                            placeholder="Говядина (Рибай) - 300г&#10;Трюфельное масло - 10мл&#10;Соль морская - 5г" 
                            rows={5}
                            value={newTtk.ingredients}
                            onChange={(e) => setNewTtk({...newTtk, ingredients: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ttk-tech">Технология приготовления</Label>
                          <Textarea 
                            id="ttk-tech" 
                            placeholder="1. Довести мясо до комнатной температуры&#10;2. Разогреть сковороду до 180°C..." 
                            rows={5}
                            value={newTtk.tech}
                            onChange={(e) => setNewTtk({...newTtk, tech: e.target.value})}
                          />
                        </div>
                        <Button className="w-full" onClick={handleSaveTtk}>Сохранить ТТК</Button>
                      </div>
                    </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockRecipes.map((recipe) => (
                    <Card key={recipe.id} className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-1">{recipe.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">{recipe.category}</Badge>
                          </div>
                          {isChefOrSousChef() && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              onClick={() => handleDeleteTtk(recipe.id)}
                            >
                              <Icon name="Trash2" size={18} />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium mb-1">Выход: {recipe.output}г</p>
                            <p className="whitespace-pre-wrap">{recipe.ingredients}</p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => setViewTtk(recipe)}>
                                  <Icon name="Eye" size={16} />
                                  Просмотр
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>{recipe.name}</DialogTitle>
                                </DialogHeader>
                                {viewTtk && (
                                  <div className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-muted-foreground">Категория</Label>
                                        <p className="font-medium">{viewTtk.category}</p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">Выход</Label>
                                        <p className="font-medium">{viewTtk.output}г</p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground mb-2 block">Состав продуктов</Label>
                                      <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                          <thead className="bg-muted">
                                            <tr>
                                              <th className="text-left p-3 border-b">Наименование</th>
                                              <th className="text-left p-3 border-b">Количество</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {viewTtk.ingredients.split('\n').map((line: string, idx: number) => {
                                              const parts = line.split(/(\d+[а-яА-Яa-zA-Z]+)/);
                                              const product = parts[0]?.trim();
                                              const quantity = parts[1]?.trim() || '-';
                                              return (
                                                <tr key={idx} className="border-b last:border-0">
                                                  <td className="p-3">{product}</td>
                                                  <td className="p-3 font-medium">{quantity}</td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground mb-2 block">Технология приготовления</Label>
                                      <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap">
                                        {viewTtk.tech}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklists" className="animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="CheckSquare" />
                    Чек-листы
                  </CardTitle>
                  <div className="flex gap-2">
                    {isChefOrSousChef() && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setShowChecklistStats(!showChecklistStats)}>
                          <Icon name="BarChart3" size={16} className="mr-2" />
                          Статистика
                        </Button>
                        <Dialog>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Icon name="Plus" size={18} />
                          Создать чек-лист
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Новый чек-лист</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="checklist-name">Название чек-листа</Label>
                            <Input 
                              id="checklist-name" 
                              placeholder="Открытие кухни"
                              value={newChecklist.name}
                              onChange={(e) => setNewChecklist({...newChecklist, name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="checklist-workshop">Цех</Label>
                            <Input 
                              id="checklist-workshop" 
                              placeholder="Горячий / Холодный / Кондитерский"
                              value={newChecklist.workshop}
                              onChange={(e) => setNewChecklist({...newChecklist, workshop: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="checklist-items">Пункты проверки (каждый с новой строки)</Label>
                            <Textarea 
                              id="checklist-items" 
                              placeholder="Проверить температуру холодильников&#10;Осмотреть срок годности продуктов&#10;Проверить чистоту рабочих поверхностей" 
                              rows={8}
                              value={newChecklist.items}
                              onChange={(e) => setNewChecklist({...newChecklist, items: e.target.value})}
                            />
                          </div>
                          <Button className="w-full" onClick={handleSaveChecklist}>Создать чек-лист</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {showChecklistStats && isChefOrSousChef() ? (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold mb-4">Статистика выполнения по цехам</h3>
                    {Object.entries(getChecklistStats()).map(([workshop, lists]: [string, any]) => (
                      <Card key={workshop} className="border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-base">{workshop}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {lists.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">Дата: {item.date}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-primary">{item.completed}/{item.total}</p>
                                    <p className="text-xs text-muted-foreground">Выполнено</p>
                                  </div>
                                  {item.inStop > 0 && (
                                    <Badge variant="destructive">{item.inStop} в стопе</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                  {checklistList.map((checklist) => (
                    <Card key={checklist.id} className="border-border/50 hover:border-primary/50 transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                              <Icon name="ClipboardCheck" size={28} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{checklist.name}</p>
                              <p className="text-sm text-muted-foreground">{checklist.workshop}</p>
                              {checklist.completedDate && (
                                <p className="text-xs text-primary mt-1">Заполнено: {checklist.completedDate}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          {checklist.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                              <span className="text-sm">{item.text}</span>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant={item.status === 'done' ? 'default' : 'outline'}
                                  className="h-8 px-3"
                                  onClick={() => handleToggleChecklistItem(checklist.id, idx, 'done')}
                                >
                                  <Icon name="Check" size={14} className="mr-1" />
                                  Выполнено
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant={item.status === 'in_stop' ? 'destructive' : 'outline'}
                                  className="h-8 px-3"
                                  onClick={() => handleToggleChecklistItem(checklist.id, idx, 'in_stop')}
                                >
                                  <Icon name="Ban" size={14} className="mr-1" />
                                  В стопе
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="writeoff" className="animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="MinusCircle" />
                    Списание продуктов
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Icon name="Plus" size={18} />
                        Создать списание
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Новое списание</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="writeoff-product">Продукт</Label>
                          <Input id="writeoff-product" placeholder="Выберите продукт" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="writeoff-quantity">Количество</Label>
                            <Input id="writeoff-quantity" type="number" placeholder="5" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="writeoff-unit">Единица</Label>
                            <Input id="writeoff-unit" placeholder="кг" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="writeoff-reason">Причина списания</Label>
                          <Textarea id="writeoff-reason" placeholder="Истёк срок годности / Брак / Порча" rows={3} />
                        </div>
                        <Button className="w-full">Создать списание</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: 1, product: 'Томаты', quantity: 2, unit: 'кг', reason: 'Порча при хранении', date: '2026-01-11', author: 'Иванов П.' },
                    { id: 2, product: 'Молоко', quantity: 5, unit: 'л', reason: 'Истёк срок годности', date: '2026-01-10', author: 'Петров С.' },
                    { id: 3, product: 'Базилик', quantity: 0.3, unit: 'кг', reason: 'Брак поставки', date: '2026-01-09', author: 'Сидоров А.' },
                  ].map((writeoff) => (
                    <div key={writeoff.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-destructive/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <Icon name="AlertCircle" size={24} className="text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium">{writeoff.product}</p>
                          <p className="text-sm text-muted-foreground">
                            {writeoff.quantity} {writeoff.unit} • {writeoff.reason}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{writeoff.author}</p>
                        <p className="text-xs text-muted-foreground">{writeoff.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>



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
                              <Input id="inv-responsible" placeholder="ФИО сотрудника" value={user.name} readOnly />
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
                    {activeInventory.products.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-all">
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
                            value={item.quantity || ''}
                            onChange={(e) => {
                              const updated = {...activeInventory};
                              updated.products[idx].quantity = Number(e.target.value);
                              setActiveInventory(updated);
                            }}
                          />
                          <Button size="sm">
                            <Icon name="Check" size={16} className="mr-2" />
                            Внести
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !isChefOrSousChef() ? (
                  <div className="text-center py-12">
                    <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Шеф или су-шеф должны начать инвентаризацию</p>
                  </div>
                ) : activeInventory ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                        {activeInventory.products.slice(0, 8).map((p: any, i: number) => (
                          <div key={i} className="text-xs p-2 rounded bg-background/50">
                            {p.name}
                          </div>
                        ))}
                        {activeInventory.products.length > 8 && (
                          <div className="text-xs p-2 rounded bg-background/50 text-muted-foreground">
                            +{activeInventory.products.length - 8} еще
                          </div>
                        )}
                      </div>
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
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setViewInventoryReport(inv)}
                              >
                                <Icon name="FileText" size={16} className="mr-2" />
                                Отчёт
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
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
                          {viewInventoryReport.products.map((product: any, idx: number) => (
                            <tr key={idx} className="border-b last:border-0">
                              <td className="p-3 text-muted-foreground">{idx + 1}</td>
                              <td className="p-3">{product.name}</td>
                              <td className="p-3 text-right font-medium">{product.quantity || '—'}</td>
                            </tr>
                          ))}
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

          <TabsContent value="orders" className="animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="ShoppingCart" />
                    Управление заявками
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Icon name="Plus" size={18} />
                        Новая заявка
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Создать заявку поставщику</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="supplier">Поставщик</Label>
                          <Input id="supplier" placeholder="Выберите поставщика" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="order-items">Позиции заказа</Label>
                          <Textarea id="order-items" placeholder="Говядина - 20кг&#10;Лосось - 15кг&#10;Томаты - 30кг" rows={6} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="delivery-date">Желаемая дата доставки</Label>
                          <Input id="delivery-date" type="date" />
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1">Отправить заявку</Button>
                          <Button variant="outline" className="flex-1">Сохранить черновик</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <Card key={order.id} className="border-border/50 hover:border-primary/50 transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                              <Icon name="Building2" size={28} className="text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{order.supplier}</p>
                              <p className="text-sm text-muted-foreground">Заявка #{order.id}</p>
                            </div>
                          </div>
                          <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'sent' ? 'secondary' : 'outline'} className="text-sm px-4 py-1">
                            {order.status === 'delivered' ? 'Доставлено' : order.status === 'sent' ? 'Отправлено' : 'В обработке'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Позиций</p>
                            <p className="text-lg font-semibold">{order.items}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Сумма</p>
                            <p className="text-lg font-semibold text-primary">{order.total}₽</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Дата</p>
                            <p className="text-lg font-semibold">{order.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Icon name="Eye" size={16} className="mr-2" />
                            Детали
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Icon name="Mail" size={16} className="mr-2" />
                            Отправить
                          </Button>
                          <Button size="sm" variant="outline">
                            <Icon name="MoreVertical" size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        </Tabs>
      </div>

      <style>{`
        .hover-scale {
          transition: transform 0.2s ease-out;
        }
        .hover-scale:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default Index;