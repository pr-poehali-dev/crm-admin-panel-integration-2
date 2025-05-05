
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart, Activity, Users, ShoppingCart, AreaChart } from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
                <h3 className="text-2xl font-bold">1,248</h3>
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
                <h3 className="text-2xl font-bold">642</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <Activity className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Задачи</p>
                <h3 className="text-2xl font-bold">24</h3>
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
                <h3 className="text-2xl font-bold">₽1.2M</h3>
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
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">ID</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">Клиент</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">Сумма</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">Статус</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500">Дата</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <tr key={item} className="bg-white dark:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">#TRX-{1000 + item}</td>
                          <td className="px-6 py-4 whitespace-nowrap">Клиент {item}</td>
                          <td className="px-6 py-4 whitespace-nowrap">₽{(Math.random() * 10000).toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Завершено
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">05.05.2025</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                <Button>+ Добавить клиента</Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Содержимое вкладки "Клиенты" будет разработано на следующем этапе
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Управление продажами</CardTitle>
                <CardDescription>Обзор и управление продажами</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Содержимое вкладки "Продажи" будет разработано на следующем этапе
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Отчеты и аналитика</CardTitle>
                <CardDescription>Просмотр отчетов и аналитических данных</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Содержимое вкладки "Отчеты" будет разработано на следующем этапе
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
