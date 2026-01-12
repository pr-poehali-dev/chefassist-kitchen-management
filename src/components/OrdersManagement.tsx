import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OrdersManagementProps {
  restaurantId?: number;
}

export const useOrdersManagement = (restaurantId?: number) => {
  const [orderStats, setOrderStats] = useState({ pending: 0, ordered: 0, completed: 0, total: 0 });
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadOrderStats = async () => {
      if (!restaurantId) return;
      try {
        const response = await fetch(`https://functions.poehali.dev/2ff9cc4a-f745-42e6-bca2-f02bd90f39fd?action=get_orders&restaurantId=${restaurantId}`);
        if (response.ok) {
          const data = await response.json();
          const orders = data.orders || [];
          setOrdersData(orders);
          setOrderStats({
            pending: orders.filter((o: any) => o.status === 'pending').length,
            ordered: orders.filter((o: any) => o.status === 'ordered').length,
            completed: orders.filter((o: any) => o.status === 'completed').length,
            total: orders.length
          });
        }
      } catch (error) {
        console.error('Error loading order stats:', error);
      }
    };
    loadOrderStats();
    const interval = setInterval(loadOrderStats, 30000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  return {
    orderStats,
    ordersData,
    showOrdersDialog,
    setShowOrdersDialog,
    selectedOrderStatus,
    setSelectedOrderStatus
  };
};

interface OrdersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordersData: any[];
  selectedOrderStatus: string | null;
  setSelectedOrderStatus: (status: string | null) => void;
}

export const OrdersDialog = ({ 
  open, 
  onOpenChange, 
  ordersData, 
  selectedOrderStatus, 
  setSelectedOrderStatus 
}: OrdersDialogProps) => {
  const filteredOrders = selectedOrderStatus 
    ? ordersData.filter(o => o.status === selectedOrderStatus)
    : ordersData;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'Ожидает', color: 'bg-yellow-500', icon: 'Clock' };
      case 'ordered': return { label: 'Заказано', color: 'bg-blue-500', icon: 'ShoppingCart' };
      case 'completed': return { label: 'Получено', color: 'bg-green-500', icon: 'CheckCircle2' };
      default: return { label: status, color: 'bg-gray-500', icon: 'Circle' };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Package" size={24} />
            Заявки на закупку
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedOrderStatus(null)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedOrderStatus === null ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              Все
            </button>
            {['pending', 'ordered', 'completed'].map(status => {
              const info = getStatusInfo(status);
              return (
                <button
                  key={status}
                  onClick={() => setSelectedOrderStatus(status)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                    selectedOrderStatus === status ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <Icon name={info.icon} size={14} />
                  {info.label}
                </button>
              );
            })}
          </div>
          {filteredOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Нет заявок
            </p>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{order.dish_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Создано: {new Date(order.created_at).toLocaleString('ru-RU')}
                          </p>
                        </div>
                        <Badge className={statusInfo.color}>
                          <Icon name={statusInfo.icon} size={14} className="mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      {order.ingredients && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-2">Ингредиенты:</p>
                          <ul className="text-sm space-y-1">
                            {order.ingredients.map((ing: any, idx: number) => (
                              <li key={idx} className="flex justify-between">
                                <span>{ing.name}</span>
                                <span className="text-muted-foreground">{ing.quantity} {ing.unit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
