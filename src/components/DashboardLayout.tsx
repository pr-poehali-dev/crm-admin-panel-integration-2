
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  BarChart, 
  Settings, 
  HelpCircle, 
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { path: "/", icon: <LayoutDashboard className="mr-2 h-5 w-5" />, label: "Дашборд" },
    { path: "/clients", icon: <Users className="mr-2 h-5 w-5" />, label: "Клиенты" },
    { path: "/sales", icon: <ShoppingCart className="mr-2 h-5 w-5" />, label: "Продажи" },
    { path: "/reports", icon: <BarChart className="mr-2 h-5 w-5" />, label: "Отчеты" },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path} 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Button 
            variant={isActive(item.path) ? "default" : "ghost"} 
            className="w-full justify-start"
          >
            {item.icon}
            {item.label}
          </Button>
        </Link>
      ))}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Боковая панель для десктопа */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r shadow-sm hidden md:block">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">CRM Система</h2>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <NavLinks />
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
      
      {/* Шапка и мобильное меню */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b md:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">CRM Система</h2>
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Открыть меню</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">CRM Система</h2>
                  </div>
                  
                  <nav className="flex-1 p-4 space-y-1">
                    <NavLinks />
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
                      <Button variant="ghost" className="w-full justify-start text-red-500">
                        <LogOut className="mr-2 h-5 w-5" />
                        Выйти
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        
        {/* Основной контент */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
