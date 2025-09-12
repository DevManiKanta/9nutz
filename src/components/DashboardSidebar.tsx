import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
// import {IMAGES} from '@/assets/Images';
import {
  BarChart3,
  Package,
  Map,
  Users,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}
const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: BarChart3 },
  { id: 'products', label: 'Products', path: '/products', icon: Package },
  { id: 'routemap', label: 'RouteMap', path: '/routemap', icon: Map },
  { id: 'employees', label: 'Employees', path: '/employees', icon: Users },
  { id: 'inventory', label: 'Inventory Management', path: '/inventory', icon: ClipboardList },
];
export const DashboardSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  return (
    <div
      className={cn(
        "bg-dashboard-sidebar text-dashboard-sidebar-foreground h-screen transition-all duration-300 ease-in-out flex flex-col border-r border-dashboard-sidebar-hover",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-dashboard-sidebar-hover">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
        {/* <img
          src={IMAGES.logo}
          alt="Logo"
          className="w-full h-full object-contain w-8 h-8"
        /> */}
      </div>
      <h1 className="text-xl font-semibold">BLK Business solutions pvt ltd</h1>
    </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-dashboard-sidebar-hover transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>
      {/* Navigation */}
      <div className="flex-1 py-4">
        <div className="px-3 mb-4">
        </div>
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  "hover:bg-dashboard-sidebar-hover",
                  isActive && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
                )} />
                {!isCollapsed && (
                  <span className={cn(
                    "font-medium transition-colors",
                    isActive ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
                  )}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* User Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-dashboard-sidebar-hover">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-chart-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">T</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dashboard-sidebar-foreground">ManiKanta</p>
              <p className="text-xs text-dashboard-sidebar-foreground/60 truncate">Admin</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};