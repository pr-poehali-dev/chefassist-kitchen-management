import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ProductMatrixView from './product-orders/ProductMatrixView';
import OrdersListView from './product-orders/OrdersListView';
import CreateOrderDialog from './product-orders/CreateOrderDialog';
import CookProductsList from './product-orders/CookProductsList';

const PRODUCTS_API_URL = 'https://functions.poehali.dev/2ff9cc4a-f745-42e6-bca2-f02bd90f39fd';

interface ProductCategory {
  id: number;
  name: string;
  restaurant_id: number;
}

interface Product {
  id: number;
  name: string;
  unit: string;
  category_id: number;
  category_name: string;
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

interface ProductOrdersTabProps {
  restaurantId: number | undefined;
  userId: number | undefined;
  isChefOrSousChef: () => boolean;
}

const ProductOrdersTab = ({ restaurantId, userId, isChefOrSousChef }: ProductOrdersTabProps) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'matrix'>(isChefOrSousChef() ? 'orders' : 'orders');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', unit: '', categoryId: '', newCategoryName: '' });
  const [selectedProducts, setSelectedProducts] = useState<{[key: number]: string}>({});

  useEffect(() => {
    if (restaurantId) {
      loadCategories();
      loadProducts();
      loadOrders();
    }
  }, [restaurantId]);

