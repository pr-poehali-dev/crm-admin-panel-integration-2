
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft,
  Edit,
  Trash,
  FileText,
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart,
  LineChart,
  PieChart
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
import { apiClient, Report } from "@/components/api/apiClient";
import { useToast } from "@/components/ui/toast";

const ReportView = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Получение токена из localStorage (в реальном приложении используйте более безопасное хранилище)
  const token = localStorage.getItem("token") || "fake-token";

  useEffect(() => {
    if (id) {
      fetchReport(id);
    }
  }, [id]);

  const fetchReport = async (reportId: string) => {
    try {
      setLoading(true);
      const reportData = await apiClient.getReport(token, reportId);
      setReport(reportData);
    } catch (error) {
      console.error("Ошибка при загрузке данных отчета:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные отчета",
        variant: "destructive",
      });
      navigate("/reports");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!id) return;
    
    try {
      setGenerating(true);
      const updatedReport = await apiClient.generateReportData(token, id);
      setReport(updatedReport);
      toast({
        title: "Успешно",
        description: "Данные отчета сгенерированы",
      });
    } catch (error) {
      console.error("Ошибка при генерации данных отчета:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сгенерировать данные отчета",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await apiClient.deleteReport(token, id);
      toast({
        title: "Успешно",
        description: "Отчет был удален",
      });
      navigate("/reports");
    } catch (error) {
      console.error("Ошибка при удалении отчета:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить отчет",
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

  // Получение названия типа отчета
  const getReportTypeName = (type: Report['type']) => {
    switch (type) {
      case 'sales': return 'Продажи';
      case 'clients': return 'Клиенты';
      case 'products': return 'Товары';
      case 'financial': return 'Финансы';
      default: return type;
    }
  };

  // Получение иконки для типа отчета
  const getReportTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'sales': return <BarChart className="h-5 w-5" />;
      case 'clients': return <PieChart className="h-5 w-5" />;
      case 'products': return <BarChart className="h-5 w-5" />;
      case 'financial': return <LineChart className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  // Получение информации о статусе
  const getStatusInfo = (status: Report['status']) => {
    switch (status) {
      case 'published':
        return { 
          icon: <CheckCircle className="h-5 w-5" />, 
          text: 'Опубликован', 
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      case 'draft':
        return { 
          icon: <AlertCircle className="h-5 w-5" />, 
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Просмотр отчета</CardTitle>
            <CardDescription>
              Просмотр детальной информации об отчете
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/reports")}
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
          ) : report ? (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Название отчета</div>
                  <div className="flex items-center gap-2 text-xl font-semibold">
                    {getReportTypeIcon(report.type)}
                    {report.title}
                  </div>
                </div>
                
                {report.status && (
                  <div className="flex">
                    {(() => {
                      const { icon, text, className } = getStatusInfo(report.status);
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
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Тип отчета</span>
                  </div>
                  <div className="p-3 border rounded-md">
                    {getReportTypeName(report.type)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Период отчета</span>
                  </div>
                  <div className="p-3 border rounded-md">
                    {formatDate(report.dateRange.from)} — {formatDate(report.dateRange.to)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Дата создания</span>
                  </div>
                  <div className="p-3 border rounded-md">
                    {formatDate(report.createdAt)}
                  </div>
                </div>
              </div>
              
              {report.description && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Описание</div>
                  <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                    {report.description}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Данные отчета</h3>
                  <Button 
                    variant="outline" 
                    onClick={handleGenerateReport}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Генерация...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Обновить данные
                      </>
                    )}
                  </Button>
                </div>
                
                {report.data ? (
                  <div className="border rounded-md h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <div className="text-center p-6">
                      <div className="mb-4">
                        {report.type === 'sales' && <BarChart className="h-16 w-16 mx-auto text-gray-400" />}
                        {report.type === 'clients' && <PieChart className="h-16 w-16 mx-auto text-gray-400" />}
                        {report.type === 'products' && <BarChart className="h-16 w-16 mx-auto text-gray-400" />}
                        {report.type === 'financial' && <LineChart className="h-16 w-16 mx-auto text-gray-400" />}
                      </div>
                      <p className="text-gray-500">
                        Здесь будет отображаться график с данными отчета.<br />
                        Данные уже сгенерированы.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-md h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <div className="text-center p-6">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">
                        Данные отчета еще не сгенерированы.<br />
                        Нажмите кнопку "Обновить данные" для генерации.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">Отчет не найден</p>
          )}
        </CardContent>
        
        {report && (
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Удалить
            </Button>
            <Button
              onClick={() => navigate(`/reports/edit/${id}`)}
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

export default ReportView;
