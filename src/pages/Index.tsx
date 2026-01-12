import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import JobMap from '@/components/JobMap';
import { calculateDistance, formatDistance } from '@/lib/distance';

const Index = () => {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [salaryRange, setSalaryRange] = useState([0, 100000]);
  const [distance, setDistance] = useState([5]);
  const [jobType, setJobType] = useState('all');
  const [activeTab, setActiveTab] = useState('jobs');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [favoriteJobs, setFavoriteJobs] = useState<number[]>([]);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [applicationJobId, setApplicationJobId] = useState<number | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showJobDetail, setShowJobDetail] = useState(false);

  useEffect(() => {
    if ('geolocation' in navigator) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Не удалось получить местоположение');
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError('Геолокация не поддерживается');
    }
  }, []);

  const jobs = [
    {
      id: 1,
      title: 'Курьер',
      company: 'Доставка 24/7',
      salary: '2000-3000 ₽/день',
      distance: '1.2 км',
      type: 'delivery',
      time: 'Полный день',
      badges: ['Срочно', 'Высокая оплата'],
      description: 'Требуется курьер для доставки заказов. Свободный график.',
      lat: 55.7558,
      lng: 37.6173,
    },
    {
      id: 2,
      title: 'Промоутер',
      company: 'Event Agency',
      salary: '1500 ₽/день',
      distance: '2.5 км',
      type: 'promo',
      time: '4 часа',
      badges: ['Вечер'],
      description: 'Раздача листовок в торговом центре.',
      lat: 55.7658,
      lng: 37.6273,
    },
    {
      id: 3,
      title: 'Водитель',
      company: 'TaxiGo',
      salary: '3000-5000 ₽/день',
      distance: '0.8 км',
      type: 'driving',
      time: 'Гибкий график',
      badges: ['Своя машина'],
      description: 'Поездки по городу. Процент от поездок.',
      lat: 55.7508,
      lng: 37.6123,
    },
    {
      id: 4,
      title: 'Помощник на складе',
      company: 'Склад №5',
      salary: '2500 ₽/день',
      distance: '3.1 км',
      type: 'warehouse',
      time: 'Утро',
      badges: ['Физическая работа'],
      description: 'Разгрузка, сортировка товара.',
      lat: 55.7608,
      lng: 37.6323,
    },
    {
      id: 5,
      title: 'Бариста',
      company: 'Coffee Story',
      salary: '1800 ₽/смена',
      distance: '1.5 км',
      type: 'service',
      time: 'Вечер',
      badges: ['Обучение'],
      description: 'Работа в кофейне. Обучим всему необходимому.',
      lat: 55.7528,
      lng: 37.6083,
    },
    {
      id: 6,
      title: 'Мерчендайзер',
      company: 'Retail Pro',
      salary: '2000 ₽/день',
      distance: '4.2 км',
      type: 'retail',
      time: 'День',
      badges: ['Опыт не важен'],
      description: 'Выкладка товара в магазинах.',
      lat: 55.7708,
      lng: 37.6423,
    },
  ];

  const messages = [
    { id: 1, from: 'Доставка 24/7', text: 'Здравствуйте! Готовы начать завтра?', time: '10:30', unread: true },
    { id: 2, from: 'Event Agency', text: 'Спасибо за отклик!', time: '09:15', unread: false },
    { id: 3, from: 'TaxiGo', text: 'Ждем вас на собеседование', time: 'Вчера', unread: true },
  ];

  const notifications = [
    { id: 1, text: 'Новая вакансия "Курьер" рядом с вами', time: '5 мин назад', type: 'new' },
    { id: 2, text: 'Ваш отклик просмотрен', time: '1 час назад', type: 'view' },
    { id: 3, text: 'Приглашение на собеседование', time: '2 часа назад', type: 'invite' },
  ];

  const jobsWithDistance = useMemo(() => {
    return jobs.map(job => {
      let calculatedDistance = parseFloat(job.distance);
      
      if (userLocation) {
        calculatedDistance = calculateDistance(
          userLocation[0],
          userLocation[1],
          job.lat,
          job.lng
        );
      }
      
      return {
        ...job,
        calculatedDistance,
        distance: formatDistance(calculatedDistance),
      };
    });
  }, [jobs, userLocation]);

  const filteredJobs = useMemo(() => {
    return jobsWithDistance.filter(job => {
      const salary = parseInt(job.salary.split('-')[0].replace(/\D/g, ''));
      
      if (jobType !== 'all' && job.type !== jobType) return false;
      if (salary < salaryRange[0] || salary > salaryRange[1]) return false;
      if (job.calculatedDistance > distance[0]) return false;
      
      return true;
    }).sort((a, b) => a.calculatedDistance - b.calculatedDistance);
  }, [jobsWithDistance, jobType, salaryRange, distance]);

  const handleApplyJob = (jobId: number) => {
    setApplicationJobId(jobId);
    setShowApplicationDialog(true);
  };

  const submitApplication = () => {
    if (applicationJobId) {
      setAppliedJobs([...appliedJobs, applicationJobId]);
      toast.success('Отклик отправлен!', {
        description: 'Работодатель получит ваше сообщение в ближайшее время',
      });
      setShowApplicationDialog(false);
      setApplicationMessage('');
      setApplicationJobId(null);
    }
  };

  const toggleFavorite = (jobId: number) => {
    if (favoriteJobs.includes(jobId)) {
      setFavoriteJobs(favoriteJobs.filter(id => id !== jobId));
      toast.info('Удалено из избранного');
    } else {
      setFavoriteJobs([...favoriteJobs, jobId]);
      toast.success('Добавлено в избранное');
    }
  };

  const handleQuickMessage = (jobId: number, company: string) => {
    toast.success('Сообщение отправлено', {
      description: `Вы написали ${company}`,
    });
  };

  const selectedJobData = filteredJobs.find(job => job.id === selectedJob);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Подработка
              </h1>
              <p className="text-muted-foreground mt-1">
                {userLocation ? (
                  <span className="flex items-center gap-1">
                    <Icon name="MapPin" size={14} className="text-blue-600" />
                    Показываем расстояние от вас
                  </span>
                ) : (
                  'Найди работу рядом с тобой'
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="relative">
                <Icon name="Bell" size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button variant="outline" size="icon">
                <Icon name="User" size={20} />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Поиск работы..." 
                className="pl-10 h-12 text-lg border-2 focus:border-primary"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" variant="outline" className="px-6">
                  <Icon name="SlidersHorizontal" size={20} className="mr-2" />
                  Фильтры
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Фильтры поиска</SheetTitle>
                  <SheetDescription>Настройте параметры для поиска подработки</SheetDescription>
                </SheetHeader>
                
                <div className="space-y-6 mt-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Тип работы</label>
                    <Select value={jobType} onValueChange={setJobType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все типы</SelectItem>
                        <SelectItem value="delivery">Доставка</SelectItem>
                        <SelectItem value="promo">Промо</SelectItem>
                        <SelectItem value="driving">Вождение</SelectItem>
                        <SelectItem value="warehouse">Склад</SelectItem>
                        <SelectItem value="service">Сервис</SelectItem>
                        <SelectItem value="retail">Ритейл</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Зарплата: {salaryRange[0]} - {salaryRange[1]} ₽
                    </label>
                    <Slider
                      min={0}
                      max={10000}
                      step={500}
                      value={salaryRange}
                      onValueChange={setSalaryRange}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Расстояние: до {distance[0]} км
                    </label>
                    <Slider
                      min={1}
                      max={10}
                      step={0.5}
                      value={distance}
                      onValueChange={setDistance}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Время работы</label>
                    <div className="flex flex-wrap gap-2">
                      {['Утро', 'День', 'Вечер', 'Ночь', 'Гибкий'].map(time => (
                        <Button key={time} variant="outline" size="sm">
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    Применить фильтры
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex gap-2 flex-wrap">
            {['Курьер', 'Промоутер', 'Водитель', 'Склад'].map(tag => (
              <Badge key={tag} variant="secondary" className="px-4 py-2 text-sm hover:bg-secondary/80 cursor-pointer">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 h-14">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Icon name="Briefcase" size={18} />
              Вакансии
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Icon name="Map" size={18} />
              Карта
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2 relative">
              <Icon name="MessageSquare" size={18} />
              Чаты
              <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">2</Badge>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 relative">
              <Icon name="Bell" size={18} />
              Уведомления
              <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">3</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">
                Найдено {filteredJobs.length} {filteredJobs.length === 1 ? 'вакансия' : 'вакансий'}
              </p>
              <Select defaultValue="distance">
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">По расстоянию</SelectItem>
                  <SelectItem value="salary">По зарплате</SelectItem>
                  <SelectItem value="date">По дате</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job, index) => (
                <Card 
                  key={job.id} 
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 border-2 hover:border-primary animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedJob(job.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                        {job.title[0]}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Icon name="MapPin" size={12} className="mr-1" />
                        {job.distance}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-heading">{job.title}</CardTitle>
                    <CardDescription>{job.company}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                        <Icon name="DollarSign" size={18} />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="Clock" size={16} />
                        {job.time}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.badges.map(badge => (
                          <Badge key={badge} className="bg-accent">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full" size="lg">
                        Откликнуться
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="animate-fade-in">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-[600px]">
                  {isLoadingLocation && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Определяю ваше местоположение...</span>
                    </div>
                  )}
                  {locationError && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-destructive text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Icon name="AlertCircle" size={16} />
                      <span className="text-sm font-medium">{locationError}</span>
                    </div>
                  )}
                  {userLocation && (
                    <div className="absolute top-4 left-4 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <Icon name="Navigation" size={16} />
                      <span className="text-sm font-medium">Вы на карте</span>
                    </div>
                  )}
                  <JobMap 
                    jobs={filteredJobs} 
                    userLocation={userLocation}
                    onJobClick={(jobId) => {
                      setSelectedJob(jobId);
                      setActiveTab('jobs');
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4 animate-fade-in">
            {messages.map(message => (
              <Card key={message.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {message.from[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{message.from}</h3>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.text}</p>
                    </div>
                    {message.unread && (
                      <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 animate-fade-in">
            {notifications.map(notification => (
              <Card key={notification.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'new' ? 'bg-green-100 text-green-600' :
                      notification.type === 'view' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Icon name={
                        notification.type === 'new' ? 'Sparkles' :
                        notification.type === 'view' ? 'Eye' : 'Mail'
                      } size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">{notification.text}</p>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;