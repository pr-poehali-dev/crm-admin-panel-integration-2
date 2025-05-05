
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MoreHorizontal, 
  PlusCircle, 
  Edit, 
  Trash, 
  Eye,
  Check, 
  X
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
import { Client, apiClient } from "@/components/api/apiClient";
import { useToast } from "@/components/ui/toast";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Получение токена из localStorage (в реальном приложении используйте более безопасное хранилище)
  const token = localStorage.getItem("token") || "fake-token";

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const clientsData = await apiClient.getClients(token);
      setClients(clientsData);
    } catch (error) {
      console.error("Ошибка при загрузке клиентов:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список клиентов",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/clients/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteClientId) return;
    
    try {
      await apiClient.deleteClient(token, deleteClientId);
      setClients(clients.filter(client => client.id !== deleteClientId));
      toast({
        title: "Успешно",
        description: "Клиент был удален",
      });
    } catch (error) {
      console.error("Ошибка при удалении клиента:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить клиента",
        variant: "destructive",
      });
    } finally {
      setDeleteClientId(null);
    }
  };

  // Определяем столбцы таблицы
  const columns: DataTableColumn<Client>[] = [
    {
      key: "name",
      header: "Имя",
      sortable: true
    },
    {
      key: "email",
      header: "Email",
      sortable: true
    },
    {
      key: "phone",
      header: "Телефон",
      hidden: window.innerWidth < 768 // Скрываем на мобильных
    },
    {
      key: "company",
      header: "Компания",
      hidden: window.innerWidth < 768 // Скрываем на мобильных
    },
    {
      key: "status",
      header: "Статус",
      sortable: true,
      cell: (client) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
          client.status === 'active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }`}>
          {client.status === 'active' ? (
            <Check className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
          {client.status === 'active' ? 'Активен' : 'Неактивен'}
        </span>
      )
    }
  ];

  // Определяем фильтры
  const filterOptions = [
    {
      key: "status",
      label: "Статус",
      options: [
        { value: "active", label: "Активен" },
        { value: "inactive", label: "Неактивен" }
      ]
    }
  ];

  // Рендер действий для строки
  const renderRowActions = (client: Client) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Действия</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/clients/view/${client.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          Просмотр
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEdit(client.id)}>
          <Edit className="mr-2 h-4 w-4" />
          Редактировать
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-red-600 focus:text-red-600"
          onClick={() => setDeleteClientId(client.id)}
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
            <CardTitle className="text-2xl">Клиенты</CardTitle>
            <CardDescription>
              Управляйте информацией о клиентах вашей компании
            </CardDescription>
          </div>
          <Button 
            onClick={() => navigate("/clients/create")} 
            className="whitespace-nowrap"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить клиента
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            data={clients}
            columns={columns}
            loading={loading}
            searchPlaceholder="Поиск клиентов..."
            noDataMessage="Нет добавленных клиентов"
            filterOptions={filterOptions}
            renderRowActions={renderRowActions}
          />
        </CardContent>
      </Card>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={!!deleteClientId} onOpenChange={() => setDeleteClientId(null)}>
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

export default ClientsPage;
