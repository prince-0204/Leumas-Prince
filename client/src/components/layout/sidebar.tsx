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

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden shadow-lg",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Header */}
        <div className="flex items-center justify-center h-16 bg-primary flex-shrink-0">
          <div className="flex items-center">
            <Package className="text-white text-xl mr-2" />
            <span className="text-white text-lg font-semibold">Leumas Inventory</span>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 flex flex-col mt-8">
          <div className="px-4 space-y-2 flex-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href}>
                  <span
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
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="px-4 pb-4 flex-shrink-0">
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

      {/* Desktop Navbar */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo */}
          <div className="flex items-center">
            <Package className="text-primary text-xl mr-2" />
            <span className="text-primary text-lg font-semibold">Leumas Inventory</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href}>
                  <span
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}