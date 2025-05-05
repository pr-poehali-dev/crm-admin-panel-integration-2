
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart, Activity, Users, ShoppingCart, AreaChart, FileText } from "lucide-react";
import { apiClient, DashboardStats } from "@/components/api/apiClient";
import { useToast } from "@/components/ui/toast";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Получение токена из localStorage (в реальном приложении используйте более безопасное хранилище)
  const token = localStorage.getItem("token") || "fake-token";

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDashboardStats(token);
      setStats(data);
    } catch (error) {
      console.error("Ошибка при загрузке статистики:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статистику дашборда",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Шапка */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            CRM Администратор
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              Настройки
            </Button>
            <Button variant="outline" size="sm">
              Профиль
            </Button>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="container mx-auto px-4 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Клиентов</p>
                <h3 className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ) : (
                    stats?.clientsCount || 0
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Продажи</p>
                <h3 className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ) : (
                    stats?.salesCount || 0
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Отчеты</p>
                <h3 className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ) : (
                    stats?.tasksCount || 0
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                <AreaChart className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Доход</p>
                <h3 className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ) : (
                    formatAmount(stats?.totalRevenue || 0)
                  )}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Вкладки */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Клиенты
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Продажи
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Отчеты
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Последние продажи</CardTitle>
                  <CardDescription>Статистика продаж за последние 7 дней</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded-md bg-gray-50 dark:bg-gray-800">
                    <LineChart className="h-16 w-16 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Активность клиентов</CardTitle>
                  <CardDescription>Распределение активности за текущий месяц</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border rounded-md bg-gray-50 dark:bg-gray-800">
                    <BarChart className="h-16 w-16 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Последние транзакции</CardTitle>
                <CardDescription>Список последних транзакций в системе</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ))}
                  </div>
                ) : stats?.recentSales && stats.recentSales.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left font-medium text-gray-500">ID</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-500">Клиент</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-500">Сумма</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-500">Статус</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-500">Дата</th>
                          <th className="px-6 py-3 text-left font-medium text-gray-500"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {stats.recentSales.map((sale) => (
                          <tr key={sale.id} className="bg-white dark:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">{sale.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{sale.clientId}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatAmount(sale.amount)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                ${sale.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                  sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`}>
                                {sale.status === 'completed' ? 'Завершена' : 
                                 sale.status === 'pending' ? 'В процессе' : 'Отменена'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(sale.date)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Link to={`/sales/view/${sale.id}`}>
                                <Button variant="ghost" size="sm">Детали</Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Нет доступных транзакций
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Список клиентов</CardTitle>
                  <CardDescription>Управление клиентами в системе</CardDescription>
                </div>
                <Link to="/clients">
                  <Button>Перейти к клиентам</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex flex-col items-center justify-center text-center gap-4">
                  <Users className="h-12 w-12 text-gray-400" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Управление клиентами</h3>
                    <p className="text-gray-500">Перейдите в раздел "Клиенты", чтобы просматривать, добавлять и редактировать клиентов</p>
                  </div>
                  <Link to="/clients/create">
                    <Button>
                      <Users className="mr-2 h-4 w-4" />
                      Добавить клиента
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Управление продажами</CardTitle>
                  <CardDescription>Обзор и управление продажами</CardDescription>
                </div>
                <Link to="/sales">
                  <Button>Перейти к продажам</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex flex-col items-center justify-center text-center gap-4">
                  
                  <ShoppingCart className="h-12 w-12 text-gray-400" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Управление продажами</h3>
                    <p className="text-gray-500">Перейдите в раздел "Продажи", чтобы просматривать и добавлять продажи</p>
                  </div>
                  <Link to="/sales/create">
                    <Button>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Добавить продажу
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Отчеты и аналитика</CardTitle>
                  <CardDescription>Просмотр отчетов и аналитических данных</CardDescription>
                </div>
                <Link to="/reports">
                  <Button>Перейти к отчетам</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex flex-col items-center justify-center text-center gap-4">
                  <FileText className="h-12 w-12 text-gray-400" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Управление отчетами</h3>
                    <p className="text-gray-500">Перейдите в раздел "Отчеты", чтобы просматривать и создавать отчеты</p>
                  </div>
                  <Link to="/reports/create">
                    <Button>
                      <FileText className="mr-2 h-4 w-4" />
                      Создать отчет
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
