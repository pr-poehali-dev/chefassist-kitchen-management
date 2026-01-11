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

interface CookProductsListProps {
  categories: ProductCategory[];
  products: Product[];
  activeOrders: Order[];
  selectedProducts: {[key: number]: string};
  onToggleProduct: (productId: number, currentStatus: string | undefined) => void;
  onCreateOrder: () => void;
}

const CookProductsList = ({
  categories,
  products,
  activeOrders,
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

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Ожидает</Badge>;
      case 'ordered': 
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">Заказано</Badge>;
      case 'completed': 
        return <Badge variant="default">Выполнено</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const selectedCount = Object.keys(selectedProducts).length;

  return (
    <TabsContent value="orders" className="space-y-4 mt-0">
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icon name="ShoppingCart" size={20} />
            Активные заявки
            <Badge variant="secondary">{activeOrders.length}</Badge>
          </h3>
          {activeOrders.map(order => (
            <Card key={order.id} className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Заявка #{order.id}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString('ru-RU')} • {order.creator_name}
                    </p>
                  </div>
                  {getOrderStatusBadge(order.status)}
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
                      <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                        <Icon name="FolderOpen" size={12} />
                        {categoryName}
                      </h4>
                      <div className="space-y-1">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                            <span>{item.product_name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{item.unit}</Badge>
                              {getStatusBadge(item.status)}
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
      )}

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
          <h3 className="text-lg font-semibold flex items-center gap-2 pt-4">
            <Icon name="Package" size={20} />
            Создать новую заявку
          </h3>
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