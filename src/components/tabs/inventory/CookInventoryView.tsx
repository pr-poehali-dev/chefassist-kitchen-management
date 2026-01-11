import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface CookInventoryViewProps {
  activeInventory: any;
  userName: string;
  getUserPendingProducts: () => any[];
  tempQuantities: {[key: number]: string};
  setTempQuantities: (quantities: {[key: number]: string}) => void;
  handleSubmitEntry: (productIndex: number, quantity: number) => void;
}

export default function CookInventoryView({
  activeInventory,
  userName,
  getUserPendingProducts,
  tempQuantities,
  setTempQuantities,
  handleSubmitEntry
}: CookInventoryViewProps) {
  const pendingProducts = getUserPendingProducts();

  return (
    <div className="space-y-3">
      <div className="mb-4 p-4 rounded-lg bg-primary/5">
        <p className="font-semibold">{activeInventory.name}</p>
        <p className="text-sm text-muted-foreground">Ответственный: {activeInventory.responsible}</p>
        <p className="text-sm text-muted-foreground">Дата: {new Date(activeInventory.date).toLocaleDateString()}</p>
      </div>
      {pendingProducts.map((item: any, idx: number) => {
        const originalIdx = activeInventory.products.findIndex((p: any) => p.name === item.name);
        
        return (
          <div key={originalIdx} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-all">
            <div className="flex items-center gap-4 flex-1">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <Icon name={item.type === 'semi' ? 'Soup' : 'Package'} size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.type === 'semi' ? 'Полуфабрикат' : 'Продукт'}</p>
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
      {pendingProducts.length === 0 && (
        <div className="text-center py-12">
          <Icon name="CheckCircle" size={48} className="mx-auto text-green-500 mb-4" />
          <p className="text-muted-foreground">Вы внесли данные по всем продуктам</p>
        </div>
      )}
    </div>
  );
}
