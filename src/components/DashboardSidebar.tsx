

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  Map,
  Users,
  ClipboardList,
  Menu,
  X,
  Building2,
  Repeat,
  BarChart3,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: Home },
  { id: "products", label: "Products", path: "/products", icon: Package },
    { id: "customerSaleHistory", label: "Category", path: "/categorywisesale", icon: BarChart3 },
  // { id: "employees", label: "Employees", path: "/employees", icon: Users },
  // { id: "inventory", label: "Inventory Management", path: "/inventory", icon: ClipboardList },
  { id: "franchise", label: "Franchise", path: "/franchise", icon: Building2 },
  { id: "customer", label: "Point of Sale", path: "/customer", icon: Users },
  { id: "StockVariation", label: "Expenses Summary", path: "/stockvariation", icon: Repeat },
    { id: "routemap", label: "Pos Details", path: "/routemap", icon: Map },
  { id: "Franchiserequests", label: "Franchise Request", path: "/FranchiseRequests", icon: Map },
];

export const DashboardSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  // helpers to check active routes
  const isPathActive = (path: string) => {
    const p = path.toLowerCase();
    return pathname === p || pathname.startsWith(p + "/");
  };

  return (
    <div
      className={cn(
        "bg-green-100 text-gray-800 h-screen flex flex-col border-r border-green-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-green-300 flex-shrink-0">
        {!isCollapsed && (
         <div className="flex flex-col gap-2">
  <h1 className="text-md font-semibold text-green-900">9NUTZ</h1>
  <h1 className="text-md font-semibold text-green-900">A Healthy Alternative</h1>
</div>

        )}

        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-amber-200 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu className="h-5 w-5 text-amber-800" /> : <X className="h-5 w-5 text-amber-800" />}
        </button>
      </div>

      {/* nav */}
      <div className="flex-1 overflow-y-auto sidebar-scroll py-4">
        <div className="px-3 mb-4" />
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon as any;
            const active = isPathActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group hover:bg-amber-200",
                  active && "bg-amber-300 border-l-4 border-amber-600"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    active ? "text-amber-700" : "text-amber-900"
                  )}
                />
                {!isCollapsed && (
                  <span
                    className={cn(
                      "font-medium transition-colors",
                      active ? "text-amber-700" : "text-amber-900"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* footer / user */}
      {!isCollapsed && (
        <div className="p-4 border-t border-amber-300 flex-shrink-0">
          <div className="flex items-center gap-3">
          </div>
        </div>
      )}

      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 8px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: inherit; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background-color: rgba(146, 64, 14, 0.2); border-radius: 8px; border: 2px solid transparent; background-clip: padding-box; }
        .sidebar-scroll:hover::-webkit-scrollbar-thumb { background-color: rgba(146, 64, 14, 0.4); }
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: rgba(146, 64, 14, 0.2) transparent; }
      `}</style>
    </div>
  );
};









