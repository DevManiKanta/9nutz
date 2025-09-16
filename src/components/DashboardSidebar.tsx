

// import React, { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { cn } from "@/lib/utils";
// import {
//   Home,
//   Package,
//   Map,
//   Users,
//   ClipboardList,
//   Menu,
//   X,
//   Building2,
//   FileText,
//   ChevronDown,
//   ChevronRight,
//   Box,
//   Repeat,
//   CheckSquare,
//   QrCode,
//   MapPin,
//   BarChart3,
//   CreditCard,
//   Percent,
//   Phone,
//   Activity,
//   DollarSign 
// } from "lucide-react";

// interface SidebarProps {
//   isCollapsed: boolean;
//   onToggle: () => void;
// }

// const navigationItems = [
//   { id: "dashboard", label: "Dashboard", path: "/", icon: Home },
//   { id: "products", label: "Products", path: "/products", icon: Package },
//   { id: "routemap", label: "RouteMap", path: "/routemap", icon: Map },
//   { id: "employees", label: "Employees", path: "/employees", icon: Users },
//   { id: "inventory", label: "Inventory Management", path: "/inventory", icon: ClipboardList },
//   { id: "franchise", label: "Franchise", path: "/franchise", icon: Building2 },
//   { id: "customer", label: "Customer", path: "/customer", icon: Users },
//   { id: "customerSaleHistory", label: "Customer Sale History", path: "/categorywisesale", icon: FileText },
//   { id: "StockVariation", label: "Stock Variation", path: "/stockvariation", icon: BarChart3 },
//   { id: "BeatList", label: "Beat List", path: "/beatlist", icon: MapPin },
//   { id: "OrderReport", label: "Order Report", path: "/orderreport", icon: FileText },
//   { id: "QrPayments", label: "Qr Payments", path: "/qrpayments", icon: QrCode },
//   { id: "ObSales", label: "OB Sales", path: "/ObSales", icon:  DollarSign  },
//    { id: "ExpenseSummary", label: "Expense Summary", path: "/ExpenseSummary", icon:  DollarSign  },
//       { id: "CashWithdrawl", label: "Cash Withdrawl", path: "/CashWithdrawl", icon:  DollarSign  },
//          { id: "Billing", label: "Billing", path: "/Billing", icon:  DollarSign  },
//             { id: "DailyInventory", label: "Daily Inventory", path: "/DailyInventory", icon:  DollarSign  },
//                { id: "RealTimeInventory", label: "Real Time Inventory", path: "/RealTimeInventory", icon:  DollarSign  }
// ];

// export const DashboardSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
//   const location = useLocation();
//   const [skuOpen, setSkuOpen] = useState<boolean>(false);
//   const [payLaterOpen, setPayLaterOpen] = useState<boolean>(false);
//   const [telecallerOpen, setTelecallerOpen] = useState<boolean>(false);

//   // normalize once for case-insensitive comparisons
//   const pathname = location.pathname.toLowerCase();

//   // helpers (case-insensitive)
//   const isPathActive = (path: string) => pathname === path.toLowerCase();
//   const isPathStartsWith = (prefix: string) => pathname.startsWith(prefix.toLowerCase());

//   return (
//     <div
//       className={cn(
//         "bg-dashboard-sidebar text-dashboard-sidebar-foreground h-screen overflow transition-all duration-300 ease-in-out flex flex-col border-r border-dashboard-sidebar-hover",
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
//             const isActive = isPathActive(item.path);
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

//           {/* ---------- SKU Accordion ---------- */}
//           <div className="px-1 group relative">
//             <button
//               type="button"
//               onClick={() => setSkuOpen((s) => !s)}
//               className={cn(
//                 "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
//                 "hover:bg-dashboard-sidebar-hover",
//                 (isPathStartsWith("/sku") || skuOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//               )}
//               title={isCollapsed ? "SKU" : undefined}
//               aria-expanded={skuOpen}
//             >
//               <div className="flex items-center gap-3">
//                 <Box
//                   className={cn(
//                     "h-5 w-5 flex-shrink-0 transition-colors",
//                     isPathStartsWith("/sku") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
//                   )}
//                 />
//                 {!isCollapsed && (
//                   <span
//                     className={cn(
//                       "font-medium transition-colors",
//                       isPathStartsWith("/sku") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
//                     )}
//                   >
//                     SKU
//                   </span>
//                 )}
//               </div>

