// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import { cn } from "@/lib/utils";
// import {
//   BarChart3,
//   Package,
//   Map,
//   Users,
//   ClipboardList,
//   Menu,
//   X,
//   Home,
//   User,
//   Building2,
//   FileText
// } from "lucide-react";

// interface SidebarProps {
//   isCollapsed: boolean;
//   onToggle: () => void;
// }

// const navigationItems = [
//   { id: "dashboard", label: "Dashboard", path: "/", icon: BarChart3 },
//   { id: "products", label: "Products", path: "/products", icon: Package },
//   { id: "routemap", label: "RouteMap", path: "/routemap", icon: Map },
//   { id: "employees", label: "Employees", path: "/employees", icon: Users },
//   { id: "inventory", label: "Inventory Management", path: "/inventory", icon: ClipboardList },
//   { id: "franchise", label: "Franchise", path: "/franchise", icon: Building2 },
//   { id: "customer", label: "Customer", path: "/customer", icon: User },
//   { id: "customerSaleHistory", label: "Customer Sale History", path: "/categorywisesale", icon: FileText },
//   { id: "StockVariation", label: "Stock Variation", path: "/StockVariation", icon: FileText }
// ];

// export const DashboardSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
//   const location = useLocation();

//   return (
//     <div
//       className={cn(
//         "bg-dashboard-sidebar text-dashboard-sidebar-foreground h-screen transition-all duration-300 ease-in-out flex flex-col border-r border-dashboard-sidebar-hover",
//         isCollapsed ? "w-16" : "w-64"
//       )}
//     >
//       <div className="h-16 flex items-center justify-between px-4 border-b border-dashboard-sidebar-hover">
//         {!isCollapsed && (
//           <div className="flex items-center gap-2">
//             <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
//               {/* logo placeholder */}
//             </div>
//             <h1 className="text-xl font-semibold">BLK Business solutions pvt ltd</h1>
//           </div>
//         )}

//         <button
//           onClick={onToggle}
//           className="p-2 rounded-lg hover:bg-dashboard-sidebar-hover transition-colors"
//           aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
//         >
//           {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
//         </button>
//       </div>

//       {/* Navigation */}
//       <div className="flex-1 py-4">
//         <div className="px-3 mb-4" />
//         <nav className="space-y-1 px-2">
//           {navigationItems.map((item) => {
//             const Icon = item.icon as any;
//             const isActive = location.pathname === item.path;
//             return (
//               <Link
//                 key={item.id}
//                 to={item.path}
//                 className={cn(
//                   "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
//                   "hover:bg-dashboard-sidebar-hover",
//                   isActive && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                 )}
//                 title={isCollapsed ? item.label : undefined}
//               >
//                 <Icon
//                   className={cn(
//                     "h-5 w-5 flex-shrink-0 transition-colors",
//                     isActive ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
//                   )}
//                 />
//                 {!isCollapsed && (
//                   <span
//                     className={cn(
//                       "font-medium transition-colors",
//                       isActive ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
//                     )}
//                   >
//                     {item.label}
//                   </span>
//                 )}
//               </Link>
//             );
//           })}
//         </nav>
//       </div>

//       {/* User Section */}
//       {!isCollapsed && (
//         <div className="p-4 border-t border-dashboard-sidebar-hover">
//           <div className="flex items-center gap-3">
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Package,
  Map,
  Users,
  ClipboardList,
  Menu,
  X,
  Home,
  User,
  Building2,
  FileText,
  ChevronDown,
  ChevronRight,
  Box,
  Repeat,
  CheckSquare
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", path: "/", icon: BarChart3 },
  { id: "products", label: "Products", path: "/products", icon: Package },
  { id: "routemap", label: "RouteMap", path: "/routemap", icon: Map },
  { id: "employees", label: "Employees", path: "/employees", icon: Users },
  { id: "inventory", label: "Inventory Management", path: "/inventory", icon: ClipboardList },
  { id: "franchise", label: "Franchise", path: "/franchise", icon: Building2 },
  { id: "customer", label: "Customer", path: "/customer", icon: User },
  { id: "customerSaleHistory", label: "Customer Sale History", path: "/categorywisesale", icon: FileText },
  { id: "StockVariation", label: "Stock Variation", path: "/StockVariation", icon: FileText },
  { id: "BeatList", label: "Beat List", path: "/BeatList", icon: FileText }
];

export const DashboardSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const [skuOpen, setSkuOpen] = useState<boolean>(false);

  // helper to test active states (main or nested)
  const isPathActive = (path: string) => {
    return location.pathname === path;
  };
  const isPathStartsWith = (prefix: string) => location.pathname.startsWith(prefix);

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
              {/* logo placeholder */}
            </div>
            <h1 className="text-xl font-semibold">BLK Business solutions pvt ltd</h1>
          </div>
        )}

        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-dashboard-sidebar-hover transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4">
        <div className="px-3 mb-4" />
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon as any;
            const isActive = isPathActive(item.path);
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
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span
                    className={cn(
                      "font-medium transition-colors",
                      isActive ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* ---------- SKU Accordion (new) ---------- */}
          <div
            className={cn(
              "px-1",
              "group"
            )}
          >
            <button
              type="button"
              onClick={() => setSkuOpen((s) => !s)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-dashboard-sidebar-hover",
                (isPathStartsWith("/sku") || skuOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
              )}
              title={isCollapsed ? "SKU" : undefined}
              aria-expanded={skuOpen}
            >
              <div className="flex items-center gap-3">
                <Box
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    isPathStartsWith("/sku") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span
                    className={cn(
                      "font-medium transition-colors",
                      isPathStartsWith("/sku") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
                    )}
                  >
                    SKU
                  </span>
                )}
              </div>

              {/* when collapsed, show only chevron icon visually (still clickable) */}
              {!isCollapsed ? (
                <span className="flex items-center">
                  {skuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
              ) : null}
            </button>

            {/* submenu */}
            {!isCollapsed && skuOpen && (
              <div className="mt-2 ml-9 space-y-1">
                <Link
                  to="/sku/list"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                    isPathActive("/sku/list") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
                  )}
                >
                  <Repeat className="h-4 w-4" />
                  <span>SKU List</span>
                </Link>

                <Link
                  to="/sku/movement"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                    isPathActive("/sku/movement") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
                  )}
                >
                  <Package className="h-4 w-4" />
                  <span>SKU Movement</span>
                </Link>

                <Link
                  to="/sku/sku"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                    isPathActive("/sku/check") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
                  )}
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>SKU Check</span>
                </Link>
              </div>
            )}

            {/* collapsed tooltip style: show submenu items as small stacked links when collapsed (optional UX) */}
            {isCollapsed && skuOpen && (
              <div className="absolute left-full ml-2 w-40 bg-white rounded shadow z-50">
                <Link to="/sku/list" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU List</Link>
                <Link to="/sku/movement" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU Movement</Link>
                <Link to="/sku/check" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU Check</Link>
              </div>
            )}
          </div>
          {/* ---------- end SKU accordion ---------- */}
        </nav>
      </div>

      {/* User Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-dashboard-sidebar-hover">
          <div className="flex items-center gap-3">
            {/* user area - unchanged */}
          </div>
        </div>
      )}
    </div>
  );
};

