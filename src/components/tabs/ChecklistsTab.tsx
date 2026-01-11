import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface ChecklistsTabProps {
  checklistList: any[];
  setChecklistList: (list: any[]) => void;
  isChefOrSousChef: () => boolean;
}

export default function ChecklistsTab({ checklistList, setChecklistList, isChefOrSousChef }: ChecklistsTabProps) {
  const [newChecklist, setNewChecklist] = useState({ name: '', workshop: '', items: '' });
  const [showChecklistStats, setShowChecklistStats] = useState(false);

  const handleSaveChecklist = () => {
    if (!newChecklist.name || !newChecklist.workshop || !newChecklist.items) return;
    const items = newChecklist.items.split('\n').filter(i => i.trim()).map(text => ({ text: text.trim(), status: 'pending' }));
    const checklist = { id: Date.now(), name: newChecklist.name, workshop: newChecklist.workshop, items };
    const updated = [...checklistList, checklist];
    setChecklistList(updated);
    localStorage.setItem('kitchenCosmo_checklists', JSON.stringify(updated));
    setNewChecklist({ name: '', workshop: '', items: '' });
  };

  const handleToggleChecklistItem = (checklistId: number, itemIndex: number, newStatus: string) => {
    const updated = checklistList.map(cl => {
      if (cl.id === checklistId) {
        const items = [...cl.items];
        items[itemIndex] = { ...items[itemIndex], status: newStatus };
        const completedDate = new Date().toISOString().split('T')[0];
        return { ...cl, items, completedDate };
      }
      return cl;
    });
    setChecklistList(updated);
    localStorage.setItem('kitchenCosmo_checklists', JSON.stringify(updated));
  };

  const getChecklistStats = () => {
    const stats: any = {};
    checklistList.forEach(cl => {
      if (!stats[cl.workshop]) stats[cl.workshop] = [];
      const completed = cl.items.filter((i: any) => i.status === 'done').length;
      const inStop = cl.items.filter((i: any) => i.status === 'in_stop').length;
      stats[cl.workshop].push({
        name: cl.name,
        date: cl.completedDate || 'Не заполнен',
        completed,
        total: cl.items.length,
        inStop
      });
    });
    return stats;
  };

  return (
    <TabsContent value="checklists" className="animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="CheckSquare" />
              Чек-листы
            </CardTitle>
            <div className="flex gap-2">
              {isChefOrSousChef() && (
                <>
                  <Dialog open={showChecklistStats} onOpenChange={setShowChecklistStats}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Icon name="BarChart" size={18} />
                        Статистика
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Статистика чек-листов по цехам</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 pt-4">
                        {Object.entries(getChecklistStats()).map(([workshop, lists]: [string, any]) => (
                          <div key={workshop}>
                            <h3 className="font-semibold text-lg mb-3">{workshop}</h3>
                            <div className="space-y-2">
                              {lists.map((item: any, idx: number) => (
                                <Card key={idx} className="border-border/50">
                                  <CardContent className="pt-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Дата: {item.date}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm">Выполнено: {item.completed}/{item.total}</p>
                                        {item.inStop > 0 && (
                                          <p className="text-xs text-destructive">В стопе: {item.inStop}</p>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Icon name="Plus" size={18} />
                        Создать чек-лист
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Новый чек-лист</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="checklist-name">Название чек-листа</Label>
                          <Input 
                            id="checklist-name" 
                            placeholder="Открытие холодного цеха"
                            value={newChecklist.name}
                            onChange={(e) => setNewChecklist({...newChecklist, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="checklist-workshop">Цех</Label>
                          <Input 
                            id="checklist-workshop" 
                            placeholder="Холодный цех / Горячий цех"
                            value={newChecklist.workshop}
                            onChange={(e) => setNewChecklist({...newChecklist, workshop: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="checklist-items">Пункты чек-листа (каждый с новой строки)</Label>
                          <Textarea 
                            id="checklist-items" 
                            placeholder="Проверить температуру холодильников&#10;Проверить чистоту рабочих поверхностей&#10;Проверить наличие инвентаря" 
                            rows={8}
                            value={newChecklist.items}
                            onChange={(e) => setNewChecklist({...newChecklist, items: e.target.value})}
                          />
                        </div>
                        <Button className="w-full" onClick={handleSaveChecklist}>Создать чек-лист</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isChefOrSousChef() ? (
            <div className="space-y-4">
            {checklistList.map((checklist) => (
              <Card key={checklist.id} className="border-border/50 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <Icon name="ClipboardCheck" size={28} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{checklist.name}</p>
                        <p className="text-sm text-muted-foreground">{checklist.workshop}</p>
                        {checklist.completedDate && (
                          <p className="text-xs text-primary mt-1">Заполнено: {checklist.completedDate}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {checklist.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                        <span className="text-sm flex-1">{item.text}</span>
                        <div className="flex gap-2 ml-4">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'done' ? 'bg-green-500' : 
                            item.status === 'in_stop' ? 'bg-destructive' : 'bg-muted'
                          }`} />
                          <span className="text-xs text-muted-foreground min-w-[60px]">
                            {item.status === 'done' ? 'Готово' : 
                             item.status === 'in_stop' ? 'В стопе' : 'Ожидает'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          ) : (
            <div className="space-y-4">
            {checklistList.map((checklist) => (
              <Card key={checklist.id} className="border-border/50 hover:border-primary/50 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <Icon name="ClipboardCheck" size={28} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{checklist.name}</p>
                        <p className="text-sm text-muted-foreground">{checklist.workshop}</p>
                        {checklist.completedDate && (
                          <p className="text-xs text-primary mt-1">Заполнено: {checklist.completedDate}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {checklist.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                        <span className="text-sm">{item.text}</span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant={item.status === 'done' ? 'default' : 'outline'}
                            className="h-8 px-3"
                            onClick={() => handleToggleChecklistItem(checklist.id, idx, 'done')}
                          >
                            <Icon name="Check" size={14} className="mr-1" />
                            Готово
                          </Button>
                          <Button 
                            size="sm" 
                            variant={item.status === 'in_stop' ? 'destructive' : 'outline'}
                            className="h-8 px-3"
                            onClick={() => handleToggleChecklistItem(checklist.id, idx, 'in_stop')}
                          >
                            <Icon name="Ban" size={14} className="mr-1" />
                            Стоп
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