//               {!isCollapsed ? (
//                 <span className="flex items-center">
//                   {skuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//                 </span>
//               ) : null}
//             </button>

//             {/* submenu */}
//             {!isCollapsed && skuOpen && (
//               <div className="mt-2 ml-9 space-y-1">
//                 <Link
//                   to="/sku/list"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/sku/list") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <Repeat className="h-4 w-4" />
//                   <span>SKU List</span>
//                 </Link>

//                 <Link
//                   to="/sku/movement"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/sku/movement") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <Package className="h-4 w-4" />
//                   <span>SKU Movement</span>
//                 </Link>

//                 <Link
//                   to="/sku/check"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/sku/check") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <CheckSquare className="h-4 w-4" />
//                   <span>SKU Check</span>
//                 </Link>
//               </div>
//             )}

//             {isCollapsed && skuOpen && (
//               <div className="absolute left-full ml-2 w-44 bg-white rounded shadow z-50">
//                 <Link to="/sku/list" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU List</Link>
//                 <Link to="/sku/movement" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU Movement</Link>
//                 <Link to="/sku/check" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU Check</Link>
//               </div>
//             )}
//           </div>
//           {/* ---------- end SKU accordion ---------- */}

//           {/* ---------- Pay Later Accordion ---------- */}
//           <div className="px-1 group relative">
//             <button
//               type="button"
//               onClick={() => setPayLaterOpen((s) => !s)}
//               className={cn(
//                 "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
//                 "hover:bg-dashboard-sidebar-hover",
//                 (isPathStartsWith("/paylater") || payLaterOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//               )}
//               title={isCollapsed ? "Pay Later" : undefined}
//               aria-expanded={payLaterOpen}
//             >
//               <div className="flex items-center gap-3">
//                 <CreditCard
//                   className={cn(
//                     "h-5 w-5 flex-shrink-0 transition-colors",
//                     isPathStartsWith("/paylater") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
//                   )}
//                 />
//                 {!isCollapsed && (
//                   <span
//                     className={cn(
//                       "font-medium transition-colors",
//                       isPathStartsWith("/paylater") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
//                     )}
//                   >
//                     Pay Later
//                   </span>
//                 )}
//               </div>
//               {!isCollapsed ? (
//                 <span className="flex items-center">
//                   {payLaterOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//                 </span>
//               ) : null}
//             </button>

//             {!isCollapsed && payLaterOpen && (
//               <div className="mt-2 ml-9 space-y-1">
//                 <Link
//                   to="/paylater/paylater"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/paylater/paylater") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <CreditCard className="h-4 w-4" />
//                   <span>Pay Later</span>
//                 </Link>

//                 <Link
//                   to="/paylater/discountinvoices"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/paylater/discountinvoices") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <Percent className="h-4 w-4" />
//                   <span>Discount Invoice</span>
//                 </Link>
//               </div>
//             )}

//             {isCollapsed && payLaterOpen && (
//               <div className="absolute left-full ml-2 w-44 bg-white rounded shadow z-50">
//                 <Link to="/paylater/paylater" className="block px-3 py-2 text-sm hover:bg-slate-100">Pay Later</Link>
//                 <Link to="/paylater/discountinvoices" className="block px-3 py-2 text-sm hover:bg-slate-100">Discount Invoice</Link>
//               </div>
//             )}
//           </div>
//           {/* ---------- end Pay Later accordion ---------- */}

