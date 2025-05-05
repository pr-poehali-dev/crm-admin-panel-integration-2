
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";

// Клиентские страницы
import ClientsPage from "./pages/clients/ClientsPage";
import ClientForm from "./pages/clients/ClientForm";
import ClientView from "./pages/clients/ClientView";

// Страницы продаж
import SalesPage from "./pages/sales/SalesPage";
import SaleForm from "./pages/sales/SaleForm";
import SaleView from "./pages/sales/SaleView";

// Страницы отчетов
import ReportsPage from "./pages/reports/ReportsPage";
import ReportForm from "./pages/reports/ReportForm";
import ReportView from "./pages/reports/ReportView";

// Создаем клиент для запросов
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Index />} />
            
            {/* Маршруты для клиентов */}
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/create" element={<ClientForm mode="create" />} />
            <Route path="/clients/edit/:id" element={<ClientForm mode="edit" />} />
            <Route path="/clients/view/:id" element={<ClientView />} />
            
            {/* Маршруты для продаж */}
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/sales/create" element={<SaleForm mode="create" />} />
            <Route path="/sales/edit/:id" element={<SaleForm mode="edit" />} />
            <Route path="/sales/view/:id" element={<SaleView />} />
            
            {/* Маршруты для отчетов */}
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/create" element={<ReportForm mode="create" />} />
            <Route path="/reports/edit/:id" element={<ReportForm mode="edit" />} />
            <Route path="/reports/view/:id" element={<ReportView />} />
            
            {/* Другие маршруты */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
