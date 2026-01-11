import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface InventoryHistoryViewProps {
  inventoryHistory: any[];
  isChefOrSousChef: () => boolean;
  handleCopyFromHistory: (inv: any) => void;
  handleDeleteFromHistory: (invId: number) => void;
  viewInventoryReport: any;
  setViewInventoryReport: (inv: any) => void;
  handleExportToExcel: (inventory: any) => void;
}

export default function InventoryHistoryView({
  inventoryHistory,
  isChefOrSousChef,
  handleCopyFromHistory,
  handleDeleteFromHistory,
  viewInventoryReport,
  setViewInventoryReport,
  handleExportToExcel
}: InventoryHistoryViewProps) {
  return (
    <>
      <div className="space-y-4">
        {inventoryHistory.length > 0 ? (
          inventoryHistory.map((inv: any) => (
            <Card key={inv.id} className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{inv.name}</p>
                    <p className="text-sm text-muted-foreground">Ответственный: {inv.responsible}</p>
                    <p className="text-sm text-muted-foreground">Продуктов: {inv.products.length} | Завершено: {inv.completedDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyFromHistory(inv)}
                    >
                      <Icon name="Copy" size={16} className="mr-2" />
                      Копировать
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setViewInventoryReport(inv)}
                    >
                      <Icon name="FileText" size={16} className="mr-2" />
                      Отчёт
                    </Button>
                    {isChefOrSousChef() && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteFromHistory(inv.id)}
                      >
                        <Icon name="Trash2" size={16} className="text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">История инвентаризаций пуста</p>
          </div>
        )}
      </div>

      <Dialog open={!!viewInventoryReport} onOpenChange={() => setViewInventoryReport(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Отчёт по инвентаризации</DialogTitle>
          </DialogHeader>
          {viewInventoryReport && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                <div>
                  <Label className="text-muted-foreground">Название</Label>
                  <p className="font-medium">{viewInventoryReport.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Дата завершения</Label>
                  <p className="font-medium">{viewInventoryReport.completedDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ответственный</Label>
                  <p className="font-medium">{viewInventoryReport.responsible}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Всего позиций</Label>
                  <p className="font-medium">{viewInventoryReport.products.length}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block">Список продуктов</Label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 border-b">№</th>
                        <th className="text-left p-3 border-b">Наименование</th>
                        <th className="text-right p-3 border-b">Количество (г)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...viewInventoryReport.products].sort((a: any, b: any) => a.name.localeCompare(b.name, 'ru')).map((product: any, idx: number) => {
                        const totalQuantity = product.entries && product.entries.length > 0 
                          ? product.entries.reduce((sum: number, e: any) => sum + e.quantity, 0)
                          : 0;
                        return (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="p-3 text-muted-foreground">{idx + 1}</td>
                            <td className="p-3">{product.name}</td>
                            <td className="p-3 text-right font-medium">{totalQuantity || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleExportToExcel(viewInventoryReport)}
                >
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать Excel
                </Button>
                <Button variant="outline" className="flex-1">
                  <Icon name="Printer" size={16} className="mr-2" />
                  Печать
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}