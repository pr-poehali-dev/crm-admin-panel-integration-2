
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft,
  Save,
  Plus,
  Trash
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
import { apiClient, Sale, Client } from "@/components/api/apiClient";
import { useToast } from "@/components/ui/toast";

type SaleFormProps = {
  mode: "create" | "edit";
};

type SaleProduct = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type SaleFormData = {
  clientId: string;
  status: Sale['status'];
  products: SaleProduct[];
};

const initialProduct = (): SaleProduct => ({
  id: crypto.randomUUID(),
  name: "",
  quantity: 1,
  price: 0
});

const initialState: SaleFormData = {
  clientId: "",
  status: "pending",
  products: [initialProduct()]
};

const SaleForm = ({ mode }: SaleFormProps) => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SaleFormData>(initialState);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Получение токена из localStorage (в реальном приложении используйте более безопасное хранилище)
  const token = localStorage.getItem("token") || "fake-token";

  useEffect(() => {
    // Загружаем список клиентов
    fetchClients();
    
    // Если режим редактирования, загружаем данные продажи
    if (mode === "edit" && id) {
      fetchSale(id);
    }
  }, [mode, id]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
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
      setLoadingClients(false);
    }
  };

  const fetchSale = async (saleId: string) => {
    try {
      setLoading(true);
      const sale = await apiClient.getSale(token, saleId);
      
      setFormData({
        clientId: sale.clientId,
        status: sale.status,
        products: sale.products
      });
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

  const handleClientChange = (value: string) => {
    setFormData(prev => ({ ...prev, clientId: value }));
  };

  const handleStatusChange = (value: Sale['status']) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleProductChange = (index: number, field: keyof SaleProduct, value: string | number) => {
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = { 
        ...updatedProducts[index], 
        [field]: value 
      };
      return { ...prev, products: updatedProducts };
    });
  };

  const handleAddProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, initialProduct()]
    }));
  };

  const handleRemoveProduct = (index: number) => {
    if (formData.products.length <= 1) return;
    
    setFormData(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts.splice(index, 1);
      return { ...prev, products: updatedProducts };
    });
  };

  const calculateTotal = (): number => {
    return formData.products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      toast({
        title: "Ошибка",
        description: "Выберите клиента",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.products.some(p => !p.name || p.price <= 0)) {
      toast({
        title: "Ошибка",
        description: "Заполните информацию о всех товарах",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const saleData = {
        clientId: formData.clientId,
        status: formData.status,
        products: formData.products,
        amount: calculateTotal()
      };
      
      if (mode === "create") {
        await apiClient.createSale(token, saleData);
        toast({
          title: "Успешно",
          description: "Продажа успешно создана",
        });
      } else if (mode === "edit" && id) {
        await apiClient.updateSale(token, id, saleData);
        toast({
          title: "Успешно",
          description: "Данные продажи обновлены",
        });
      }
      
      navigate("/sales");
    } catch (error) {
      console.error("Ошибка при сохранении продажи:", error);
      toast({
        title: "Ошибка",
        description: mode === "create" 
          ? "Не удалось создать продажу" 
          : "Не удалось обновить данные продажи",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {mode === "create" ? "Создание новой продажи" : "Редактирование продажи"}
              </CardTitle>
              <CardDescription>
                {mode === "create" 
                  ? "Заполните информацию о новой продаже" 
                  : "Измените информацию о продаже"}
              </CardDescription>
            </div>
            <Button 
              type="button" 
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
            ) : (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Клиент</Label>
                    <Select 
                      value={formData.clientId} 
                      onValueChange={handleClientChange}
                      disabled={loadingClients}
                    >
                      <SelectTrigger id="clientId">
                        <SelectValue placeholder="Выберите клиента" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingClients ? (
                          <div className="flex items-center justify-center p-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        ) : (
                          clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} ({client.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Статус</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleStatusChange(value as Sale['status'])}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">В процессе</SelectItem>
                        <SelectItem value="completed">Завершена</SelectItem>
                        <SelectItem value="cancelled">Отменена</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Товары</h3>
                    <Button type="button" variant="outline" onClick={handleAddProduct}>
                      <Plus className="mr-2 h-4 w-4" />
                      Добавить товар
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {formData.products.map((product, index) => (
                      <div key={product.id} className="border rounded-md p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Товар {index + 1}</h4>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveProduct(index)}
                            disabled={formData.products.length <= 1}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`product-${index}-name`}>Название товара</Label>
                            <Input
                              id={`product-${index}-name`}
                              value={product.name}
                              onChange={(e) => handleProductChange(index, "name", e.target.value)}
                              placeholder="Введите название товара"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`product-${index}-price`}>Цена (₽)</Label>
                            <Input
                              id={`product-${index}-price`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={product.price}
                              onChange={(e) => handleProductChange(index, "price", parseFloat(e.target.value))}
                              placeholder="0.00"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`product-${index}-quantity`}>Количество</Label>
                            <Input
                              id={`product-${index}-quantity`}
                              type="number"
                              min="1"
                              value={product.quantity}
                              onChange={(e) => handleProductChange(index, "quantity", parseInt(e.target.value))}
                              placeholder="1"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Сумма</Label>
                            <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground flex items-center">
                              {formatAmount(product.price * product.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-800 w-full md:w-auto">
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-lg font-medium">Итого:</span>
                      <span className="text-xl font-bold">{formatAmount(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/sales")}
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

export default SaleForm;
