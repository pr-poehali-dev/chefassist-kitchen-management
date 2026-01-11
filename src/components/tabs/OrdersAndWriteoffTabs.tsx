import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
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

const mockOrders = [
  { id: 1, supplier: 'Мясной двор', status: 'pending', items: 5, total: 12500, date: '2026-01-15' },
  { id: 2, supplier: 'ОвощБаза', status: 'sent', items: 8, total: 4200, date: '2026-01-12' },
  { id: 3, supplier: 'Рыбный мир', status: 'delivered', items: 3, total: 8900, date: '2026-01-10' },
];

export function OrdersTab() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Ожидает</Badge>;
      case 'sent': return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">Отправлена</Badge>;
      case 'delivered': return <Badge variant="default">Доставлена</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
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
                    <Textarea id="order-items" placeholder="Томаты - 20кг&#10;Говядина - 15кг" rows={5} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery-date">Желаемая дата доставки</Label>
                    <Input id="delivery-date" type="date" />
                  </div>
                  <Button className="w-full">Создать заявку</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <Icon name="ShoppingBag" size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{order.supplier}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items} позиций • {order.total.toLocaleString()} ₽
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{order.date}</p>
                    {getStatusBadge(order.status)}
                  </div>
                  <Button size="icon" variant="ghost">
                    <Icon name="MoreVertical" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export function WriteoffTab() {
  return (
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
  );
}
