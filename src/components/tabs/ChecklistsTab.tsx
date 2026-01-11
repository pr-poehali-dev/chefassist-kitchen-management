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
  const [newChecklist, setNewChecklist] = useState({ name: '', workshop: '', items: '', responsible: '' });
  const [showChecklistStats, setShowChecklistStats] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<any>(null);
  const [assigningResponsible, setAssigningResponsible] = useState<number | null>(null);
  const [responsibleName, setResponsibleName] = useState('');

  const handleSaveChecklist = () => {
    if (!newChecklist.name || !newChecklist.workshop || !newChecklist.items) return;
    const items = newChecklist.items.split('\n').filter(i => i.trim()).map(text => ({ text: text.trim(), status: 'pending' }));
    const checklist = { 
      id: Date.now(), 
      name: newChecklist.name, 
      workshop: newChecklist.workshop, 
      items,
      responsible: newChecklist.responsible || null
    };
    const updated = [...checklistList, checklist];
    setChecklistList(updated);
    localStorage.setItem('kitchenCosmo_checklists', JSON.stringify(updated));
    setNewChecklist({ name: '', workshop: '', items: '', responsible: '' });
  };

  const handleDeleteChecklist = (checklistId: number) => {
    const updated = checklistList.filter(cl => cl.id !== checklistId);
    setChecklistList(updated);
    localStorage.setItem('kitchenCosmo_checklists', JSON.stringify(updated));
  };

  const handleEditChecklist = (checklist: any) => {
    setEditingChecklist(checklist);
    setNewChecklist({
      name: checklist.name,
      workshop: checklist.workshop,
      items: checklist.items.map((item: any) => item.text).join('\n'),
      responsible: checklist.responsible || ''
    });
  };

  const handleUpdateChecklist = () => {
    if (!newChecklist.name || !newChecklist.workshop || !newChecklist.items) return;
    const items = newChecklist.items.split('\n').filter(i => i.trim()).map((text, idx) => {
      const existingItem = editingChecklist.items[idx];
      return {
        text: text.trim(),
        status: existingItem?.status || 'pending',
        timestamp: existingItem?.timestamp
      };
    });
    const updated = checklistList.map(cl => 
      cl.id === editingChecklist.id 
        ? { ...cl, name: newChecklist.name, workshop: newChecklist.workshop, items, responsible: newChecklist.responsible || null }
        : cl
    );
    setChecklistList(updated);
    localStorage.setItem('kitchenCosmo_checklists', JSON.stringify(updated));
    setNewChecklist({ name: '', workshop: '', items: '', responsible: '' });
    setEditingChecklist(null);
  };

  const handleAssignResponsible = (checklistId: number) => {
    if (!responsibleName.trim()) return;
    const updated = checklistList.map(cl => 
      cl.id === checklistId ? { ...cl, responsible: responsibleName } : cl
    );
    setChecklistList(updated);
    localStorage.setItem('kitchenCosmo_checklists', JSON.stringify(updated));
    setAssigningResponsible(null);
    setResponsibleName('');
  };

  const handleToggleChecklistItem = (checklistId: number, itemIndex: number, newStatus: string) => {
    const updated = checklistList.map(cl => {
      if (cl.id === checklistId) {
        const items = [...cl.items];
        items[itemIndex] = { ...items[itemIndex], status: newStatus, timestamp: new Date().toISOString() };
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
      const inRestriction = cl.items.filter((i: any) => i.status === 'in_restriction').length;
      const inStop = cl.items.filter((i: any) => i.status === 'in_stop').length;
      stats[cl.workshop].push({
        name: cl.name,
        date: cl.completedDate || 'Не заполнен',
        responsible: cl.responsible,
        completed,
        inRestriction,
        inStop,
        total: cl.items.length
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
                                        {item.responsible && (
                                          <p className="text-xs text-secondary flex items-center gap-1 mt-1">
                                            <Icon name="User" size={12} />
                                            {item.responsible}
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm text-green-600">Готово: {item.completed}/{item.total}</p>
                                        {item.inRestriction > 0 && (
                                          <p className="text-xs text-orange-600">В ограничении: {item.inRestriction}</p>
                                        )}
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
                  <Dialog onOpenChange={(open) => { if (!open) { setNewChecklist({ name: '', workshop: '', items: '' }); setEditingChecklist(null); } }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Icon name="Plus" size={18} />
                        Создать чек-лист
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingChecklist ? 'Редактировать чек-лист' : 'Новый чек-лист'}</DialogTitle>
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
                          <Label htmlFor="checklist-responsible">Ответственный повар (необязательно)</Label>
                          <Input 
                            id="checklist-responsible" 
                            placeholder="ФИО повара"
                            value={newChecklist.responsible}
                            onChange={(e) => setNewChecklist({...newChecklist, responsible: e.target.value})}
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
                        <Button 
                          className="w-full" 
                          onClick={editingChecklist ? handleUpdateChecklist : handleSaveChecklist}
                        >
                          {editingChecklist ? 'Сохранить изменения' : 'Создать чек-лист'}
                        </Button>
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
            {checklistList.length > 0 ? checklistList.map((checklist) => (
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
                        {checklist.responsible && (
                          <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                            <Icon name="User" size={12} />
                            Ответственный: {checklist.responsible}
                          </p>
                        )}
                        {checklist.completedDate && (
                          <p className="text-xs text-primary mt-1">Заполнено: {checklist.completedDate}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {assigningResponsible === checklist.id ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="ФИО повара"
                            value={responsibleName}
                            onChange={(e) => setResponsibleName(e.target.value)}
                            className="h-9 w-48"
                          />
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleAssignResponsible(checklist.id)}
                          >
                            <Icon name="Check" size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setAssigningResponsible(null);
                              setResponsibleName('');
                            }}
                          >
                            <Icon name="X" size={16} />
                          </Button>
                        </div>
                      ) : (
                        <>
                          {checklist.responsible ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setAssigningResponsible(checklist.id);
                                  setResponsibleName(checklist.responsible || '');
                                }}
                              >
                                <Icon name="User" size={16} className="mr-2" />
                                Изменить
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  const updated = checklistList.map(cl => 
                                    cl.id === checklist.id ? { ...cl, responsible: null } : cl
                                  );
                                  setChecklistList(updated);
                                  localStorage.setItem('kitchenCosmo_checklists', JSON.stringify(updated));
                                }}
                              >
                                <Icon name="UserX" size={16} />
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setAssigningResponsible(checklist.id);
                                setResponsibleName('');
                              }}
                            >
                              <Icon name="UserPlus" size={16} className="mr-2" />
                              Назначить
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditChecklist(checklist)}
                          >
                            <Icon name="Edit" size={16} className="mr-2" />
                            Редактировать
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteChecklist(checklist.id)}
                      >
                        <Icon name="Trash2" size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {checklist.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                        <span className="text-sm flex-1">{item.text}</span>
                        <div className="flex gap-2 ml-4">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'done' ? 'bg-green-500' : 
                            item.status === 'in_restriction' ? 'bg-orange-500' :
                            item.status === 'in_stop' ? 'bg-destructive' : 'bg-muted'
                          }`} />
                          <span className="text-xs text-muted-foreground min-w-[80px]">
                            {item.status === 'done' ? 'Готово' : 
                             item.status === 'in_restriction' ? 'В огранич.' :
                             item.status === 'in_stop' ? 'В стопе' : 'Ожидает'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-12">
                <Icon name="ClipboardList" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Чек-листы ещё не созданы</p>
              </div>
            )}
            </div>
          ) : (
            <div className="space-y-4">
            {checklistList.length > 0 ? checklistList.map((checklist) => (
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
                        {checklist.responsible && (
                          <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                            <Icon name="User" size={12} />
                            Ответственный: {checklist.responsible}
                          </p>
                        )}
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
                            variant={item.status === 'in_restriction' ? 'default' : 'outline'}
                            className="h-8 px-3 bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() => handleToggleChecklistItem(checklist.id, idx, 'in_restriction')}
                          >
                            <Icon name="AlertTriangle" size={14} className="mr-1" />
                            В огр.
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
            )) : (
              <div className="text-center py-12">
                <Icon name="ClipboardList" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Чек-листы ещё не созданы</p>
              </div>
            )}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}