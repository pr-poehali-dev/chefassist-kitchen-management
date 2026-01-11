import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Product {
  id: number;
  name: string;
  unit: string;
  category_id: number;
  category_name: string;
  restaurant_id: number;
}

interface CreateOrderDialogProps {
  showCreateOrderDialog: boolean;
  setShowCreateOrderDialog: (show: boolean) => void;
  productsByCategoryForOrder: {[key: string]: Product[]};
  selectedProducts: {[key: number]: string};
  handleToggleProduct: (productId: number, currentStatus: string | undefined) => void;
  handleCreateOrder: () => void;
}

const CreateOrderDialog = ({
  showCreateOrderDialog,
  setShowCreateOrderDialog,
  productsByCategoryForOrder,
  selectedProducts,
  handleToggleProduct,
  handleCreateOrder,
}: CreateOrderDialogProps) => {
  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case 'to_order': return <Badge variant="destructive" className="text-xs">Заказать</Badge>;
      case 'in_stock': return <Badge variant="default" className="text-xs">В достатке</Badge>;
      default: return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
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
  );
};

export default CreateOrderDialog;
