import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <div className="sticky top-0 z-40 lg:hidden">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMenuClick}
                className="text-slate-500 hover:text-slate-600"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="ml-4 text-lg font-semibold text-slate-900">Leumas Inventory</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
