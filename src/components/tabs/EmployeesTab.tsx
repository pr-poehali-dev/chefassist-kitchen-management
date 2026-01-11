import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EmployeesTab() {
  const { restaurant, getEmployees, updateEmployeeRole, removeEmployee, user, employees: contextEmployees } = useAuth();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<number | null>(null);
  const [newRole, setNewRole] = useState<'chef' | 'sous_chef' | 'cook'>('cook');
  const [localEmployees, setLocalEmployees] = useState(contextEmployees);

  const inviteLink = restaurant ? `${window.location.origin}?invite=${restaurant.invite_code}` : '';

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const emps = await getEmployees();
    setLocalEmployees(emps);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  const handleUpdateRole = async (employeeId: number) => {
    await updateEmployeeRole(employeeId, newRole);
    await loadEmployees();
    setEditingEmployee(null);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'chef': return 'Шеф-повар';
      case 'sous_chef': return 'Су-шеф';
      case 'cook': return 'Повар-универсал';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'chef': return 'default';
      case 'sous_chef': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <TabsContent value="employees" className="animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Users" />
                Сотрудники
              </CardTitle>
              {restaurant && (
                <p className="text-sm text-muted-foreground mt-1">{restaurant.name}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Icon name="UserPlus" size={18} />
                    Пригласить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Пригласительная ссылка</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground text-center">
                      Отсканируйте QR-код или отправьте ссылку сотрудникам
                    </p>
                    <div className="flex justify-center p-6 bg-white rounded-lg">
                      <QRCodeSVG 
                        value={inviteLink} 
                        size={220}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <div className="p-4 bg-muted rounded-lg break-all text-sm font-mono">
                      {inviteLink}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={copyInviteLink} className="flex-1 gap-2">
                        <Icon name="Copy" size={18} />
                        Скопировать ссылку
                      </Button>
                    </div>
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs text-muted-foreground">
                        <Icon name="Info" size={14} className="inline mr-1" />
                        Код приглашения: <span className="font-mono font-bold">{restaurant?.invite_code}</span>
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {localEmployees.map((employee) => (
              <Card key={employee.id} className="border-border/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Icon name="User" size={24} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{employee.name}</p>
                          {employee.id === user?.id && (
                            <Badge variant="outline" className="text-xs">Вы</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {editingEmployee === employee.id ? (
                            <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                              <SelectTrigger className="h-7 w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="chef">Шеф-повар</SelectItem>
                                <SelectItem value="sous_chef">Су-шеф</SelectItem>
                                <SelectItem value="cook">Повар-универсал</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant={getRoleBadgeVariant(employee.role) as any}>
                              {getRoleLabel(employee.role)}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            • С {new Date(employee.joined_at).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {user?.role === 'chef' && employee.role !== 'chef' && (
                      <div className="flex gap-2">
                        {editingEmployee === employee.id ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleUpdateRole(employee.id)}
                            >
                              <Icon name="Check" size={16} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingEmployee(null)}
                            >
                              <Icon name="X" size={16} />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingEmployee(employee.id);
                                setNewRole(employee.role);
                              }}
                            >
                              <Icon name="Edit" size={16} className="mr-2" />
                              Изменить
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={async () => {
                                if (confirm(`Удалить сотрудника ${employee.name}?`)) {
                                  await removeEmployee(employee.id);
                                  await loadEmployees();
                                }
                              }}
                            >
                              <Icon name="Trash2" size={16} className="text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {localEmployees.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Нет сотрудников</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}