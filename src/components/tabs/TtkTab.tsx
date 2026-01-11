import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TtkTabProps {
  ttkList: any[];
  isChefOrSousChef: () => boolean;
  onCreateTTK: (ttk: any) => Promise<any>;
  onUpdateTTK: (ttk: any) => Promise<boolean>;
  onDeleteTTK: (id: number) => Promise<boolean>;
}

export default function TtkTab({ ttkList, isChefOrSousChef, onCreateTTK, onUpdateTTK, onDeleteTTK }: TtkTabProps) {
  const [newTtk, setNewTtk] = useState({ name: '', category: '', output: '', ingredients: '', tech: '' });
  const [viewTtk, setViewTtk] = useState<any>(null);
  const [editTtk, setEditTtk] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleSaveTtk = async () => {
    if (!newTtk.name || !newTtk.category || !newTtk.ingredients) return;
    await onCreateTTK({
      name: newTtk.name,
      category: newTtk.category,
      output: Number(newTtk.output) || 0,
      ingredients: newTtk.ingredients,
      tech: newTtk.tech
    });
    setNewTtk({ name: '', category: '', output: '', ingredients: '', tech: '' });
    setIsCreateDialogOpen(false);
  };

  const handleUpdateTtk = async () => {
    if (!editTtk || !editTtk.name || !editTtk.category || !editTtk.ingredients) return;
    await onUpdateTTK({
      id: editTtk.id,
      name: editTtk.name,
      category: editTtk.category,
      output: Number(editTtk.output) || 0,
      ingredients: editTtk.ingredients,
      tech: editTtk.tech
    });
    setEditTtk(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteTtk = async (id: number) => {
    await onDeleteTTK(id);
  };

  return (
    <TabsContent value="ttk" className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileText" />
              Технико-технологические карты
            </CardTitle>
            {isChefOrSousChef() && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Icon name="Plus" size={18} />
                    Создать ТТК
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Новая ТТК</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="ttk-name">Название блюда</Label>
                    <Input 
                      id="ttk-name" 
                      placeholder="Стейк Рибай с трюфельным маслом"
                      value={newTtk.name}
                      onChange={(e) => setNewTtk({...newTtk, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ttk-category">Категория</Label>
                      <Input 
                        id="ttk-category" 
                        placeholder="Основные блюда"
                        value={newTtk.category}
                        onChange={(e) => setNewTtk({...newTtk, category: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ttk-output">Выход (г)</Label>
                      <Input 
                        id="ttk-output" 
                        type="number" 
                        placeholder="300"
                        value={newTtk.output}
                        onChange={(e) => setNewTtk({...newTtk, output: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ttk-ingredients">Состав продуктов</Label>
                    <p className="text-xs text-muted-foreground mb-2">Формат: Наименование - Брутто - Нетто (каждый с новой строки)</p>
                    <Textarea 
                      id="ttk-ingredients" 
                      placeholder="Говядина (Рибай) - 350г - 300г&#10;Трюфельное масло - 10мл - 10мл&#10;Соль морская - 5г - 5г" 
                      rows={5}
                      value={newTtk.ingredients}
                      onChange={(e) => setNewTtk({...newTtk, ingredients: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ttk-tech">Технология приготовления</Label>
                    <Textarea 
                      id="ttk-tech" 
                      placeholder="1. Довести мясо до комнатной температуры&#10;2. Разогреть сковороду до 180°C..." 
                      rows={5}
                      value={newTtk.tech}
                      onChange={(e) => setNewTtk({...newTtk, tech: e.target.value})}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSaveTtk}>Сохранить ТТК</Button>
                </div>
              </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ttkList.map((recipe) => (
              <Card key={recipe.id} className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-1">{recipe.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">{recipe.category}</Badge>
                    </div>
                    {isChefOrSousChef() && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => {
                            setEditTtk(recipe);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Icon name="Edit" size={16} className="text-primary" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleDeleteTtk(recipe.id)}
                        >
                          <Icon name="Trash2" size={16} className="text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Scale" size={16} />
                      <span>Выход: {recipe.output}г</span>
                    </div>
                    <div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full gap-2"
                            onClick={() => setViewTtk(recipe)}
                          >
                            <Icon name="Eye" size={16} />
                            Просмотр
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{recipe.name}</DialogTitle>
                          </DialogHeader>
                          {viewTtk && (
                            <div className="space-y-4 pt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-muted-foreground">Категория</Label>
                                  <p className="font-medium">{viewTtk.category}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Выход</Label>
                                  <p className="font-medium">{viewTtk.output}г</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-muted-foreground mb-2 block">Состав продуктов</Label>
                                <div className="border rounded-lg overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-muted">
                                      <tr>
                                        <th className="text-left p-3 border-b">Наименование</th>
                                        <th className="text-left p-3 border-b">Нетто</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {viewTtk.ingredients.split('\n').map((line: string, idx: number) => {
                                        const parts = line.split(' - ');
                                        let product = line;
                                        let netto = '—';
                                        
                                        if (parts.length >= 3) {
                                          product = parts[0].trim();
                                          netto = parts[2].trim();
                                        } else if (parts.length === 2) {
                                          product = parts[0].trim();
                                          netto = parts[1].trim();
                                        }
                                        
                                        return (
                                          <tr key={idx} className="border-b last:border-0">
                                            <td className="p-3">{product}</td>
                                            <td className="p-3 font-medium">{netto}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              <div>
                                <Label className="text-muted-foreground mb-2 block">Технология приготовления</Label>
                                <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap">
                                  {viewTtk.tech}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {isChefOrSousChef() && editTtk && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Редактировать ТТК</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ttk-name">Название блюда</Label>
                <Input 
                  id="edit-ttk-name" 
                  placeholder="Стейк Рибай с трюфельным маслом"
                  value={editTtk.name}
                  onChange={(e) => setEditTtk({...editTtk, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-ttk-category">Категория</Label>
                  <Input 
                    id="edit-ttk-category" 
                    placeholder="Основные блюда"
                    value={editTtk.category}
                    onChange={(e) => setEditTtk({...editTtk, category: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-ttk-output">Выход (г)</Label>
                  <Input 
                    id="edit-ttk-output" 
                    type="number" 
                    placeholder="300"
                    value={editTtk.output}
                    onChange={(e) => setEditTtk({...editTtk, output: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ttk-ingredients">Состав продуктов</Label>
                <p className="text-xs text-muted-foreground mb-2">Формат: Наименование - Брутто - Нетто (каждый с новой строки)</p>
                <Textarea 
                  id="edit-ttk-ingredients" 
                  placeholder="Говядина (Рибай) - 350г - 300г&#10;Трюфельное масло - 10мл - 10мл&#10;Соль морская - 5г - 5г" 
                  rows={5}
                  value={editTtk.ingredients}
                  onChange={(e) => setEditTtk({...editTtk, ingredients: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ttk-tech">Технология приготовления</Label>
                <Textarea 
                  id="edit-ttk-tech" 
                  placeholder="1. Довести мясо до комнатной температуры&#10;2. Разогреть сковороду до 180°C..." 
                  rows={5}
                  value={editTtk.tech}
                  onChange={(e) => setEditTtk({...editTtk, tech: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleUpdateTtk}>Сохранить изменения</Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)}>Отмена</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </TabsContent>
  );
}