  const loadCategories = async () => {
    if (!restaurantId) return;
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=get_categories&restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    if (!restaurantId) return;
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=get_products&restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=get_orders&restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !restaurantId) {
      toast.error('Введите название категории');
      return;
    }
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=create_category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, name: newCategoryName.trim() })
      });
      
      if (response.ok) {
        toast.success('Категория создана');
        await loadCategories();
        setNewCategoryName('');
        setShowCategoryDialog(false);
      } else {
        toast.error('Ошибка при создании категории');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Ошибка при создании категории');
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.unit || !newProduct.categoryId || !restaurantId) {
      toast.error('Заполните все поля');
      return;
    }

    if (newProduct.categoryId === 'new' && !newProduct.newCategoryName.trim()) {
      toast.error('Введите название новой категории');
      return;
    }
    
    try {
      let categoryId = newProduct.categoryId;

      if (newProduct.categoryId === 'new') {
        const catResponse = await fetch(`${PRODUCTS_API_URL}?action=create_category`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restaurantId, name: newProduct.newCategoryName.trim() })
        });
        
        if (!catResponse.ok) {
          toast.error('Ошибка при создании категории');
          return;
        }
        
        const catData = await catResponse.json();
        categoryId = catData.category.id.toString();
        await loadCategories();
      }

      const response = await fetch(`${PRODUCTS_API_URL}?action=create_product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          categoryId: parseInt(categoryId),
          name: newProduct.name,
          unit: newProduct.unit
        })
      });
      
      if (response.ok) {
        toast.success('Продукт добавлен');
        await loadProducts();
        setNewProduct({ name: '', unit: '', categoryId: '', newCategoryName: '' });
        setShowProductDialog(false);
        
        // Предлагаем создать заявку
        setTimeout(() => {
          toast.info('Теперь можно создать заявку на этот продукт', {
            description: 'Нажмите "Создать заявку" чтобы заказать продукты',
            duration: 5000,
          });
        }, 500);
      } else {
        toast.error('Ошибка при добавлении продукта');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Ошибка при добавлении продукта');
    }
  };

  const handleToggleProduct = (productId: number, currentStatus: string | undefined) => {
    const newStatus = currentStatus === 'to_order' ? 'in_stock' : currentStatus === 'in_stock' ? undefined : 'to_order';
    
    if (newStatus === undefined) {
      const { [productId]: _, ...rest } = selectedProducts;
      setSelectedProducts(rest);
    } else {
      setSelectedProducts({ ...selectedProducts, [productId]: newStatus });
    }
  };

  const handleCreateOrder = async () => {
    if (!restaurantId || !userId || Object.keys(selectedProducts).length === 0) return;
    
    const items = Object.entries(selectedProducts).map(([productId, status]) => ({
      productId: parseInt(productId),
      status,
      notes: ''
    }));
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=create_order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          createdBy: userId,
          items
        })
      });
      
      if (response.ok) {
        toast.success('Заявка создана');
        await loadOrders();
        setSelectedProducts({});
        setShowCreateOrderDialog(false);
      } else {
        toast.error('Ошибка при создании заявки');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Ошибка при создании заявки');
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=update_order_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      
      if (response.ok) {
        toast.success('Статус обновлен');
        await loadOrders();
      } else {
        toast.error('Ошибка при обновлении');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Ошибка при обновлении');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Удалить категорию? Все продукты в ней тоже удалятся.')) return;
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=delete_category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId })
      });
      
      if (response.ok) {
        toast.success('Категория удалена');
        await loadCategories();
        await loadProducts();
      } else {
        toast.error('Ошибка при удалении категории');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Ошибка при удалении категории');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Удалить продукт?')) return;
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=delete_product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      
      if (response.ok) {
        toast.success('Продукт удален');
        await loadProducts();
      } else {
        toast.error('Ошибка при удалении продукта');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Ошибка при удалении продукта');
    }
  };

  const handleEditCategory = async (categoryId: number, newName: string) => {
    if (!newName.trim()) {
      toast.error('Введите название категории');
      return;
    }
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=update_category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, name: newName.trim() })
      });
      
      if (response.ok) {
        toast.success('Категория обновлена');
        await loadCategories();
        await loadProducts();
      } else {
        toast.error('Ошибка при обновлении категории');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Ошибка при обновлении категории');
    }
  };

  const productsByCategoryForOrder = products.reduce((acc, product) => {
    if (!acc[product.category_name]) {
      acc[product.category_name] = [];
    }
    acc[product.category_name].push(product);
    return acc;
  }, {} as {[key: string]: Product[]});

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'ordered');

  return (
    <TabsContent value="products" className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Продукты и заявки</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isChefOrSousChef() ? 'Управление матрицей и заявками' : 'Создание заявок на продукты'}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {isChefOrSousChef() && activeSubTab === 'matrix' && (
            <>
              <Button onClick={() => setShowCategoryDialog(true)} variant="outline" size="sm">
                <Icon name="FolderPlus" size={16} className="mr-2" />
                <span className="hidden sm:inline">Категория</span>
              </Button>
              <Button onClick={() => setShowProductDialog(true)} size="sm">
                <Icon name="Plus" size={16} className="mr-2" />
                <span className="hidden sm:inline">Продукт</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {isChefOrSousChef() ? (
        <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as 'orders' | 'matrix')} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
            <TabsTrigger value="orders" className="gap-2">
              <Icon name="ShoppingCart" size={16} />
              <span>Заявки</span>
              {activeOrders.length > 0 && <Badge variant="secondary" className="ml-1">{activeOrders.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="matrix" className="gap-2">
              <Icon name="Package" size={16} />
              <span>Матрица</span>
              <Badge variant="secondary" className="ml-1">{products.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <OrdersListView
            activeOrders={activeOrders}
            loading={loading}
            isChefOrSousChef={true}
            handleUpdateOrderStatus={handleUpdateOrderStatus}
            setShowCreateOrderDialog={setShowCreateOrderDialog}
          />

          <ProductMatrixView
            categories={categories}
            products={products}
            showCategoryDialog={showCategoryDialog}
            setShowCategoryDialog={setShowCategoryDialog}
            showProductDialog={showProductDialog}
            setShowProductDialog={setShowProductDialog}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            handleCreateCategory={handleCreateCategory}
            handleCreateProduct={handleCreateProduct}
            handleDeleteCategory={handleDeleteCategory}
            handleDeleteProduct={handleDeleteProduct}
            handleEditCategory={handleEditCategory}
          />
        </Tabs>
      ) : (
        <CookProductsList
          categories={categories}
          products={products}
          activeOrders={activeOrders}
          selectedProducts={selectedProducts}
          onToggleProduct={handleToggleProduct}
          onCreateOrder={handleCreateOrder}
        />
      )}


    </TabsContent>
  );
};

export default ProductOrdersTab;