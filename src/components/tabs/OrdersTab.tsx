import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const PRODUCTS_API_URL = 'https://functions.poehali.dev/2ff9cc4a-f745-42e6-bca2-f02bd90f39fd';

interface Product {
  id: number;
  name: string;
  unit: string;
  category_name: string;
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

interface OrdersTabProps {
  restaurantId: number | undefined;
  userId: number | undefined;
  isChefOrSousChef: () => boolean;
}

const OrdersTab = ({ restaurantId, userId, isChefOrSousChef }: OrdersTabProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<{[key: number]: string}>({});

  useEffect(() => {
    if (restaurantId) {
      loadProducts();
      loadOrders();
    }
  }, [restaurantId]);

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
        setShowCreateDialog(false);
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
        body: JSON.dumps({ orderId, status: newStatus })
      });
      
      if (response.ok) {
        toast.success('Статус заявки обновлен');
        await loadOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Ошибка при обновлении статуса');
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

  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category_name]) {
      acc[product.category_name] = [];
    }
    acc[product.category_name].push(product);
    return acc;
  }, {} as {[key: string]: Product[]});

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'ordered');

  return (
    <TabsContent value="orders" className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Заявки на продукты</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isChefOrSousChef() ? 'Управление заявками от поваров' : 'Создание заявок на продукты'}
          </p>
        </div>
        {!isChefOrSousChef() && (
          <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
            <Icon name="Plus" size={18} className="mr-2" />
            Создать заявку
          </Button>
        )}
      </div>

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
                <div className="space-y-2">
                  {Object.entries(
                    order.items.reduce((acc, item) => {
                      if (!acc[item.category_name]) acc[item.category_name] = [];
                      acc[item.category_name].push(item);
                      return acc;
                    }, {} as {[key: string]: OrderItem[]})
                  ).map(([categoryName, items]) => (
                    <div key={categoryName}>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">{categoryName}</h4>
                      <div className="space-y-1">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <span className="text-sm">{item.product_name}</span>
                            {getItemStatusBadge(item.status)}
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

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новая заявка на продукты</DialogTitle>
            <DialogDescription>
              Отметьте статус продуктов: 1 клик = Заказать, 2 клика = В достатке
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {Object.entries(productsByCategory).map(([categoryName, categoryProducts]) => (
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
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
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
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

export default OrdersTab;
