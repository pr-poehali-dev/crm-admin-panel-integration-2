import { useState, useEffect } from 'react';

// Базовый адрес API
const BASE_URL = 'https://api.example.com/v1';

// Интерфейсы для типизации данных
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Sale {
  id: string;
  clientId: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>
  date: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'sales' | 'clients' | 'products' | 'financial';
  dateRange: {
    from: string;
    to: string;
  };
  createdAt: string;
  data: any; // Данные отчета могут иметь разную структуру в зависимости от типа
  status: 'draft' | 'published';
  description?: string;
}

export interface DashboardStats {
  clientsCount: number;
  salesCount: number;
  tasksCount: number;
  totalRevenue: number;
  recentSales: Sale[];
}

// Типизация ошибок API
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Типизация опций запроса
interface RequestOptions extends RequestInit {
  token?: string;
}

// Базовая функция для выполнения запросов
const fetchApi = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { token, ...fetchOptions } = options;
  
  // Настройка заголовков с авторизацией
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  headers.set('Content-Type', 'application/json');
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });
    
    // Проверка успешности запроса
    if (!response.ok) {
      const errorData = await response.json();
      throw {
        status: response.status,
        message: errorData.message || 'Ошибка запроса',
        errors: errorData.errors,
      } as ApiError;
    }
    
    // Проверяем наличие контента
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T;
    }
    
    return {} as T;
  } catch (error) {
    // Обработка сетевых ошибок
    if (!(error as ApiError).status) {
      throw {
        status: 0,
        message: (error as Error).message || 'Ошибка сети',
      } as ApiError;
    }
    throw error;
  }
};

// Хук для получения данных
export const useApi = <T>(
  endpoint: string,
  options: RequestOptions = {},
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchApi<T>(endpoint, options);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as ApiError);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  
  return { data, error, loading };
};

// API-клиент с методами для работы с данными
export const apiClient = {
  // Авторизация
  login: async (email: string, password: string) => {
    return fetchApi<{ token: string; user: { id: string; name: string; email: string } }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
  },
  
  // Дашборд
  getDashboardStats: async (token: string) => {
    return fetchApi<DashboardStats>('/dashboard/stats', { token });
  },
  
  // Клиенты
  getClients: async (token: string) => {
    return fetchApi<Client[]>('/clients', { token });
  },
  
  getClient: async (token: string, id: string) => {
    return fetchApi<Client>(`/clients/${id}`, { token });
  },
  
  createClient: async (token: string, client: Omit<Client, 'id' | 'createdAt'>) => {
    return fetchApi<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
      token,
    });
  },
  
  updateClient: async (token: string, id: string, client: Partial<Client>) => {
    return fetchApi<Client>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(client),
      token,
    });
  },
  
  deleteClient: async (token: string, id: string) => {
    return fetchApi<void>(`/clients/${id}`, {
      method: 'DELETE',
      token,
    });
  },
  
  // Продажи
  getSales: async (token: string) => {
    return fetchApi<Sale[]>('/sales', { token });
  },
  
  getSale: async (token: string, id: string) => {
    return fetchApi<Sale>(`/sales/${id}`, { token });
  },
  
  createSale: async (token: string, sale: Omit<Sale, 'id' | 'date'>) => {
    return fetchApi<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
      token,
    });
  },
  
  updateSale: async (token: string, id: string, sale: Partial<Sale>) => {
    return fetchApi<Sale>(`/sales/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(sale),
      token,
    });
  },
  
  deleteSale: async (token: string, id: string) => {
    return fetchApi<void>(`/sales/${id}`, {
      method: 'DELETE',
      token,
    });
  }
};