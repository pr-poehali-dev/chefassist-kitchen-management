import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthContext';
import Icon from '@/components/ui/icon';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'chef' | 'sous_chef' | 'cook' | null>(null);
  const { login } = useAuth();

  const handleLogin = () => {
    if (name && selectedRole) {
      login(name, selectedRole);
    }
  };

  const roles = [
    { id: 'chef', label: 'Шеф-повар', icon: 'ChefHat', color: 'from-primary to-secondary' },
    { id: 'sous_chef', label: 'Су-шеф', icon: 'Users', color: 'from-secondary to-primary' },
    { id: 'cook', label: 'Повар-универсал', icon: 'Utensils', color: 'from-primary/80 to-secondary/80' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              KitchenCosmo
            </h1>
            <p className="text-muted-foreground mt-2">Вход в систему</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Ваше имя</Label>
            <Input
              id="name"
              placeholder="Введите имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-3">
            <Label>Выберите роль</Label>
            <div className="grid gap-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                    <Icon name={role.icon} size={24} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{role.label}</p>
                  </div>
                  {selectedRole === role.id && (
                    <Icon name="CheckCircle2" size={24} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!name || !selectedRole}
            className="w-full text-lg h-12"
          >
            Войти в систему
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