//           {/* ---------- Telecaller Accordion ---------- */}
//           <div className="px-1 group relative">
//             <button
//               type="button"
//               onClick={() => setTelecallerOpen((s) => !s)}
//               className={cn(
//                 "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
//                 "hover:bg-dashboard-sidebar-hover",
//                 (isPathStartsWith("/telecaller") || telecallerOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//               )}
//               title={isCollapsed ? "Telecaller" : undefined}
//               aria-expanded={telecallerOpen}
//             >
//               <div className="flex items-center gap-3">
//                 <Phone
//                   className={cn(
//                     "h-5 w-5 flex-shrink-0 transition-colors",
//                     isPathStartsWith("/telecaller") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
//                   )}
//                 />
//                 {!isCollapsed && (
//                   <span
//                     className={cn(
//                       "font-medium transition-colors",
//                       isPathStartsWith("/telecaller") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
//                     )}
//                   >
//                     Telecaller
//                   </span>
//                 )}
//               </div>

//               {!isCollapsed ? (
//                 <span className="flex items-center">
//                   {telecallerOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//                 </span>
//               ) : null}
//             </button>

//             {!isCollapsed && telecallerOpen && (
//               <div className="mt-2 ml-9 space-y-1">
//                 <Link
//                   to="/telecaller/telecallerlist"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/telecaller/telecallerlist") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <Activity className="h-4 w-4" />
//                   <span>Telecaller List</span>
//                 </Link>

//                 <Link
//                   to="/telecaller/telecallerstatus"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/telecaller/telecallerstatus") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <FileText className="h-4 w-4" />
//                   <span>Telecaller Status</span>
//                 </Link>

//                 <Link
//                   to="/telecaller/crmreport"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/telecaller/crmreport") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <BarChart3 className="h-4 w-4" />
//                   <span>CRM Report</span>
//                 </Link>
//               </div>
//             )}

//             {isCollapsed && telecallerOpen && (
//               <div className="absolute left-full ml-2 w-44 bg-white rounded shadow z-50">
//                 <Link to="/telecaller/telecallerlist" className="block px-3 py-2 text-sm hover:bg-slate-100">Telecaller List</Link>
//                 <Link to="/telecaller/telecallerstatus" className="block px-3 py-2 text-sm hover:bg-slate-100">Telecaller Status</Link>
//                 <Link to="/telecaller/crmreport" className="block px-3 py-2 text-sm hover:bg-slate-100">CRM Report</Link>
//               </div>
//             )}
//           </div>
//           {/* ---------- end Telecaller accordion ---------- */}

//         </nav>
//       </div>

//       {/* User Section */}
//       {!isCollapsed && (
//         <div className="p-4 border-t border-dashboard-sidebar-hover">
//           <div className="flex items-center gap-3">
//             {/* user area - unchanged */}
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
  Home,
  Package,
  Map,
  Users,
  ClipboardList,
  Menu,
  X,
  Building2,
  FileText,
  ChevronDown,
  ChevronRight,
  Box,
  Repeat,
  CheckSquare,
  QrCode,
  MapPin,
  BarChart3,
  CreditCard,
  Percent,
  Phone,
  Activity,
  DollarSign
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: Home },
  { id: "products", label: "Products", path: "/products", icon: Package },
  { id: "routemap", label: "RouteMap", path: "/routemap", icon: Map },
  { id: "employees", label: "Employees", path: "/employees", icon: Users },
  { id: "inventory", label: "Inventory Management", path: "/inventory", icon: ClipboardList },
  { id: "franchise", label: "Franchise", path: "/franchise", icon: Building2 },
  { id: "customer", label: "Customer", path: "/customer", icon: Users },
  { id: "customerSaleHistory", label: "Customer Sale History", path: "/categorywisesale", icon: FileText },
  { id: "StockVariation", label: "Stock Variation", path: "/stockvariation", icon: BarChart3 },
  { id: "BeatList", label: "Beat List", path: "/beatlist", icon: MapPin },
  { id: "OrderReport", label: "Order Report", path: "/orderreport", icon: FileText },
  { id: "QrPayments", label: "Qr Payments", path: "/qrpayments", icon: QrCode },
  { id: "ObSales", label: "OB Sales", path: "/ObSales", icon: DollarSign },
  { id: "ExpenseSummary", label: "Expense Summary", path: "/ExpenseSummary", icon: DollarSign },
  { id: "CashWithdrawl", label: "Cash Withdrawl", path: "/CashWithdrawl", icon: DollarSign },
  { id: "Billing", label: "Billing", path: "/Billing", icon: DollarSign },
  { id: "DailyInventory", label: "Daily Inventory", path: "/DailyInventory", icon: DollarSign },
  { id: "RealTimeInventory", label: "Real Time Inventory", path: "/RealTimeInventory", icon: DollarSign },
  { id: "SlocStock", label: "Sloc Stock", path: "/SlocStock", icon: FileText },
  { id: "Settlement", label: "Settlement", path: "/Settlement", icon: FileText },
    { id: "PreShortSupply", label: "PreShortSupply", path: "/PreShortSupply", icon: FileText },
];

