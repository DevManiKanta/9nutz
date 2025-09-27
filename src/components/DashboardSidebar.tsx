


import React, { useState } from "react";
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
  Settings,
  ChevronDown,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: Home },
  { id: "products", label: "Products", path: "/products", icon: Package },
  { id: "customerSaleHistory", label: "Category", path: "/categorywisesale", icon: BarChart3 },
  { id: "franchise", label: "Franchise", path: "/franchise", icon: Building2 },
  { id: "customer", label: "Point of Sale", path: "/Customer", icon: Users },
  { id: "StockVariation", label: "Expenses Summary", path: "/CommingSoon", icon: Repeat },
  { id: "routemap", label: "Pos Details", path: "/routemap", icon: Map },
  { id: "Franchiserequests", label: "Franchise Request", path: "/CommingSoon", icon: Map },
];

const settingsChildren = [
  { id: "sku-list", label: "GST", path: "/sku/list" },
  { id: "sku-movement", label: "Vendor Management", path: "/sku/movement" },
  { id: "sku-create", label: "Inventory Management", path: "/sku/sku" },
];

export const DashboardSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();
  const locState = (location.state as any) ?? {};
  const activeSidebarIdFromState = locState?.sidebarId ?? null;

  const [settingsOpen, setSettingsOpen] = useState<boolean>(() => {
    return settingsChildren.some((c) => pathname.startsWith(c.path.toLowerCase()));
  });

  const computeActive = (item: { id: string; path: string }) => {
    const p = (item.path || "").toLowerCase();
    const pathMatches = pathname === p || (p !== "/" && (pathname.startsWith(p + "/") || pathname.startsWith(p)));
    if (!pathMatches) return false;
    const isComingSoonPath = p === "/commingsoon";
    if (isComingSoonPath) {
      if (activeSidebarIdFromState && String(activeSidebarIdFromState) === String(item.id)) return true;
      return false;
    }
    return true;
  };

  const settingsActive = settingsChildren.some((c) => {
    const p = c.path.toLowerCase();
    return pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p);
  });

  return (
    <div
      className={cn(
        "bg-green-100 text-gray-800 h-screen flex flex-col border-r border-green-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-green-300 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex flex-col gap-1">
            <h1 className="text-md font-semibold text-green-900 leading-none">9NUTZ</h1>
            <p className="text-xs text-green-800">A Healthy Alternative</p>
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

      <div className="flex-1 overflow-y-auto sidebar-scroll py-4">
        <div className="px-3 mb-4" />
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon as any;
            const active = computeActive(item);
            const linkState = { sidebarId: item.id };

            return (
              <Link
                key={item.id}
                to={item.path}
                state={linkState}
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
                  <span className={cn("font-medium transition-colors", active ? "text-amber-700" : "text-amber-900")}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="mt-2">
            <button
              type="button"
              onClick={() => setSettingsOpen((s) => !s)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-amber-200",
                settingsActive && "bg-amber-300 border-l-4 border-amber-600"
              )}
              aria-expanded={settingsOpen}
              aria-controls="settings-submenu"
            >
              <div className="flex items-center gap-3">
                <Settings className={cn("h-5 w-5 flex-shrink-0", settingsActive ? "text-amber-700" : "text-amber-900")} />
                {!isCollapsed && (
                  <span className={cn("font-medium", settingsActive ? "text-amber-700" : "text-amber-900")}>
                    Settings
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", settingsOpen ? "rotate-180 text-amber-700" : "rotate-0 text-amber-900")}
                />
              )}
            </button>

            <div
              id="settings-submenu"
              className={cn(
                "mt-1 overflow-hidden transition-all",
                settingsOpen && !isCollapsed ? "max-h-80" : "max-h-0"
              )}
            >
              {!isCollapsed &&
                settingsChildren.map((child) => {
                  const childActive =
                    pathname === child.path.toLowerCase() ||
                    pathname.startsWith(child.path.toLowerCase() + "/") ||
                    pathname.startsWith(child.path.toLowerCase());
                  const linkState = { sidebarId: child.id };

                  return (
                    <Link
                      key={child.id}
                      to={child.path}
                      state={linkState}
                      className={cn(
                        "flex items-center gap-3 px-6 py-2 rounded-lg text-sm transition-colors hover:bg-amber-100",
                        childActive ? "bg-amber-100 text-amber-800" : "text-amber-900"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full", childActive ? "bg-amber-700" : "bg-amber-400")} />
                      <span className="truncate">{child.label}</span>
                    </Link>
                  );
                })}
            </div>
          </div>
        </nav>
      </div>

      {!isCollapsed && (
        <div className="p-4 border-t border-amber-300 flex-shrink-0">
          <div className="flex items-center gap-3"></div>
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










