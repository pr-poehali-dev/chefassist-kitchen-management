import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const PRODUCTS_API_URL = 'https://functions.poehali.dev/2ff9cc4a-f745-42e6-bca2-f02bd90f39fd';

interface ProductCategory {
  id: number;
  name: string;
  restaurant_id: number;
}

interface Product {
  id: number;
  name: string;
  unit: string;
  category_id: number;
  category_name: string;
  restaurant_id: number;
}

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit: string;
  category_name: string;
  status: string;
  notes: string;
}

interface Order {
  id: number;
  created_by: number;
  creator_name: string;
  creator_role: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface ProductOrdersTabProps {
  restaurantId: number | undefined;
  userId: number | undefined;
  isChefOrSousChef: () => boolean;
}

const ProductOrdersTab = ({ restaurantId, userId, isChefOrSousChef }: ProductOrdersTabProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'matrix'>(isChefOrSousChef() ? 'orders' : 'orders');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', unit: '', categoryId: '' });
  const [selectedProducts, setSelectedProducts] = useState<{[key: number]: string}>({});

  useEffect(() => {
    if (restaurantId) {
      loadCategories();
      loadProducts();
      loadOrders();
    }
  }, [restaurantId]);

  const loadCategories = async () => {
    if (!restaurantId) return;
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=get_categories&restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    if (!restaurantId) return;
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=get_products&restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=get_orders&restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !restaurantId) {
      toast.error('Введите название категории');
      return;
    }
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=create_category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, name: newCategoryName.trim() })
      });
      
      if (response.ok) {
        toast.success('Категория создана');
        await loadCategories();
        setNewCategoryName('');
        setShowCategoryDialog(false);
      } else {
        toast.error('Ошибка при создании категории');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Ошибка при создании категории');
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.unit || !newProduct.categoryId || !restaurantId) {
      toast.error('Заполните все поля');
      return;
    }
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=create_product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          categoryId: parseInt(newProduct.categoryId),
          name: newProduct.name,
          unit: newProduct.unit
        })
      });
      
      if (response.ok) {
        toast.success('Продукт добавлен');
        await loadProducts();
        setNewProduct({ name: '', unit: '', categoryId: '' });
        setShowProductDialog(false);
      } else {
        toast.error('Ошибка при добавлении продукта');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Ошибка при добавлении продукта');
    }
  };

  const handleToggleProduct = (productId: number, currentStatus: string | undefined) => {
    const newStatus = currentStatus === 'to_order' ? 'in_stock' : currentStatus === 'in_stock' ? undefined : 'to_order';
    
    if (newStatus === undefined) {
      const { [productId]: _, ...rest } = selectedProducts;
      setSelectedProducts(rest);
    } else {
      setSelectedProducts({ ...selectedProducts, [productId]: newStatus });
    }
  };

  const handleCreateOrder = async () => {
    if (!restaurantId || !userId || Object.keys(selectedProducts).length === 0) return;
    
    const items = Object.entries(selectedProducts).map(([productId, status]) => ({
      productId: parseInt(productId),
      status,
      notes: ''
    }));
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=create_order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          createdBy: userId,
          items
        })
      });
      
      if (response.ok) {
        toast.success('Заявка создана');
        await loadOrders();
        setSelectedProducts({});
        setShowCreateOrderDialog(false);
      } else {
        toast.error('Ошибка при создании заявки');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Ошибка при создании заявки');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=update_order_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      
      if (response.ok) {
        toast.success('Статус обновлен');
        await loadOrders();
      } else {
        toast.error('Ошибка при обновлении');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Ошибка при обновлении');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Ожидает</Badge>;
      case 'ordered': return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">Заказано</Badge>;
      case 'completed': return <Badge variant="default">Выполнено</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case 'to_order': return <Badge variant="destructive" className="text-xs">Заказать</Badge>;
      case 'in_stock': return <Badge variant="default" className="text-xs">В достатке</Badge>;
      default: return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const productsByCategory = categories.map(category => ({
    category,
    products: products.filter(p => p.category_id === category.id)
  }));

  const productsByCategoryForOrder = products.reduce((acc, product) => {
    if (!acc[product.category_name]) {
      acc[product.category_name] = [];
    }
    acc[product.category_name].push(product);
    return acc;
  }, {} as {[key: string]: Product[]});

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'ordered');

  return (
    <TabsContent value="products" className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Продукты и заявки</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isChefOrSousChef() ? 'Управление матрицей и заявками' : 'Создание заявок на продукты'}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {!isChefOrSousChef() && (
            <Button onClick={() => setShowCreateOrderDialog(true)} className="flex-1 sm:flex-none">
              <Icon name="Plus" size={18} className="mr-2" />
              Создать заявку
            </Button>
          )}
          {isChefOrSousChef() && activeSubTab === 'matrix' && (
            <>
              <Button onClick={() => setShowCategoryDialog(true)} variant="outline" size="sm">
                <Icon name="FolderPlus" size={16} className="mr-2" />
                <span className="hidden sm:inline">Категория</span>
              </Button>
              <Button onClick={() => setShowProductDialog(true)} size="sm">
                <Icon name="Plus" size={16} className="mr-2" />
                <span className="hidden sm:inline">Продукт</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as 'orders' | 'matrix')} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
          <TabsTrigger value="orders" className="gap-2">
            <Icon name="ShoppingCart" size={16} />
            <span>Заявки</span>
            {activeOrders.length > 0 && <Badge variant="secondary" className="ml-1">{activeOrders.length}</Badge>}
          </TabsTrigger>
          {isChefOrSousChef() && (
            <TabsTrigger value="matrix" className="gap-2">
              <Icon name="Package" size={16} />
              <span>Матрица</span>
              <Badge variant="secondary" className="ml-1">{products.length}</Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="orders" className="space-y-4 mt-0">
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Загрузка...</p>
              </CardContent>
            </Card>
          ) : activeOrders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Icon name="ShoppingCart" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Нет активных заявок</p>
                {!isChefOrSousChef() && (
                  <Button onClick={() => setShowCreateOrderDialog(true)}>
                    Создать первую заявку
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeOrders.map(order => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <CardTitle className="text-lg">Заявка #{order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          От {order.creator_name} • {new Date(order.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        {isChefOrSousChef() && order.status === 'pending' && (
                          <Button size="sm" onClick={() => handleUpdateOrderStatus(order.id, 'ordered')}>
                            Заказано
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(
                        order.items.reduce((acc, item) => {
                          if (!acc[item.category_name]) acc[item.category_name] = [];
                          acc[item.category_name].push(item);
                          return acc;
                        }, {} as {[key: string]: OrderItem[]})
                      ).map(([categoryName, items]) => (
                        <div key={categoryName}>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                            <Icon name="FolderOpen" size={14} />
                            {categoryName}
                          </h4>
                          <div className="space-y-1">
                            {items.map(item => (
                              <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                <span className="text-sm">{item.product_name}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{item.unit}</Badge>
                                  {getItemStatusBadge(item.status)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {isChefOrSousChef() && (
          <TabsContent value="matrix" className="space-y-4 mt-0">
            {productsByCategory.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Создайте категории и добавьте продукты</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setShowCategoryDialog(true)} variant="outline">
                      <Icon name="FolderPlus" size={18} className="mr-2" />
                      Создать категорию
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productsByCategory.map(({ category, products: categoryProducts }) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon name="FolderOpen" size={20} />
                        {category.name}
                        <Badge variant="secondary" className="ml-auto">{categoryProducts.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {categoryProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Нет продуктов</p>
                      ) : (
                        <div className="space-y-2">
                          {categoryProducts.map(product => (
                            <div key={product.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                              <span className="text-sm font-medium">{product.name}</span>
                              <Badge variant="outline" className="text-xs">{product.unit}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новая категория</DialogTitle>
            <DialogDescription>Создайте категорию для группировки продуктов</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="categoryName">Название категории</Label>
              <Input
                id="categoryName"
                placeholder="Например: Мясо, Рыба, Овощи"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)} className="flex-1">
                Отмена
              </Button>
              <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()} className="flex-1">
                Создать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новый продукт</DialogTitle>
            <DialogDescription>Добавьте продукт в продуктовую матрицу</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="productCategory">Категория</Label>
              <Select value={newProduct.categoryId} onValueChange={(value) => setNewProduct({...newProduct, categoryId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="productName">Название продукта</Label>
              <Input
                id="productName"
                placeholder="Например: Говядина вырезка"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="productUnit">Единица измерения</Label>
              <Input
                id="productUnit"
                placeholder="Например: кг, л, шт"
                value={newProduct.unit}
                onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowProductDialog(false)} className="flex-1">
                Отмена
              </Button>
              <Button 
                onClick={handleCreateProduct} 
                disabled={!newProduct.name || !newProduct.unit || !newProduct.categoryId}
                className="flex-1"
              >
                Добавить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateOrderDialog} onOpenChange={setShowCreateOrderDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новая заявка на продукты</DialogTitle>
            <DialogDescription>
              Отметьте статус продуктов: 1 клик = Заказать, 2 клика = В достатке
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {Object.keys(productsByCategoryForOrder).length === 0 ? (
              <div className="text-center py-8">
                <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Нет продуктов в матрице</p>
                <p className="text-sm text-muted-foreground mt-2">Попросите шеф-повара добавить продукты</p>
              </div>
            ) : (
              <>
                {Object.entries(productsByCategoryForOrder).map(([categoryName, categoryProducts]) => (
                  <div key={categoryName}>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="FolderOpen" size={18} />
                      {categoryName}
                    </h4>
                    <div className="space-y-2">
                      {categoryProducts.map(product => {
                        const status = selectedProducts[product.id];
                        return (
                          <div
                            key={product.id}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              status === 'to_order' ? 'border-destructive bg-destructive/5' : 
                              status === 'in_stock' ? 'border-primary bg-primary/5' : 
                              'border-border bg-muted/30'
                            }`}
                            onClick={() => handleToggleProduct(product.id, status)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                status ? 'border-primary bg-primary' : 'border-border'
                              }`}>
                                {status && <Icon name="Check" size={14} className="text-primary-foreground" />}
                              </div>
                              <span className="text-sm font-medium">{product.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{product.unit}</Badge>
                              {status && getItemStatusBadge(status)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowCreateOrderDialog(false)} className="flex-1">
                    Отмена
                  </Button>
                  <Button 
                    onClick={handleCreateOrder} 
                    disabled={Object.keys(selectedProducts).length === 0}
                    className="flex-1"
                  >
                    Создать заявку ({Object.keys(selectedProducts).length})
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

export default ProductOrdersTab;
