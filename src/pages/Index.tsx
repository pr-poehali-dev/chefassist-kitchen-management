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

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
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
                ChefAssist
              </h1>
              <p className="text-muted-foreground mt-1">Интеллектуальное управление профессиональной кухней</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="hover-scale">
                <Icon name="Bell" size={20} />
              </Button>
              <Button variant="outline" size="icon" className="hover-scale">
                <Icon name="Settings" size={20} />
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
            <TabsTrigger value="dashboard" className="gap-2">
              <Icon name="LayoutDashboard" size={18} />
              <span className="hidden sm:inline">Обзор</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Icon name="Package" size={18} />
              <span className="hidden sm:inline">Склад</span>
            </TabsTrigger>
            <TabsTrigger value="recipes" className="gap-2">
              <Icon name="BookOpen" size={18} />
              <span className="hidden sm:inline">Рецепты</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Icon name="ShoppingCart" size={18} />
              <span className="hidden sm:inline">Заявки</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Icon name="BarChart3" size={18} />
              <span className="hidden sm:inline">Аналитика</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="AlertTriangle" className="text-destructive" />
                    Требуют внимания
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Остаток: {item.quantity} {item.unit} / Минимум: {item.minStock} {item.unit}
                        </p>
                      </div>
                      <Badge variant="destructive">Низкий</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" className="text-primary" />
                    Популярные блюда
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockRecipes.map((recipe) => (
                    <div key={recipe.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{recipe.name}</p>
                        <Badge variant="secondary">{recipe.popularity}%</Badge>
                      </div>
                      <Progress value={recipe.popularity} className="h-2" />
                      <p className="text-xs text-muted-foreground">Себестоимость: {recipe.cost}₽</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ShoppingCart" className="text-secondary" />
                  Активные заявки поставщикам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon name="Building2" size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{order.supplier}</p>
                          <p className="text-sm text-muted-foreground">{order.items} позиций • {order.total}₽</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={order.status === 'delivered' ? 'default' : order.status === 'sent' ? 'secondary' : 'outline'}>
                          {order.status === 'delivered' ? 'Доставлено' : order.status === 'sent' ? 'Отправлено' : 'В обработке'}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
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
                    <Icon name="Package" />
                    Складской учёт
                  </CardTitle>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                          <Icon name="Plus" size={18} />
                          Добавить ингредиент
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Новый ингредиент</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Название</Label>
                            <Input id="name" placeholder="Томаты черри" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="quantity">Количество</Label>
                              <Input id="quantity" type="number" placeholder="10" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="unit">Единица</Label>
                              <Input id="unit" placeholder="кг" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">Цена за единицу</Label>
                            <Input id="price" type="number" placeholder="150" />
                          </div>
                          <Button className="w-full">Добавить</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Icon name="ScanLine" size={18} />
                      Сканировать
                    </Button>
                  </div>
                </div>
                <div className="pt-4">
                  <Input
                    placeholder="Поиск по ингредиентам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockIngredients.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-all hover:shadow-md group">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                          <Icon name="Apple" size={24} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {item.quantity < item.minStock && (
                          <Badge variant="destructive">Заказать</Badge>
                        )}
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Icon name="MoreVertical" size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes" className="animate-fade-in">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="BookOpen" />
                    Библиотека рецептов
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Icon name="Plus" size={18} />
                        Создать рецепт
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Новый рецепт</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="recipe-name">Название блюда</Label>
                          <Input id="recipe-name" placeholder="Стейк Рибай с трюфельным маслом" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recipe-category">Категория</Label>
                          <Input id="recipe-category" placeholder="Основные блюда" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recipe-ingredients">Ингредиенты</Label>
                          <Textarea id="recipe-ingredients" placeholder="Говядина (Рибай) - 300г&#10;Трюфельное масло - 10мл&#10;Соль морская - 5г" rows={5} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="recipe-portions">Выход (порций)</Label>
                            <Input id="recipe-portions" type="number" placeholder="1" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="recipe-time">Время (мин)</Label>
                            <Input id="recipe-time" type="number" placeholder="15" />
                          </div>
                        </div>
                        <Button className="w-full">Сохранить рецепт</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                            <span className="text-sm text-muted-foreground">Себестоимость</span>
                            <span className="text-xl font-bold text-primary">{recipe.cost}₽</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Популярность</span>
                              <span className="font-medium">{recipe.popularity}%</span>
                            </div>
                            <Progress value={recipe.popularity} className="h-2" />
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1 gap-2">
                              <Icon name="Eye" size={16} />
                              Просмотр
                            </Button>
                            <Button size="sm" className="flex-1 gap-2">
                              <Icon name="ChefHat" size={16} />
                              Списать
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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

          <TabsContent value="analytics" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" className="text-primary" />
                    Эффективность закупок
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Мясо и птица</span>
                      <span className="font-semibold">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Овощи и фрукты</span>
                      <span className="font-semibold">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Рыба и морепродукты</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Специи и приправы</span>
                      <span className="font-semibold">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="DollarSign" className="text-secondary" />
                    Расходы по категориям
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: 'Мясо и птица', amount: 45200, percent: 35 },
                      { category: 'Рыба и морепродукты', amount: 32100, percent: 25 },
                      { category: 'Овощи и фрукты', amount: 19300, percent: 15 },
                      { category: 'Молочные продукты', amount: 16200, percent: 12 },
                      { category: 'Специи и приправы', amount: 12900, percent: 10 },
                    ].map((item) => (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.category}</span>
                          <span className="text-sm font-bold">{item.amount}₽</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={item.percent * 2.5} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-10 text-right">{item.percent}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="ChefHat" className="text-primary" />
                    Топ блюд по популярности
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockRecipes.map((recipe, index) => (
                      <Card key={recipe.id} className="border-primary/20">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                              #{index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{recipe.name}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Progress value={recipe.popularity} className="h-2" />
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Популярность</span>
                              <span className="font-semibold">{recipe.popularity}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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