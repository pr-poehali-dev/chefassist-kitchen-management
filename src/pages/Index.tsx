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

  const mockIngredients = [
    { id: 1, name: 'Томаты', category: 'Овощи', quantity: 15, unit: 'кг', minStock: 10, price: 120 },
    { id: 2, name: 'Говядина', category: 'Мясо', quantity: 8, unit: 'кг', minStock: 12, price: 650 },
    { id: 3, name: 'Базилик', category: 'Специи', quantity: 0.5, unit: 'кг', minStock: 1, price: 450 },
    { id: 4, name: 'Оливковое масло', category: 'Масла', quantity: 3, unit: 'л', minStock: 5, price: 890 },
    { id: 5, name: 'Лосось', category: 'Рыба', quantity: 6, unit: 'кг', minStock: 8, price: 1200 },
  ];

  const mockRecipes = [
    { id: 1, name: 'Стейк с овощами гриль', cost: 520, category: 'Основные блюда', popularity: 95 },
    { id: 2, name: 'Паста Карбонара', cost: 280, category: 'Паста', popularity: 88 },
    { id: 3, name: 'Лосось терияки', cost: 680, category: 'Рыба', popularity: 92 },
    { id: 4, name: 'Капрезе салат', cost: 240, category: 'Салаты', popularity: 75 },
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
                          <Input id="ttk-name" placeholder="Стейк Рибай с трюфельным маслом" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ttk-category">Категория</Label>
                            <Input id="ttk-category" placeholder="Основные блюда" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ttk-output">Выход (г)</Label>
                            <Input id="ttk-output" type="number" placeholder="300" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ttk-ingredients">Состав</Label>
                          <Textarea id="ttk-ingredients" placeholder="Говядина (Рибай) - 300г&#10;Трюфельное масло - 10мл&#10;Соль морская - 5г" rows={5} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ttk-tech">Технология приготовления</Label>
                          <Textarea id="ttk-tech" placeholder="1. Довести мясо до комнатной температуры&#10;2. Разогреть сковороду до 180°C..." rows={5} />
                        </div>
                        <Button className="w-full">Сохранить ТТК</Button>
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
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon name="MoreVertical" size={18} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1 gap-2">
                              <Icon name="Eye" size={16} />
                              Просмотр
                            </Button>
                            {isChefOrSousChef() && (
                              <Button size="sm" className="flex-1 gap-2">
                                <Icon name="Pencil" size={16} />
                                Редактировать
                              </Button>
                            )}
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
                  {isChefOrSousChef() && (
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
                            <Input id="checklist-name" placeholder="Открытие кухни" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="checklist-workshop">Цех</Label>
                            <Input id="checklist-workshop" placeholder="Горячий / Холодный / Кондитерский" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="checklist-items">Пункты проверки</Label>
                            <Textarea id="checklist-items" placeholder="Проверить температуру холодильников&#10;Осмотреть срок годности продуктов&#10;Проверить чистоту рабочих поверхностей" rows={8} />
                          </div>
                          <Button className="w-full">Создать чек-лист</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      id: 1, 
                      name: 'Открытие горячего цеха', 
                      workshop: 'Горячий цех',
                      items: [
                        { text: 'Проверить температуру плит', status: 'done' },
                        { text: 'Проверить чистоту рабочих поверхностей', status: 'done' },
                        { text: 'Проверить наличие инвентаря', status: 'in_stop' },
                        { text: 'Проверить срок годности заготовок', status: 'pending' },
                      ]
                    },
                    { 
                      id: 2, 
                      name: 'Закрытие холодного цеха', 
                      workshop: 'Холодный цех',
                      items: [
                        { text: 'Убрать все продукты в холодильники', status: 'done' },
                        { text: 'Протереть рабочие поверхности', status: 'done' },
                        { text: 'Проверить температуру холодильников', status: 'pending' },
                      ]
                    },
                  ].map((checklist) => (
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
                                >
                                  <Icon name="Check" size={14} className="mr-1" />
                                  Выполнено
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant={item.status === 'in_stop' ? 'destructive' : 'outline'}
                                  className="h-8 px-3"
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
                              <Label htmlFor="inv-name">Название</Label>
                              <Input id="inv-name" placeholder="Плановая инвентаризация январь 2026" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="inv-type">Тип</Label>
                              <Input id="inv-type" placeholder="Плановая / Внеплановая" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="inv-responsible">Ответственный</Label>
                              <Input id="inv-responsible" placeholder="ФИО сотрудника" value={user.name} readOnly />
                            </div>
                            <Button className="w-full">Начать инвентаризацию</Button>
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
                    <Button variant="outline" size="sm" className="gap-2">
                      <Icon name="History" size={18} />
                      История
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!isChefOrSousChef() ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground mb-4">Выберите активную инвентаризацию и внесите количество продуктов</p>
                    {mockIngredients.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-all">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <Icon name="Package" size={24} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            placeholder="Граммы"
                            className="w-32"
                          />
                          <Button size="sm">
                            <Icon name="Check" size={16} className="mr-2" />
                            Внести
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
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