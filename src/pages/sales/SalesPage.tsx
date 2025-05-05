
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MoreHorizontal, 
  PlusCircle, 
  Edit, 
  Eye,
  Trash, 
  CheckCircle, 
  Clock, 
  XCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
import { Sale, apiClient } from "@/components/api/apiClient";
import { useToast } from "@/components/ui/toast";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";

const SalesPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteSaleId, setDeleteSaleId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Получение токена из localStorage (в реальном приложении используйте более безопасное хранилище)
  const token = localStorage.getItem("token") || "fake-token";

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const salesData = await apiClient.getSales(token);
      setSales(salesData);
    } catch (error) {
      console.error("Ошибка при загрузке продаж:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список продаж",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/sales/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteSaleId) return;
    
    try {
      await apiClient.deleteSale(token, deleteSaleId);
      setSales(sales.filter(sale => sale.id !== deleteSaleId));
      toast({
        title: "Успешно",
        description: "Продажа была удалена",
      });
    } catch (error) {
      console.error("Ошибка при удалении продажи:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить продажу",
        variant: "destructive",
      });
    } finally {
      setDeleteSaleId(null);
    }
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

  // Получение икон и цветов для статусов
  const getStatusInfo = (status: Sale['status']) => {
    switch (status) {
      case 'completed':
        return { 
          icon: <CheckCircle className="h-4 w-4" />, 
          text: 'Завершена', 
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      case 'pending':
        return { 
          icon: <Clock className="h-4 w-4" />, 
          text: 'В процессе', 
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        };
      case 'cancelled':
        return { 
          icon: <XCircle className="h-4 w-4" />, 
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

  // Определяем столбцы таблицы
  const columns: DataTableColumn<Sale>[] = [
    {
      key: "id",
      header: "ID продажи",
      sortable: true
    },
    {
      key: "clientId",
      header: "ID клиента",
      sortable: true
    },
    {
      key: "amount",
      header: "Сумма",
      sortable: true,
      cell: (sale) => formatAmount(sale.amount)
    },
    {
      key: "status",
      header: "Статус",
      sortable: true,
      cell: (sale) => {
        const { icon, text, className } = getStatusInfo(sale.status);
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${className}`}>
            {icon}
            {text}
          </span>
        );
      }
    },
    {
      key: "date",
      header: "Дата",
      sortable: true,
      cell: (sale) => formatDate(sale.date),
      hidden: window.innerWidth < 768 // Скрываем на мобильных
    }
  ];

  // Определяем фильтры
  const filterOptions = [
    {
      key: "status",
      label: "Статус",
      options: [
        { value: "completed", label: "Завершена" },
        { value: "pending", label: "В процессе" },
        { value: "cancelled", label: "Отменена" }
      ]
    }
  ];

  // Рендер действий для строки
  const renderRowActions = (sale: Sale) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Действия</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/sales/view/${sale.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          Просмотр
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEdit(sale.id)}>
          <Edit className="mr-2 h-4 w-4" />
          Редактировать
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-red-600 focus:text-red-600"
          onClick={() => setDeleteSaleId(sale.id)}
        >
          <Trash className="mr-2 h-4 w-4" />
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Продажи</CardTitle>
            <CardDescription>
              Управляйте продажами и заказами в вашей системе
            </CardDescription>
          </div>
          <Button 
            onClick={() => navigate("/sales/create")} 
            className="whitespace-nowrap"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить продажу
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={sales}
            columns={columns}
            loading={loading}
            searchPlaceholder="Поиск продаж..."
            noDataMessage="Нет добавленных продаж"
            filterOptions={filterOptions}
            renderRowActions={renderRowActions}
          />
        </CardContent>
      </Card>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={!!deleteSaleId} onOpenChange={() => setDeleteSaleId(null)}>
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

export default SalesPage;
