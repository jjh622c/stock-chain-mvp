import { NavLink, useLocation } from "react-router-dom";
import { Home, Plus, FileText, BarChart3, Package, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "매장선택", path: "/" },
  { icon: Plus, label: "주문등록", path: "/order" },
  { icon: FileText, label: "주문목록", path: "/orders" },
  { icon: BarChart3, label: "통계", path: "/stats" },
  { icon: Package, label: "상품관리", path: "/products" }
];

const BottomTabNavigation = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center py-2 px-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg min-w-0 flex-1 transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-5 w-5 mb-1 flex-shrink-0" />
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomTabNavigation;