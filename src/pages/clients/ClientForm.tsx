
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft,
  Save
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { apiClient, Client } from "@/components/api/apiClient";
import { useToast } from "@/components/ui/toast";

type ClientFormProps = {
  mode: "create" | "edit";
};

const initialState: Omit<Client, "id" | "createdAt"> = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "active"
};

const ClientForm = ({ mode }: ClientFormProps) => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<Client, "id" | "createdAt">>(initialState);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Получение токена из localStorage (в реальном приложении используйте более безопасное хранилище)
  const token = localStorage.getItem("token") || "fake-token";

  useEffect(() => {
    if (mode === "edit" && id) {
      fetchClient(id);
    }
  }, [mode, id]);

  const fetchClient = async (clientId: string) => {
    try {
      setLoading(true);
      const client = await apiClient.getClient(token, clientId);
      
      // Исключаем id и createdAt из данных формы
      const { id, createdAt, ...formData } = client;
      setFormData(formData);
    } catch (error) {
      console.error("Ошибка при загрузке данных клиента:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные клиента",
        variant: "destructive",
      });
      navigate("/clients");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: "active" | "inactive") => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      if (mode === "create") {
        await apiClient.createClient(token, formData);
        toast({
          title: "Успешно",
          description: "Клиент успешно создан",
        });
      } else if (mode === "edit" && id) {
        await apiClient.updateClient(token, id, formData);
        toast({
          title: "Успешно",
          description: "Данные клиента обновлены",
        });
      }
      
      navigate("/clients");
    } catch (error) {
      console.error("Ошибка при сохранении клиента:", error);
      toast({
        title: "Ошибка",
        description: mode === "create" 
          ? "Не удалось создать клиента" 
          : "Не удалось обновить данные клиента",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {mode === "create" ? "Создание нового клиента" : "Редактирование клиента"}
              </CardTitle>
              <CardDescription>
                {mode === "create" 
                  ? "Заполните информацию о новом клиенте" 
                  : "Измените информацию о клиенте"}
              </CardDescription>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/clients")}
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
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Введите имя клиента"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+7 (XXX) XXX-XX-XX"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Компания</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Название компании"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Статус</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleStatusChange(value as "active" | "inactive")}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активен</SelectItem>
                      <SelectItem value="inactive">Неактивен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/clients")}
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

export default ClientForm;
