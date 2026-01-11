import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Product {
  id: number;
  name: string;
  unit: string;
  category_id: number;
  category_name: string;
  restaurant_id: number;
}

interface ProductCategory {
  id: number;
  name: string;
  restaurant_id: number;
}

interface CookProductsListProps {
  categories: ProductCategory[];
  products: Product[];
  selectedProducts: {[key: number]: string};
  onToggleProduct: (productId: number, currentStatus: string | undefined) => void;
  onCreateOrder: () => void;
}

const CookProductsList = ({
  categories,
  products,
  selectedProducts,
  onToggleProduct,
  onCreateOrder,
}: CookProductsListProps) => {
  const productsByCategory = categories.map(category => ({
    category,
    products: products.filter(p => p.category_id === category.id)
  })).filter(item => item.products.length > 0);

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    switch (status) {
      case 'to_order': 
        return <Badge variant="destructive" className="text-xs">Заказать</Badge>;
      case 'in_stock': 
        return <Badge variant="default" className="text-xs">В достатке</Badge>;
      default: 
        return null;
    }
  };

  const selectedCount = Object.keys(selectedProducts).length;

  return (
    <TabsContent value="orders" className="space-y-4 mt-0">
      {productsByCategory.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Нет продуктов в матрице</p>
            <p className="text-sm text-muted-foreground mt-2">Попросите шеф-повара добавить продукты</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    {categoryProducts.map(product => {
                      const status = selectedProducts[product.id];
                      return (
                        <div
                          key={product.id}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border-2 ${
                            status === 'to_order' 
                              ? 'border-destructive bg-destructive/5 hover:bg-destructive/10' 
                              : status === 'in_stock' 
                              ? 'border-primary bg-primary/5 hover:bg-primary/10' 
                              : 'border-border bg-muted/30 hover:bg-muted/50'
                          }`}
                          onClick={() => onToggleProduct(product.id, status)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              status ? 'border-primary bg-primary' : 'border-border'
                            }`}>
                              {status && <Icon name="Check" size={14} className="text-primary-foreground" />}
                            </div>
                            <span className="text-sm font-medium">{product.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{product.unit}</Badge>
                            {getStatusBadge(status)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedCount > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <button
                onClick={onCreateOrder}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 text-lg font-semibold transition-all hover:scale-105"
              >
                <Icon name="ShoppingCart" size={24} />
                Создать заявку ({selectedCount})
              </button>
            </div>
          )}
        </>
      )}
    </TabsContent>
  );
};

export default CookProductsList;
