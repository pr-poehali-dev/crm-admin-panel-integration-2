
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft,
  Save,
  Calendar
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { apiClient, Report } from "@/components/api/apiClient";
import { useToast } from "@/components/ui/toast";

type ReportFormProps = {
  mode: "create" | "edit";
};

const initialState: Omit<Report, "id" | "createdAt" | "data"> = {
  title: "",
  type: "sales",
  status: "draft",
  description: "",
  dateRange: {
    from: new Date().toISOString(),
    to: new Date().toISOString()
  }
};

const ReportForm = ({ mode }: ReportFormProps) => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<Report, "id" | "createdAt" | "data">>(initialState);
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();
  const { toast } = useToast();

  // Получение токена из localStorage (в реальном приложении используйте более безопасное хранилище)
  const token = localStorage.getItem("token") || "fake-token";

  useEffect(() => {
    if (mode === "edit" && id) {
      fetchReport(id);
    }
  }, [mode, id]);

  const fetchReport = async (reportId: string) => {
    try {
      setLoading(true);
      const report = await apiClient.getReport(token, reportId);
      
      // Исключаем id, createdAt и data из данных формы
      const { id, createdAt, data, ...formData } = report;
      setFormData(formData);
      
      // Установка дат для календаря
      if (report.dateRange) {
        setFromDate(new Date(report.dateRange.from));
        setToDate(new Date(report.dateRange.to));
      }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: Report['type']) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const handleStatusChange = (value: Report['status']) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleFromDateChange = (date: Date | undefined) => {
    if (date) {
      setFromDate(date);
      // Обновляем формат даты для API
      setFormData(prev => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          from: date.toISOString()
        }
      }));
    }
  };

  const handleToDateChange = (date: Date | undefined) => {
    if (date) {
      setToDate(date);
      // Обновляем формат даты для API
      setFormData(prev => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          to: date.toISOString()
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({
        title: "Ошибка",
        description: "Введите название отчета",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      
      if (mode === "create") {
        await apiClient.createReport(token, formData);
        toast({
          title: "Успешно",
          description: "Отчет успешно создан",
        });
      } else if (mode === "edit" && id) {
        await apiClient.updateReport(token, id, formData);
        toast({
          title: "Успешно",
          description: "Данные отчета обновлены",
        });
      }
      
      navigate("/reports");
    } catch (error) {
      console.error("Ошибка при сохранении отчета:", error);
      toast({
        title: "Ошибка",
        description: mode === "create" 
          ? "Не удалось создать отчет" 
          : "Не удалось обновить данные отчета",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Форматирование даты для отображения
  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'PPP', { locale: ru });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {mode === "create" ? "Создание нового отчета" : "Редактирование отчета"}
              </CardTitle>
              <CardDescription>
                {mode === "create" 
                  ? "Заполните информацию о новом отчете" 
                  : "Измените информацию об отчете"}
              </CardDescription>
            </div>
            <Button 
              type="button" 
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
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название отчета</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Введите название отчета"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Тип отчета</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleTypeChange(value as Report['type'])}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Выберите тип отчета" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Продажи</SelectItem>
                        <SelectItem value="clients">Клиенты</SelectItem>
                        <SelectItem value="products">Товары</SelectItem>
                        <SelectItem value="financial">Финансы</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Начало периода</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {fromDate ? formatDateDisplay(fromDate) : "Выберите дату"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={fromDate}
                          onSelect={handleFromDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Конец периода</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {toDate ? formatDateDisplay(toDate) : "Выберите дату"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={toDate}
                          onSelect={handleToDateChange}
                          initialFocus
                          disabled={(date) => date < (fromDate || new Date())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Статус</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleStatusChange(value as Report['status'])}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Черновик</SelectItem>
                        <SelectItem value="published">Опубликован</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Введите описание отчета"
                    value={formData.description || ""}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/reports")}
              disabled={saving}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={saving || loading}>
              {saving ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ReportForm;
