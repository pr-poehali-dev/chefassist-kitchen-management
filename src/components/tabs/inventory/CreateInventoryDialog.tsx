import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface CreateInventoryDialogProps {
  userName: string;
  inventoryDate: string;
  setInventoryDate: (date: string) => void;
  inventoryProducts: string;
  setInventoryProducts: (products: string) => void;
  inventorySemis: string;
  setInventorySemis: (semis: string) => void;
  inventoryHistory: any[];
  handleCopyLastInventory: () => void;
  handleStartInventory: () => void;
}

export default function CreateInventoryDialog({
  userName,
  inventoryDate,
  setInventoryDate,
  inventoryProducts,
  setInventoryProducts,
  inventorySemis,
  setInventorySemis,
  inventoryHistory,
  handleCopyLastInventory,
  handleStartInventory
}: CreateInventoryDialogProps) {
  return (
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inv-responsible">Ответственный</Label>
              <Input id="inv-responsible" placeholder="ФИО сотрудника" value={userName} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-date">Дата инвентаризации</Label>
              <Input 
                id="inv-date" 
                type="date" 
                value={inventoryDate}
                onChange={(e) => setInventoryDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="inv-products">Продукты (каждый с новой строки)</Label>
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
              rows={6}
              value={inventoryProducts}
              onChange={(e) => setInventoryProducts(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-semis">Полуфабрикаты (каждый с новой строки)</Label>
            <Textarea 
              id="inv-semis" 
              placeholder="Фарш говяжий&#10;Тесто слоёное&#10;Бульон куриный&#10;Соус томатный"
              rows={6}
              value={inventorySemis}
              onChange={(e) => setInventorySemis(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleStartInventory}>Начать инвентаризацию</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
