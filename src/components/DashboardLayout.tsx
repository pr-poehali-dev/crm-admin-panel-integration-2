
import React from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  BarChart, 
  Settings, 
  HelpCircle, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Боковая панель */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r shadow-sm hidden md:block">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">CRM Система</h2>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Дашборд
              </Button>
            </Link>
            <Link to="/clients">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="mr-2 h-5 w-5" />
                Клиенты
              </Button>
            </Link>
            <Link to="/sales">
              <Button variant="ghost" className="w-full justify-start">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Продажи
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart className="mr-2 h-5 w-5" />
                Отчеты
              </Button>
            </Link>
          </nav>
          
          <div className="p-4 border-t">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-5 w-5" />
                Настройки
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <HelpCircle className="mr-2 h-5 w-5" />
                Помощь
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut className="mr-2 h-5 w-5" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Основной контент */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
