import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ChefInventoryViewProps {
  activeInventory: any;
  handleCompleteInventory: () => void;
  handleDeleteInventory: () => void;
}

export default function ChefInventoryView({
  activeInventory,
  handleCompleteInventory,
  handleDeleteInventory
}: ChefInventoryViewProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-lg">{activeInventory.name}</p>
            <p className="text-sm text-muted-foreground">Ответственный: {activeInventory.responsible}</p>
            <p className="text-sm text-muted-foreground">Дата: {new Date(activeInventory.date).toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground">Всего позиций: {activeInventory.products.length}</p>
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
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{product.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {product.type === 'semi' ? 'Полуфабрикат' : 'Продукт'}
                      </Badge>
                    </div>
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
  );
}
