import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/auth";
import { 
  Package, 
  LayoutDashboard, 
  Box, 
  ArrowRightLeft, 
  History, 
  LogOut 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Box },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "History", href: "/history", icon: History },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    authService.logout();
    setLocation("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-center h-16 bg-primary">
          <div className="flex items-center">
            <Package className="text-white text-xl mr-2" />
            <span className="text-white text-lg font-semibold">Mini Inventory</span>
          </div>
        </div>
        
        <nav className="mt-8 flex-1">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                    onClick={() => onClose()}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
