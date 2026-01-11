import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import Icon from '@/components/ui/icon';

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

interface OrdersListViewProps {
  activeOrders: Order[];
  loading: boolean;
  isChefOrSousChef: boolean;
  handleUpdateOrderStatus: (orderId: number, newStatus: string) => void;
  setShowCreateOrderDialog: (show: boolean) => void;
}

const OrdersListView = ({
  activeOrders,
  loading,
  isChefOrSousChef,
  handleUpdateOrderStatus,
  setShowCreateOrderDialog,
}: OrdersListViewProps) => {
  const pendingOrders = activeOrders.filter(o => o.status === 'pending');
  const orderedOrders = activeOrders.filter(o => o.status === 'ordered');
  const completedOrders = activeOrders.filter(o => o.status === 'completed');
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

  return (
    <div className="space-y-4">
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
            <Button onClick={() => setShowCreateOrderDialog(true)}>
              Создать первую заявку
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingOrders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="Clock" size={20} />
                Ожидают ({pendingOrders.length})
              </h3>
              <div className="grid gap-4">
                {pendingOrders.map(order => (
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
                          {isChefOrSousChef && (
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
            </div>
          )}

          {orderedOrders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="ShoppingCart" size={20} />
                Заказано ({orderedOrders.length})
              </h3>
              <div className="grid gap-4">
                {orderedOrders.map(order => (
                  <Card key={order.id} className="border-blue-500/20">
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
                          {isChefOrSousChef && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order.id, 'completed')}>
                              Выполнено
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
            </div>
          )}

          {completedOrders.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Icon name="CheckCircle2" size={20} />
                Выполнено ({completedOrders.length})
              </h3>
              <div className="grid gap-4">
                {completedOrders.map(order => (
                  <Card key={order.id} className="border-green-500/20 opacity-75">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <CardTitle className="text-lg">Заявка #{order.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            От {order.creator_name} • {new Date(order.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
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
            </div>
          )}
        </div>
      )}
      
      {activeOrders.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button onClick={() => setShowCreateOrderDialog(true)} size="lg" className="gap-2">
            <Icon name="Plus" size={18} />
            Создать новую заявку
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrdersListView;