
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft,
  Edit,
  Trash,
  Check,
  X,
  Phone,
  Mail,
  Building
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
import { apiClient, Client } from "@/components/api/apiClient";
import { useToast } from "@/components/ui/toast";

const ClientView = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Получение токена из localStorage (в реальном приложении используйте более безопасное хранилище)
  const token = localStorage.getItem("token") || "fake-token";

  useEffect(() => {
    if (id) {
      fetchClient(id);
    }
  }, [id]);

  const fetchClient = async (clientId: string) => {
    try {
      setLoading(true);
      const clientData = await apiClient.getClient(token, clientId);
      setClient(clientData);
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

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await apiClient.deleteClient(token, id);
      toast({
        title: "Успешно",
        description: "Клиент был удален",
      });
      navigate("/clients");
    } catch (error) {
      console.error("Ошибка при удалении клиента:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить клиента",
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Информация о клиенте</CardTitle>
            <CardDescription>
              Просмотр подробной информации о клиенте
            </CardDescription>
          </div>
          <Button 
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
          ) : client ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{client.name}</h2>
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${
                  client.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                }`}>
                  {client.status === 'active' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {client.status === 'active' ? 'Активен' : 'Неактивен'}
                </span>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p>{client.email}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">Телефон</span>
                  </div>
                  <p>{client.phone || "Не указан"}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="text-sm">Компания</span>
                  </div>
                  <p>{client.company || "Не указана"}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-500">
                    <span className="text-sm">Дата создания</span>
                  </div>
                  <p>{formatDate(client.createdAt)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">Клиент не найден</p>
          )}
        </CardContent>
        
        {client && (
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={() => setOpenDelete(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Удалить
            </Button>
            <Button
              onClick={() => navigate(`/clients/edit/${id}`)}
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
              Это действие нельзя отменить. Клиент будет навсегда удален из системы.
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

export default ClientView;
