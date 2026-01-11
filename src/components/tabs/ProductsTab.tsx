import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface ProductsTabProps {
  restaurantId: number | undefined;
  isChefOrSousChef: () => boolean;
}

const ProductsTab = ({ restaurantId, isChefOrSousChef }: ProductsTabProps) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', unit: '', categoryId: '' });

  useEffect(() => {
    if (restaurantId) {
      loadCategories();
      loadProducts();
    }
  }, [restaurantId]);

  const loadCategories = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=get_categories&restaurantId=${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
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

  const handleCreateCategory = async () => {
    if (!newCategoryName || !restaurantId) return;
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=create_category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, name: newCategoryName })
      });
      
      if (response.ok) {
        await loadCategories();
        setNewCategoryName('');
        setShowCategoryDialog(false);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.unit || !newProduct.categoryId || !restaurantId) return;
    
    try {
      const response = await fetch(`${PRODUCTS_API_URL}?action=create_product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          categoryId: parseInt(newProduct.categoryId),
          name: newProduct.name,
          unit: newProduct.unit
        })
      });
      
      if (response.ok) {
        await loadProducts();
        setNewProduct({ name: '', unit: '', categoryId: '' });
        setShowProductDialog(false);
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const productsByCategory = categories.map(category => ({
    category,
    products: products.filter(p => p.category_id === category.id)
  }));

  if (!isChefOrSousChef()) {
    return (
      <TabsContent value="products" className="space-y-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Icon name="Lock" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Только шеф-повар и су-шеф могут управлять продуктовой матрицей</p>
          </CardContent>
        </Card>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="products" className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Продуктовая матрица</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Управление категориями и продуктами для заявок</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowCategoryDialog(true)} variant="outline" className="flex-1 sm:flex-none">
            <Icon name="FolderPlus" size={18} className="mr-2" />
            <span className="hidden sm:inline">Категория</span>
            <span className="sm:hidden">Категория</span>
          </Button>
          <Button onClick={() => setShowProductDialog(true)} className="flex-1 sm:flex-none">
            <Icon name="Plus" size={18} className="mr-2" />
            <span className="hidden sm:inline">Добавить продукт</span>
            <span className="sm:hidden">Продукт</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Загрузка...</p>
          </CardContent>
        </Card>
      ) : productsByCategory.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Создайте категории и добавьте продукты</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                {categoryProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Нет продуктов</p>
                ) : (
                  <div className="space-y-2">
                    {categoryProducts.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">{product.name}</span>
                        <Badge variant="outline" className="text-xs">{product.unit}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новая категория</DialogTitle>
            <DialogDescription>Создайте категорию для группировки продуктов</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="categoryName">Название категории</Label>
              <Input
                id="categoryName"
                placeholder="Например: Мясо, Рыба, Овощи"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)} className="flex-1">
                Отмена
              </Button>
              <Button onClick={handleCreateCategory} disabled={!newCategoryName} className="flex-1">
                Создать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новый продукт</DialogTitle>
            <DialogDescription>Добавьте продукт в продуктовую матрицу</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="productCategory">Категория</Label>
              <Select value={newProduct.categoryId} onValueChange={(value) => setNewProduct({...newProduct, categoryId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="productName">Название продукта</Label>
              <Input
                id="productName"
                placeholder="Например: Говядина вырезка"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="productUnit">Единица измерения</Label>
              <Input
                id="productUnit"
                placeholder="Например: кг, л, шт"
                value={newProduct.unit}
                onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowProductDialog(false)} className="flex-1">
                Отмена
              </Button>
              <Button 
                onClick={handleCreateProduct} 
                disabled={!newProduct.name || !newProduct.unit || !newProduct.categoryId}
                className="flex-1"
              >
                Добавить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

export default ProductsTab;
