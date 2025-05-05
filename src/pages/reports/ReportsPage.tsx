
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MoreHorizontal, 
  PlusCircle, 
  Edit, 
  Eye,
  Trash, 
  FileText, 
  Calendar, 
  AlertCircle,
  CheckCircle
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
import { Report, apiClient } from "@/components/api/apiClient";
import { useToast } from "@/components/ui/toast";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Получение токена из localStorage (в реальном приложении используйте более безопасное хранилище)
  const token = localStorage.getItem("token") || "fake-token";

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const reportsData = await apiClient.getReports(token);
      setReports(reportsData);
    } catch (error) {
      console.error("Ошибка при загрузке отчетов:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список отчетов",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/reports/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteReportId) return;
    
    try {
      await apiClient.deleteReport(token, deleteReportId);
      setReports(reports.filter(report => report.id !== deleteReportId));
      toast({
        title: "Успешно",
        description: "Отчет был удален",
      });
    } catch (error) {
      console.error("Ошибка при удалении отчета:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить отчет",
        variant: "destructive",
      });
    } finally {
      setDeleteReportId(null);
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

  // Получение названий типов отчетов
  const getReportTypeName = (type: Report['type']) => {
    switch (type) {
      case 'sales': return 'Продажи';
      case 'clients': return 'Клиенты';
      case 'products': return 'Товары';
      case 'financial': return 'Финансы';
      default: return type;
    }
  };

  // Получение статусов отчетов
  const getStatusInfo = (status: Report['status']) => {
    switch (status) {
      case 'published':
        return { 
          icon: <CheckCircle className="h-4 w-4" />, 
          text: 'Опубликован', 
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      case 'draft':
        return { 
          icon: <AlertCircle className="h-4 w-4" />, 
          text: 'Черновик', 
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        };
      default:
        return { 
          icon: null, 
          text: status, 
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        };
    }
  };

  // Определяем столбцы таблицы
  const columns: DataTableColumn<Report>[] = [
    {
      key: "title",
      header: "Название",
      sortable: true
    },
    {
      key: "type",
      header: "Тип",
      sortable: true,
      cell: (report) => getReportTypeName(report.type)
    },
    {
      key: "status",
      header: "Статус",
      sortable: true,
      cell: (report) => {
        const { icon, text, className } = getStatusInfo(report.status);
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${className}`}>
            {icon}
            {text}
          </span>
        );
      }
    },
    {
      key: "dateRange",
      header: "Период",
      sortable: false,
      cell: (report) => `${formatDate(report.dateRange.from)} - ${formatDate(report.dateRange.to)}`,
      hidden: window.innerWidth < 768 // Скрываем на мобильных
    },
    {
      key: "createdAt",
      header: "Дата создания",
      sortable: true,
      cell: (report) => formatDate(report.createdAt),
      hidden: window.innerWidth < 768 // Скрываем на мобильных
    }
  ];

  // Определяем фильтры
  const filterOptions = [
    {
      key: "type",
      label: "Тип",
      options: [
        { value: "sales", label: "Продажи" },
        { value: "clients", label: "Клиенты" },
        { value: "products", label: "Товары" },
        { value: "financial", label: "Финансы" }
      ]
    },
    {
      key: "status",
      label: "Статус",
      options: [
        { value: "published", label: "Опубликован" },
        { value: "draft", label: "Черновик" }
      ]
    }
  ];

  // Рендер действий для строки
  const renderRowActions = (report: Report) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Действия</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/reports/view/${report.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          Просмотр
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEdit(report.id)}>
          <Edit className="mr-2 h-4 w-4" />
          Редактировать
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-red-600 focus:text-red-600"
          onClick={() => setDeleteReportId(report.id)}
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
            <CardTitle className="text-2xl">Отчеты</CardTitle>
            <CardDescription>
              Управляйте отчетами и аналитическими данными в системе
            </CardDescription>
          </div>
          <Button 
            onClick={() => navigate("/reports/create")} 
            className="whitespace-nowrap"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Создать отчет
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={reports}
            columns={columns}
            loading={loading}
            searchPlaceholder="Поиск отчетов..."
            noDataMessage="Нет добавленных отчетов"
            filterOptions={filterOptions}
            renderRowActions={renderRowActions}
          />
        </CardContent>
      </Card>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={!!deleteReportId} onOpenChange={() => setDeleteReportId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Отчет будет навсегда удален из системы.
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

export default ReportsPage;