export const DashboardSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const [skuOpen, setSkuOpen] = useState<boolean>(false);
  const [payLaterOpen, setPayLaterOpen] = useState<boolean>(false);
  const [telecallerOpen, setTelecallerOpen] = useState<boolean>(false);

  // normalize once for case-insensitive comparisons
  const pathname = location.pathname.toLowerCase();

  // helpers (case-insensitive)
  const isPathActive = (path: string) => pathname === path.toLowerCase();
  const isPathStartsWith = (prefix: string) => pathname.startsWith(prefix.toLowerCase());

  return (
    <div
      className={cn(
        // ensure flex-col so header and footer stay fixed and middle can scroll
        "bg-dashboard-sidebar text-dashboard-sidebar-foreground h-screen flex flex-col border-r border-dashboard-sidebar-hover",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-dashboard-sidebar-hover flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              {/* logo placeholder */}
            </div>
            {/* <div>123</div> */}
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

      {/* ===== Middle scrollable area =====
          We set flex-1 overflow-y-auto so the navigation scrolls while header/footer stay fixed.
          The 'sidebar-scroll' class below is used to style the scrollbar.
      */}
      <div className="flex-1 overflow-y-auto sidebar-scroll py-4">
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

          {/* ---------- SKU Accordion ---------- */}
          <div className="px-1 group relative">
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
                    isPathActive("/sku/sku") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
                  )}
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>SKU Check</span>
                </Link>
              </div>
            )}

            {isCollapsed && skuOpen && (
              <div className="absolute left-full ml-2 w-44 bg-white rounded shadow z-50">
                <Link to="/sku/list" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU List</Link>
                <Link to="/sku/movement" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU Movement</Link>
                <Link to="/sku/list" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU List</Link>
              </div>
            )}
          </div>
          {/* ---------- end SKU accordion ---------- */}

          {/* ---------- Pay Later Accordion ---------- */}
          <div className="px-1 group relative">
            <button
              type="button"
              onClick={() => setPayLaterOpen((s) => !s)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-dashboard-sidebar-hover",
                (isPathStartsWith("/paylater") || payLaterOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
              )}
              title={isCollapsed ? "Pay Later" : undefined}
              aria-expanded={payLaterOpen}
            >
              <div className="flex items-center gap-3">
                <CreditCard
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    isPathStartsWith("/paylater") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span
                    className={cn(
                      "font-medium transition-colors",
                      isPathStartsWith("/paylater") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
                    )}
                  >
                    Pay Later
                  </span>
                )}
              </div>
              {!isCollapsed ? (
                <span className="flex items-center">
                  {payLaterOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
              ) : null}
            </button>

            {!isCollapsed && payLaterOpen && (
              <div className="mt-2 ml-9 space-y-1">
                <Link
                  to="/paylater/paylater"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                    isPathActive("/paylater/paylater") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
                  )}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Pay Later</span>
                </Link>

                <Link
                  to="/paylater/discountinvoices"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                    isPathActive("/paylater/discountinvoices") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
                  )}
                >
                  <Percent className="h-4 w-4" />
                  <span>Discount Invoice</span>
                </Link>
              </div>
            )}

            {isCollapsed && payLaterOpen && (
              <div className="absolute left-full ml-2 w-44 bg-white rounded shadow z-50">
                <Link to="/paylater/paylater" className="block px-3 py-2 text-sm hover:bg-slate-100">Pay Later</Link>
                <Link to="/paylater/discountinvoices" className="block px-3 py-2 text-sm hover:bg-slate-100">Discount Invoice</Link>
              </div>
            )}
          </div>
          {/* ---------- end Pay Later accordion ---------- */}

          {/* ---------- Telecaller Accordion ---------- */}
          <div className="px-1 group relative">
            <button
              type="button"
              onClick={() => setTelecallerOpen((s) => !s)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-dashboard-sidebar-hover",
                (isPathStartsWith("/telecaller") || telecallerOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
              )}
              title={isCollapsed ? "Telecaller" : undefined}
              aria-expanded={telecallerOpen}
            >
              <div className="flex items-center gap-3">
                <Phone
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    isPathStartsWith("/telecaller") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
                  )}
                />
                {!isCollapsed && (
                  <span
                    className={cn(
                      "font-medium transition-colors",
                      isPathStartsWith("/telecaller") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
                    )}
                  >
                    Telecaller
                  </span>
                )}
              </div>

              {!isCollapsed ? (
                <span className="flex items-center">
                  {telecallerOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
              ) : null}
            </button>

            {!isCollapsed && telecallerOpen && (
              <div className="mt-2 ml-9 space-y-1">
                <Link
                  to="/telecaller/telecallerlist"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                    isPathActive("/telecaller/telecallerlist") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
                  )}
                >
                  <Activity className="h-4 w-4" />
                  <span>Telecaller List</span>
                </Link>

                <Link
                  to="/telecaller/telecallerstatus"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                    isPathActive("/telecaller/telecallerstatus") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  <span>Telecaller Status</span>
                </Link>

                <Link
                  to="/telecaller/crmreport"
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                    isPathActive("/telecaller/crmreport") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>CRM Report</span>
                </Link>
              </div>
            )}

            {isCollapsed && telecallerOpen && (
              <div className="absolute left-full ml-2 w-44 bg-white rounded shadow z-50">
                <Link to="/telecaller/telecallerlist" className="block px-3 py-2 text-sm hover:bg-slate-100">Telecaller List</Link>
                <Link to="/telecaller/telecallerstatus" className="block px-3 py-2 text-sm hover:bg-slate-100">Telecaller Status</Link>
                <Link to="/telecaller/crmreport" className="block px-3 py-2 text-sm hover:bg-slate-100">CRM Report</Link>
              </div>
            )}
          </div>
          {/* ---------- end Telecaller accordion ---------- */}
        </nav>
      </div>

      {/* User Section (footer) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-dashboard-sidebar-hover flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* user area - unchanged */}
          </div>
        </div>
      )}

      {/* Inline CSS for scrollbar styling.
          - .sidebar-scroll is applied to the scrollable middle area.
          - Track inherits sidebar background via `background: inherit`.
          - Thumb uses a subtle contrast so it's visible on top of the sidebar.
      */}
      <style>{`
        /* WebKit browsers */
        .sidebar-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: inherit; /* track matches the sidebar background */
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.06); /* subtle thumb; tweak if your sidebar is light */
          border-radius: 8px;
          border: 2px solid transparent; /* gives a little separation */
          background-clip: padding-box;
        }

        /* On hover make thumb slightly more visible */
        .sidebar-scroll:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.12);
        }

        /* Firefox */
        .sidebar-scroll {
          scrollbar-width: thin;
          /* first value is thumb, second is track */
          scrollbar-color: rgba(255,255,255,0.06) transparent;
        }

        /* If your sidebar background is light, you might want a darker thumb.
           Consider toggling thumb color in CSS based on a theme class if needed.
        */
      `}</style>
    </div>
  );
};




