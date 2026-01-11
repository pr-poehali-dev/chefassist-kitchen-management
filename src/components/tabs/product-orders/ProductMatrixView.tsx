import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
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

interface ProductMatrixViewProps {
  categories: ProductCategory[];
  products: Product[];
  showCategoryDialog: boolean;
  setShowCategoryDialog: (show: boolean) => void;
  showProductDialog: boolean;
  setShowProductDialog: (show: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  newProduct: { name: string; unit: string; categoryId: string; newCategoryName: string };
  setNewProduct: (product: { name: string; unit: string; categoryId: string; newCategoryName: string }) => void;
  handleCreateCategory: () => void;
  handleCreateProduct: () => void;
  handleDeleteCategory: (categoryId: number) => void;
  handleDeleteProduct: (productId: number) => void;
  handleEditCategory: (categoryId: number, newName: string) => void;
}

const ProductMatrixView = ({
  categories,
  products,
  showCategoryDialog,
  setShowCategoryDialog,
  showProductDialog,
  setShowProductDialog,
  newCategoryName,
  setNewCategoryName,
  newProduct,
  setNewProduct,
  handleCreateCategory,
  handleCreateProduct,
  handleDeleteCategory,
  handleDeleteProduct,
  handleEditCategory,
}: ProductMatrixViewProps) => {
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const productsByCategory = categories.map(category => ({
    category,
    products: products.filter(p => p.category_id === category.id)
  }));

  return (
    <>
      <TabsContent value="matrix" className="space-y-4 mt-0">
        {productsByCategory.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Создайте категории и добавьте продукты</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setShowCategoryDialog(true)} variant="outline">
                  <Icon name="FolderPlus" size={18} className="mr-2" />
                  Создать категорию
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsByCategory.map(({ category, products: categoryProducts }) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    {editingCategoryId === category.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditCategory(category.id, editingCategoryName);
                              setEditingCategoryId(null);
                            } else if (e.key === 'Escape') {
                              setEditingCategoryId(null);
                            }
                          }}
                          className="h-8"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            handleEditCategory(category.id, editingCategoryName);
                            setEditingCategoryId(null);
                          }}
                        >
                          <Icon name="Check" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCategoryId(null)}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </div>
                    ) : (
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon name="FolderOpen" size={20} />
                        {category.name}
                        <Badge variant="secondary" className="ml-auto">{categoryProducts.length}</Badge>
                      </CardTitle>
                    )}
                    {editingCategoryId !== category.id && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setEditingCategoryName(category.name);
                          }}
                        >
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {categoryProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Нет продуктов</p>
                  ) : (
                    <div className="space-y-2">
                      {categoryProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 group">
                          <span className="text-sm font-medium">{product.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{product.unit}</Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

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
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)} className="flex-1">
                Отмена
              </Button>
              <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()} className="flex-1">
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
              <Select value={newProduct.categoryId} onValueChange={(value) => setNewProduct({...newProduct, categoryId: value, newCategoryName: ''})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите или создайте новую" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                  <SelectItem value="new">+ Создать новую категорию</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newProduct.categoryId === 'new' && (
              <div>
                <Label htmlFor="newCategoryName">Название новой категории</Label>
                <Input
                  id="newCategoryName"
                  placeholder="Например: Молочные продукты"
                  value={newProduct.newCategoryName}
                  onChange={(e) => setNewProduct({...newProduct, newCategoryName: e.target.value})}
                />
              </div>
            )}
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
                disabled={
                  !newProduct.name || 
                  !newProduct.unit || 
                  !newProduct.categoryId ||
                  (newProduct.categoryId === 'new' && !newProduct.newCategoryName.trim())
                }
                className="flex-1"
              >
                Добавить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductMatrixView;