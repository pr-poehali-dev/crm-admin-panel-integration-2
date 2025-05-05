
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft,
  Edit,
  Trash,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Calendar,
  Tag
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiClient, Sale, Client } from "@/components/api/apiClient";
import { useToast } from "@/components/ui/toast";

const SaleView = () => {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Получение токена из localStorage (в реальном приложении используйте более безопасное хранилище)
  const token = localStorage.getItem("token") || "fake-token";

  useEffect(() => {
    if (id) {
      fetchSale(id);
    }
  }, [id]);

  const fetchSale = async (saleId: string) => {
    try {
      setLoading(true);
      const saleData = await apiClient.getSale(token, saleId);
      setSale(saleData);
      
      // Загружаем информацию о клиенте
      if (saleData.clientId) {
        fetchClient(saleData.clientId);
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных продажи:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные продажи",
        variant: "destructive",
      });
      navigate("/sales");
    } finally {
      setLoading(false);
    }
  };

  const fetchClient = async (clientId: string) => {
    try {
      const clientData = await apiClient.getClient(token, clientId);
      setClient(clientData);
    } catch (error) {
      console.error("Ошибка при загрузке данных клиента:", error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await apiClient.deleteSale(token, id);
      toast({
        title: "Успешно",
        description: "Продажа была удалена",
      });
      navigate("/sales");
    } catch (error) {
      console.error("Ошибка при удалении продажи:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить продажу",
        variant: "destructive",
      });
    } finally {
      setOpenDelete(false);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Получение информации о статусе
  const getStatusInfo = (status: Sale['status']) => {
    switch (status) {
      case 'completed':
        return { 
          icon: <CheckCircle className="h-5 w-5" />, 
          text: 'Завершена', 
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      case 'pending':
        return { 
          icon: <Clock className="h-5 w-5" />, 
          text: 'В процессе', 
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        };
      case 'cancelled':
        return { 
          icon: <XCircle className="h-5 w-5" />, 
          text: 'Отменена', 
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
      default:
        return { 
          icon: null, 
          text: status, 
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        };
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Информация о продаже</CardTitle>
            <CardDescription>
              Просмотр подробной информации о продаже
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/sales")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к списку
          </Button>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sale ? (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">ID продажи</div>
                  <div className="text-xl font-semibold">{sale.id}</div>
                </div>
                
                {sale.status && (
                  <div className="flex">
                    {(() => {
                      const { icon, text, className } = getStatusInfo(sale.status);
                      return (
                        <span className={`inline-flex items-center gap-2 px-4 py-2 font-medium rounded-full ${className}`}>
                          {icon}
                          {text}
                        </span>
                      );
                    })()}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    <span>Клиент</span>
                  </div>
                  {client ? (
                    <div className="p-3 border rounded-md">
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                      {client.phone && <div className="text-sm text-gray-500">{client.phone}</div>}
                    </div>
                  ) : (
                    <div className="p-3 border rounded-md">
                      <div className="font-medium">ID: {sale.clientId}</div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Дата продажи</span>
                  </div>
                  <div className="p-3 border rounded-md">
                    {formatDate(sale.date)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Tag className="h-4 w-4 mr-2" />
                    <span>Сумма</span>
                  </div>
                  <div className="p-3 border rounded-md font-bold text-lg">
                    {formatAmount(sale.amount)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Товары</h3>
                
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Название</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Цена</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Количество</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">Сумма</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sale.products.map((product) => (
                        <tr key={product.id} className="bg-white dark:bg-gray-700">
                          <td className="px-4 py-3">{product.name}</td>
                          <td className="px-4 py-3">{formatAmount(product.price)}</td>
                          <td className="px-4 py-3">{product.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatAmount(product.price * product.quantity)}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 dark:bg-gray-800 font-medium">
                        <td colSpan={3} className="px-4 py-3 text-right">Итого:</td>
                        <td className="px-4 py-3 text-right">{formatAmount(sale.amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">Продажа не найдена</p>
          )}
        </CardContent>
        
        {sale && (
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Удалить
            </Button>
            <Button
              onClick={() => navigate(`/sales/edit/${id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Продажа будет навсегда удалена из системы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SaleView;
