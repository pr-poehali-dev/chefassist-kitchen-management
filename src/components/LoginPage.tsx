import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthContext';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';

const LoginPage = () => {
  const [step, setStep] = useState<'choice' | 'chef_register' | 'employee_join' | 'employee_login'>('choice');
  const [name, setName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'chef' | 'sous_chef' | 'cook' | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');
  const [error, setError] = useState('');
  
  const { createRestaurant, joinRestaurant, loginExisting, logout } = useAuth();

  const handleClearOldData = () => {
    logout();
    localStorage.clear();
    window.location.reload();
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) {
      setInviteCode(invite);
      setStep('employee_join');
    }
  }, []);

  const handleCreateRestaurant = async () => {
    if (!name || !restaurantName) {
      setError('Заполните все поля');
      return;
    }
    
    try {
      const { inviteLink } = await createRestaurant(name, restaurantName);
      setGeneratedInviteLink(inviteLink);
      setShowInviteLink(true);
    } catch (error) {
      setError('Ошибка при создании ресторана');
    }
  };

  const handleJoinRestaurant = async () => {
    if (!name || !selectedRole || !inviteCode) {
      setError('Заполните все поля');
      return;
    }

    try {
      const success = await joinRestaurant(name, selectedRole, inviteCode);
      if (!success) {
        setError('Неверный код приглашения');
      }
    } catch (error) {
      setError('Ошибка при присоединении');
    }
  };

  const handleLoginExisting = async () => {
    if (!name || !inviteCode) {
      setError('Заполните все поля');
      return;
    }

    try {
      const success = await loginExisting(name, inviteCode);
      if (!success) {
        setError('Сотрудник не найден в этом ресторане');
      }
    } catch (error) {
      setError('Ошибка при входе');
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(generatedInviteLink);
  };

  if (showInviteLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 safe-top safe-bottom">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="text-center">
            <Icon name="CheckCircle2" size={56} className="mx-auto text-green-500 mb-3" />
            <CardTitle className="text-xl sm:text-2xl">Ресторан создан!</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Отправьте эту ссылку сотрудникам</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center p-4 sm:p-6 bg-white rounded-lg">
              <QRCodeSVG 
                value={generatedInviteLink} 
                size={Math.min(window.innerWidth - 120, 200)}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="p-3 sm:p-4 bg-muted rounded-lg break-all text-xs sm:text-sm">
              {generatedInviteLink}
            </div>
            <Button onClick={copyInviteLink} className="w-full gap-2 h-12 touch-target text-base">
              <Icon name="Copy" size={20} />
              Скопировать ссылку
            </Button>
            <p className="text-xs text-center text-muted-foreground px-4">
              Отсканируйте QR-код или отправьте ссылку сотрудникам
            </p>
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 safe-top safe-bottom">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="text-center pb-4">
            <div className="mb-2 flex flex-col items-center">
              <img 
                src="https://cdn.poehali.dev/projects/ca4481ee-9d03-47bf-afcd-998c0128f9ce/files/2f8a5a42-7dbe-437b-9787-b8cd165e8f90.jpg" 
                alt="KitchenCosmo Logo" 
                className="h-20 w-20 rounded-xl object-cover mb-3 shadow-lg"
              />
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                KitchenCosmo
              </h1>
              <p className="text-sm text-muted-foreground mt-2">Добро пожаловать</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => setStep('chef_register')} 
              className="w-full h-auto py-4 text-base flex items-center gap-4 touch-target"
            >
              <Icon name="Store" size={28} className="flex-shrink-0" />
              <div className="text-left flex-1">
                <p className="font-bold">Создать ресторан</p>
                <p className="text-xs opacity-80 font-normal">Я шеф-повар</p>
              </div>
            </Button>
            <Button 
              onClick={() => setStep('employee_join')} 
              variant="outline"
              className="w-full h-auto py-4 text-base flex items-center gap-4 touch-target"
            >
              <Icon name="UserPlus" size={28} className="flex-shrink-0" />
              <div className="text-left flex-1">
                <p className="font-bold">Присоединиться</p>
                <p className="text-xs text-muted-foreground font-normal">У меня есть приглашение</p>
              </div>
            </Button>
            <Button 
              onClick={() => setStep('employee_login')} 
              variant="outline"
              className="w-full h-auto py-4 text-base flex items-center gap-4 touch-target"
            >
              <Icon name="LogIn" size={28} className="flex-shrink-0" />
              <div className="text-left flex-1">
                <p className="font-bold">Войти</p>
                <p className="text-xs text-muted-foreground font-normal">Я уже зарегистрирован</p>
              </div>
            </Button>
            <Button 
              onClick={handleClearOldData} 
              variant="ghost"
              className="w-full text-xs text-muted-foreground h-10 mt-2 touch-target"
            >
              <Icon name="RefreshCw" size={14} className="mr-2" />
              Очистить старые данные
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'chef_register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 safe-top safe-bottom">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader>
            <Button 
              variant="ghost" 
              onClick={() => setStep('choice')}
              className="w-fit mb-2 h-10 touch-target"
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
            <CardTitle className="text-xl sm:text-2xl">Создание ресторана</CardTitle>
            <p className="text-sm text-muted-foreground">Регистрация шеф-повара</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="chef-name" className="text-base">Ваше ФИО</Label>
              <Input
                id="chef-name"
                placeholder="Иван Иванов"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurant-name" className="text-base">Название ресторана</Label>
              <Input
                id="restaurant-name"
                placeholder="Моя кухня"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <Button onClick={handleCreateRestaurant} className="w-full h-12 text-base touch-target">
              Создать ресторан
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'employee_login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 safe-top safe-bottom">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader>
            <Button 
              variant="ghost" 
              onClick={() => setStep('choice')}
              className="w-fit mb-2 h-10 touch-target"
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
            <CardTitle className="text-xl sm:text-2xl">Вход в систему</CardTitle>
            <p className="text-sm text-muted-foreground">Введите данные для входа</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="login-name" className="text-base">Ваше ФИО</Label>
              <Input
                id="login-name"
                placeholder="Иван Иванов"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-invite" className="text-base">Код ресторана</Label>
              <Input
                id="login-invite"
                placeholder="Введите код"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="h-12 text-base"
              />
            </div>
            <Button onClick={handleLoginExisting} className="w-full h-12 text-base touch-target">
              Войти
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Не знаете код ресторана? Спросите у шефа
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4 safe-top safe-bottom">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader>
          <Button 
            variant="ghost" 
            onClick={() => setStep('choice')}
            className="w-fit mb-2 h-10 touch-target"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          <CardTitle className="text-xl sm:text-2xl">Присоединение к ресторану</CardTitle>
          <p className="text-sm text-muted-foreground">Регистрация сотрудника</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="employee-name" className="text-base">Ваше ФИО</Label>
            <Input
              id="employee-name"
              placeholder="Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-base">Ваша должность</Label>
            <div className="grid gap-2">
              {[
                { id: 'sous_chef', label: 'Су-шеф', icon: 'Users' },
                { id: 'cook', label: 'Повар-универсал', icon: 'Utensils' },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id as 'sous_chef' | 'cook')}
                  className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 touch-target ${
                    selectedRole === role.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border active:border-primary/50'
                  }`}
                >
                  <Icon name={role.icon} size={22} />
                  <span className="font-medium text-base">{role.label}</span>
                  {selectedRole === role.id && (
                    <Icon name="CheckCircle2" size={22} className="text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-code" className="text-base">Код приглашения</Label>
            <Input
              id="invite-code"
              placeholder="ABC123XY"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="uppercase h-12 text-base"
            />
          </div>

          <Button onClick={handleJoinRestaurant} className="w-full h-12 text-base touch-target">
            Присоединиться
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;