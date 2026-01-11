import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthContext';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

const LoginPage = () => {
  const [step, setStep] = useState<'choice' | 'chef_register' | 'employee_join'>('choice');
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'chef' | 'sous_chef' | 'cook' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');
  const [error, setError] = useState('');
  
  const { createRestaurant, joinRestaurant } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) {
      setInviteCode(invite);
      setStep('employee_join');
    }
  }, []);

  const handleCreateRestaurant = () => {
    if (!name || !restaurantName) {
      setError('Заполните все поля');
      return;
    }
    
    const { inviteLink } = createRestaurant(name, restaurantName);
    setGeneratedInviteLink(inviteLink);
    setShowInviteLink(true);
  };

  const handleJoinRestaurant = () => {
    if (!name || !selectedRole || !inviteCode) {
      setError('Заполните все поля');
      return;
    }

    const success = joinRestaurant(name, selectedRole, inviteCode);
    if (!success) {
      setError('Неверный код приглашения');
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(generatedInviteLink);
  };

  if (showInviteLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="text-center">
            <Icon name="CheckCircle2" size={64} className="mx-auto text-green-500 mb-4" />
            <CardTitle className="text-2xl">Ресторан создан!</CardTitle>
            <p className="text-muted-foreground mt-2">Отправьте эту ссылку сотрудникам</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg break-all text-sm">
              {generatedInviteLink}
            </div>
            <Button onClick={copyInviteLink} className="w-full gap-2">
              <Icon name="Copy" size={18} />
              Скопировать ссылку
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Войти в систему
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'choice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="text-center">
            <div className="mb-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                KitchenCosmo
              </h1>
              <p className="text-muted-foreground mt-2">Добро пожаловать</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setStep('chef_register')} 
              className="w-full h-20 text-lg flex items-center gap-4"
            >
              <Icon name="Store" size={32} />
              <div className="text-left flex-1">
                <p className="font-bold">Создать ресторан</p>
                <p className="text-xs opacity-80">Я шеф-повар</p>
              </div>
            </Button>
            <Button 
              onClick={() => setStep('employee_join')} 
              variant="outline"
              className="w-full h-20 text-lg flex items-center gap-4"
            >
              <Icon name="UserPlus" size={32} />
              <div className="text-left flex-1">
                <p className="font-bold">Присоединиться</p>
                <p className="text-xs text-muted-foreground">У меня есть приглашение</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'chef_register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep('choice')}
              className="w-fit mb-2"
            >
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад
            </Button>
            <CardTitle>Создание ресторана</CardTitle>
            <p className="text-sm text-muted-foreground">Регистрация шеф-повара</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="chef-name">Ваше ФИО</Label>
              <Input
                id="chef-name"
                placeholder="Иван Иванов"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-name">Название ресторана</Label>
              <Input
                id="restaurant-name"
                placeholder="Моя кухня"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateRestaurant} className="w-full">
              Создать ресторан
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setStep('choice')}
            className="w-fit mb-2"
          >
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад
          </Button>
          <CardTitle>Присоединение к ресторану</CardTitle>
          <p className="text-sm text-muted-foreground">Регистрация сотрудника</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="employee-name">Ваше ФИО</Label>
            <Input
              id="employee-name"
              placeholder="Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Ваша должность</Label>
            <div className="grid gap-2">
              {[
                { id: 'sous_chef', label: 'Су-шеф', icon: 'Users' },
                { id: 'cook', label: 'Повар-универсал', icon: 'Utensils' },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id as 'sous_chef' | 'cook')}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon name={role.icon} size={20} />
                  <span className="font-medium">{role.label}</span>
                  {selectedRole === role.id && (
                    <Icon name="CheckCircle2" size={20} className="text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-code">Код приглашения</Label>
            <Input
              id="invite-code"
              placeholder="ABC123XY"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="uppercase"
            />
          </div>

          <Button onClick={handleJoinRestaurant} className="w-full">
            Присоединиться
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
