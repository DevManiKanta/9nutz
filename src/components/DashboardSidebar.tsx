
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
//   DollarSign,
//   PlusCircle
// } from "lucide-react";

// interface SidebarProps {
//   isCollapsed: boolean;
//   onToggle: () => void;
// }

// const navigationItems = [
//   { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: Home },
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
//   { id: "ObSales", label: "OB Sales", path: "/ObSales", icon: DollarSign },
//   { id: "ExpenseSummary", label: "Expense Summary", path: "/ExpenseSummary", icon: DollarSign },
//   { id: "CashWithdrawl", label: "Cash Withdrawl", path: "/CashWithdrawl", icon: DollarSign },
//   { id: "Billing", label: "Billing", path: "/Billing", icon: DollarSign },
//   { id: "DailyInventory", label: "Daily Inventory", path: "/DailyInventory", icon: DollarSign },
//   { id: "RealTimeInventory", label: "Real Time Inventory", path: "/RealTimeInventory", icon: DollarSign },
//   { id: "SlocStock", label: "Sloc Stock", path: "/SlocStock", icon: FileText },
//   { id: "Settlement", label: "Settlement", path: "/Settlement", icon: FileText },
//   { id: "PreShortSupply", label: "PreShortSupply", path: "/PreShortSupply", icon: FileText },
//     { id: "ItUpdates", label: "IT Update", path: "/Itupdates", icon: FileText },
// ];

// export const DashboardSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
//   const location = useLocation();
//   const [skuOpen, setSkuOpen] = useState<boolean>(false);
//   const [payLaterOpen, setPayLaterOpen] = useState<boolean>(false);
//   const [telecallerOpen, setTelecallerOpen] = useState<boolean>(false);
//   const [Gst, setGst] = useState<boolean>(false);
//   const [vendorOpen, setVendorOpen] = useState<boolean>(false); // <-- new vendor accordion state

//   // normalize once for case-insensitive comparisons
//   const pathname = location.pathname.toLowerCase();

//   // helpers (case-insensitive)
//   const isPathActive = (path: string) => pathname === path.toLowerCase();
//   const isPathStartsWith = (prefix: string) => pathname.startsWith(prefix.toLowerCase());

//   return (
//     <div
//       className={cn(
//         // ensure flex-col so header and footer stay fixed and middle can scroll
//         "bg-dashboard-sidebar text-dashboard-sidebar-foreground h-screen flex flex-col border-r border-dashboard-sidebar-hover",
//         isCollapsed ? "w-16" : "w-64"
//       )}
//     >
//       {/* header */}
//       <div className="h-16 flex items-center justify-between px-4 border-b border-dashboard-sidebar-hover flex-shrink-0">
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

//       {/* ===== Middle scrollable area ===== */}
//       <div className="flex-1 overflow-y-auto sidebar-scroll py-4">
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
//                   to="/sku/sku"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/sku/sku") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
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
//                 <Link to="/sku/sku" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU Check</Link>
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

//           {/* ---------- GST Accordion (fixed) ---------- */}
//           <div className="px-1 group relative">
//             <button
//               type="button"
//               onClick={() => setGst((s) => !s)}
//               className={cn(
//                 "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
//                 "hover:bg-dashboard-sidebar-hover",
//                 (isPathStartsWith("/gst") || Gst) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//               )}
//               title={isCollapsed ? "GST" : undefined}
//               aria-expanded={Gst}
//             >
//               <div className="flex items-center gap-3">
//                 <Percent
//                   className={cn(
//                     "h-5 w-5 flex-shrink-0 transition-colors",
//                     isPathStartsWith("/gst") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
//                   )}
//                 />
//                 {!isCollapsed && (
//                   <span
//                     className={cn(
//                       "font-medium transition-colors",
//                       isPathStartsWith("/gst") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
//                     )}
//                   >
//                     GST
//                   </span>
//                 )}
//               </div>

//               {!isCollapsed ? (
//                 <span className="flex items-center">
//                   {Gst ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//                 </span>
//               ) : null}
//             </button>

//             {!isCollapsed && Gst && (
//               <div className="mt-2 ml-9 space-y-1">
//                 <Link
//                   to="/gst/gstcacheprofitability"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/gst/gstcacheprofitability") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <BarChart3 className="h-4 w-4" />
//                   <span>GST Cache Profitability</span>
//                 </Link>

//                 <Link
//                   to="/gst/gstcachereport"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/gst/gstcachereport") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <FileText className="h-4 w-4" />
//                   <span>GST Cache Report</span>
//                 </Link>

//                 <Link
//                   to="/gst/gstprofitability"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/gst/gstprofitability") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <BarChart3 className="h-4 w-4" />
//                   <span>GST Profitability</span>
//                 </Link>

//                 <Link
//                   to="/gst/gstreport"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/gst/gstreport") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <FileText className="h-4 w-4" />
//                   <span>GST Report</span>
//                 </Link>
//               </div>
//             )}

//             {isCollapsed && Gst && (
//               <div className="absolute left-full ml-2 w-56 bg-white rounded shadow z-50">
//                 <Link to="/gst/gstcacheprofitability" className="block px-3 py-2 text-sm hover:bg-slate-100">GST Cache Profitability</Link>
//                 <Link to="/gst/gstcachereport" className="block px-3 py-2 text-sm hover:bg-slate-100">GST Cache Report</Link>
//                 <Link to="/gst/gstprofitability" className="block px-3 py-2 text-sm hover:bg-slate-100">GST Profitability</Link>
//                 <Link to="/gst/gstreport" className="block px-3 py-2 text-sm hover:bg-slate-100">GST Report</Link>
//               </div>
//             )}
//           </div>
//           {/* ---------- end GST accordion ---------- */}

//           {/* ---------- VENDOR Accordion (new) ---------- */}
//           <div className="px-1 group relative">
//             <button
//               type="button"
//               onClick={() => setVendorOpen((s) => !s)}
//               className={cn(
//                 "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
//                 "hover:bg-dashboard-sidebar-hover",
//                 (isPathStartsWith("/newvendor") || isPathStartsWith("/vendorlist") || vendorOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//               )}
//               title={isCollapsed ? "Vendor" : undefined}
//               aria-expanded={vendorOpen}
//             >
//               <div className="flex items-center gap-3">
//                 <Building2
//                   className={cn(
//                     "h-5 w-5 flex-shrink-0 transition-colors",
//                     (isPathStartsWith("/newvendor") || isPathStartsWith("/vendorlist")) ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
//                   )}
//                 />
//                 {!isCollapsed && (
//                   <span
//                     className={cn(
//                       "font-medium transition-colors",
//                       (isPathStartsWith("/newvendor") || isPathStartsWith("/vendorlist")) ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground"
//                     )}
//                   >
//                     Vendor
//                   </span>
//                 )}
//               </div>

//               {!isCollapsed ? (
//                 <span className="flex items-center">
//                   {vendorOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
//                 </span>
//               ) : null}
//             </button>

//             {/* vendor submenu */}
//             {!isCollapsed && vendorOpen && (
//               <div className="mt-2 ml-9 space-y-1">
//                 <Link
//                   to="/NewVendor"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/NewVendor") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <PlusCircle className="h-4 w-4" />
//                   <span>New Vendor</span>
//                 </Link>

//                 <Link
//                   to="/VendorList"
//                   className={cn(
//                     "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
//                     isPathActive("/VendorList") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
//                   )}
//                 >
//                   <FileText className="h-4 w-4" />
//                   <span>Vendor List</span>
//                 </Link>
//               </div>
//             )}

//             {/* collapsed hover menu for vendor */}
//             {isCollapsed && vendorOpen && (
//               <div className="absolute left-full ml-2 w-44 bg-white rounded shadow z-50">
//                 <Link to="/NewVendor" className="block px-3 py-2 text-sm hover:bg-slate-100">New Vendor</Link>
//                 <Link to="/VendorList" className="block px-3 py-2 text-sm hover:bg-slate-100">Vendor List</Link>
//               </div>
//             )}
//           </div>
//           {/* ---------- end VENDOR accordion ---------- */}
//         </nav>
//       </div>

//       {/* User Section (footer) */}
//       {!isCollapsed && (
//         <div className="p-4 border-t border-dashboard-sidebar-hover flex-shrink-0">
//           <div className="flex items-center gap-3">
//             {/* user area - unchanged */}
//           </div>
//         </div>
//       )}

//       {/* Inline CSS for scrollbar styling. */}
//       <style>{`
//         .sidebar-scroll::-webkit-scrollbar {
//           width: 8px;
//         }
//         .sidebar-scroll::-webkit-scrollbar-track {
//           background: inherit;
//         }
//         .sidebar-scroll::-webkit-scrollbar-thumb {
//           background-color: rgba(255,255,255,0.06);
//           border-radius: 8px;
//           border: 2px solid transparent;
//           background-clip: padding-box;
//         }
//         .sidebar-scroll:hover::-webkit-scrollbar-thumb {
//           background-color: rgba(255,255,255,0.12);
//         }
//         .sidebar-scroll {
//           scrollbar-width: thin;
//           scrollbar-color: rgba(255,255,255,0.06) transparent;
//         }
//       `}</style>
//     </div>
//   );
// };

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
  DollarSign,
  PlusCircle,
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
  { id: "customerSaleHistory", label: "Customer Sale History", path: "/categorywisesale", icon: BarChart3 },
  { id: "StockVariation", label: "Stock Variation", path: "/stockvariation", icon: Repeat },
  { id: "BeatList", label: "Beat List", path: "/beatlist", icon: MapPin },
  { id: "OrderReport", label: "Order Report", path: "/orderreport", icon: FileText },
  { id: "QrPayments", label: "Qr Payments", path: "/qrpayments", icon: QrCode },
  { id: "ObSales", label: "OB Sales", path: "/ObSales", icon: DollarSign },
  { id: "ExpenseSummary", label: "Expense Summary", path: "/ExpenseSummary", icon: CreditCard },
  { id: "CashWithdrawl", label: "Cash Withdrawl", path: "/CashWithdrawl", icon: DollarSign },
  { id: "Billing", label: "Billing", path: "/Billing", icon: CreditCard },
  { id: "DailyInventory", label: "Daily Inventory", path: "/DailyInventory", icon: ClipboardList },
  { id: "RealTimeInventory", label: "Real Time Inventory", path: "/RealTimeInventory", icon: Box },
  { id: "SlocStock", label: "Sloc Stock", path: "/SlocStock", icon: FileText },
  { id: "Settlement", label: "Settlement", path: "/Settlement", icon: CheckSquare },
  { id: "PreShortSupply", label: "PreShortSupply", path: "/PreShortSupply", icon: Percent },
  { id: "ItUpdates", label: "IT Update", path: "/Itupdates", icon: FileText },
];

export const DashboardSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  // accordions state
  const [skuOpen, setSkuOpen] = useState(false);
  const [payLaterOpen, setPayLaterOpen] = useState(false);
  const [telecallerOpen, setTelecallerOpen] = useState(false);
  const [gstOpen, setGstOpen] = useState(false);
  const [vendorOpen, setVendorOpen] = useState(false);
  const [revisitOpen, setRevisitOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);

  // helpers that consider nested child routes active too
  const isPathActive = (path: string) => {
    const p = path.toLowerCase();
    return pathname === p || pathname.startsWith(p + "/");
  };
  const isPathStartsWith = (prefix: string) => pathname.startsWith(prefix.toLowerCase());

  // auto-open accordions when visiting a child route
  useEffect(() => {
    setSkuOpen(isPathStartsWith("/sku"));
    setPayLaterOpen(isPathStartsWith("/paylater"));
    setTelecallerOpen(isPathStartsWith("/telecaller"));
    setGstOpen(isPathStartsWith("/gst"));
    // vendor uses explicit top-level routes
    setVendorOpen(isPathStartsWith("/newvendor") || isPathStartsWith("/vendorlist"));
    // revisit, management, vehicle
    setRevisitOpen(isPathStartsWith("/newrevist") || isPathStartsWith("/revisitlist"));
    setManagementOpen(isPathStartsWith("/management/"));
    setVehicleOpen(isPathStartsWith("/vehiclepayments/"));
  }, [pathname]);

  return (
    <div
      className={cn(
        "bg-dashboard-sidebar text-dashboard-sidebar-foreground h-screen flex flex-col border-r border-dashboard-sidebar-hover",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-dashboard-sidebar-hover flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden" />
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

      {/* nav */}
      <div className="flex-1 overflow-y-auto sidebar-scroll py-4">
        <div className="px-3 mb-4" />
        <nav className="space-y-1 px-2">
          {/* top-level navigation items */}
          {navigationItems.map((item) => {
            const Icon = item.icon as any;
            const active = isPathActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group hover:bg-dashboard-sidebar-hover",
                  active && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", active ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")} />
                {!isCollapsed && (
                  <span className={cn("font-medium transition-colors", active ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")}>
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
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-dashboard-sidebar-hover",
                (isPathStartsWith("/sku") || skuOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
              )}
              title={isCollapsed ? "SKU" : undefined}
              aria-expanded={skuOpen}
            >
              <div className="flex items-center gap-3">
                <Box className={cn("h-5 w-5 flex-shrink-0 transition-colors", isPathStartsWith("/sku") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")} />
                {!isCollapsed && <span className={cn("font-medium transition-colors", isPathStartsWith("/sku") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")}>SKU</span>}
              </div>
              {!isCollapsed ? <span className="flex items-center">{skuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span> : null}
            </button>

            {!isCollapsed && skuOpen && (
              <div className="mt-2 ml-9 space-y-1">
                <Link to="/sku/list" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/sku/list") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <Repeat className="h-4 w-4" />
                  <span>SKU List</span>
                </Link>

                <Link to="/sku/movement" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/sku/movement") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <Package className="h-4 w-4" />
                  <span>SKU Movement</span>
                </Link>

                <Link to="/sku/sku" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/sku/sku") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <CheckSquare className="h-4 w-4" />
                  <span>SKU Check</span>
                </Link>
              </div>
            )}

            {isCollapsed && skuOpen && (
              <div className="absolute left-full ml-2 w-44 bg-white rounded shadow z-50">
                <Link to="/sku/list" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU List</Link>
                <Link to="/sku/movement" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU Movement</Link>
                <Link to="/sku/sku" className="block px-3 py-2 text-sm hover:bg-slate-100">SKU Check</Link>
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
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-dashboard-sidebar-hover",
                (isPathStartsWith("/paylater") || payLaterOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
              )}
              title={isCollapsed ? "Pay Later" : undefined}
              aria-expanded={payLaterOpen}
            >
              <div className="flex items-center gap-3">
                <CreditCard className={cn("h-5 w-5 flex-shrink-0 transition-colors", isPathStartsWith("/paylater") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")} />
                {!isCollapsed && <span className={cn("font-medium transition-colors", isPathStartsWith("/paylater") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")}>Pay Later</span>}
              </div>
              {!isCollapsed ? <span className="flex items-center">{payLaterOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span> : null}
            </button>

            {!isCollapsed && payLaterOpen && (
              <div className="mt-2 ml-9 space-y-1">
                <Link to="/paylater/paylater" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/paylater/paylater") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <CreditCard className="h-4 w-4" />
                  <span>Pay Later</span>
                </Link>

                <Link to="/paylater/discountinvoices" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/paylater/discountinvoices") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
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
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-dashboard-sidebar-hover",
                (isPathStartsWith("/telecaller") || telecallerOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
              )}
              title={isCollapsed ? "Telecaller" : undefined}
              aria-expanded={telecallerOpen}
            >
              <div className="flex items-center gap-3">
                <Phone className={cn("h-5 w-5 flex-shrink-0 transition-colors", isPathStartsWith("/telecaller") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")} />
                {!isCollapsed && <span className={cn("font-medium transition-colors", isPathStartsWith("/telecaller") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")}>Telecaller</span>}
              </div>
              {!isCollapsed ? <span className="flex items-center">{telecallerOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span> : null}
            </button>

            {!isCollapsed && telecallerOpen && (
              <div className="mt-2 ml-9 space-y-1">
                <Link to="/telecaller/telecallerlist" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/telecaller/telecallerlist") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <Activity className="h-4 w-4" />
                  <span>Telecaller List</span>
                </Link>

                <Link to="/telecaller/telecallerstatus" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/telecaller/telecallerstatus") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <FileText className="h-4 w-4" />
                  <span>Telecaller Status</span>
                </Link>

                <Link to="/telecaller/crmreport" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/telecaller/crmreport") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
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

          {/* ---------- GST Accordion ---------- */}
          <div className="px-1 group relative">
            <button
              type="button"
              onClick={() => setGstOpen((s) => !s)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-dashboard-sidebar-hover",
                (isPathStartsWith("/gst") || gstOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
              )}
              title={isCollapsed ? "GST" : undefined}
              aria-expanded={gstOpen}
            >
              <div className="flex items-center gap-3">
                <Percent className={cn("h-5 w-5 flex-shrink-0 transition-colors", isPathStartsWith("/gst") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")} />
                {!isCollapsed && <span className={cn("font-medium transition-colors", isPathStartsWith("/gst") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")}>GST</span>}
              </div>
              {!isCollapsed ? <span className="flex items-center">{gstOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span> : null}
            </button>

            {!isCollapsed && gstOpen && (
              <div className="mt-2 ml-9 space-y-1">
                <Link to="/gst/gstcacheprofitability" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/gst/gstcacheprofitability") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <BarChart3 className="h-4 w-4" />
                  <span>GST Cache Profitability</span>
                </Link>

                <Link to="/gst/gstcachereport" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/gst/gstcachereport") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <FileText className="h-4 w-4" />
                  <span>GST Cache Report</span>
                </Link>

                <Link to="/gst/gstprofitability" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/gst/gstprofitability") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <BarChart3 className="h-4 w-4" />
                  <span>GST Profitability</span>
                </Link>

                <Link to="/gst/gstreport" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/gst/gstreport") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <FileText className="h-4 w-4" />
                  <span>GST Report</span>
                </Link>
              </div>
            )}

            {isCollapsed && gstOpen && (
              <div className="absolute left-full ml-2 w-56 bg-white rounded shadow z-50">
                <Link to="/gst/gstcacheprofitability" className="block px-3 py-2 text-sm hover:bg-slate-100">GST Cache Profitability</Link>
                <Link to="/gst/gstcachereport" className="block px-3 py-2 text-sm hover:bg-slate-100">GST Cache Report</Link>
                <Link to="/gst/gstprofitability" className="block px-3 py-2 text-sm hover:bg-slate-100">GST Profitability</Link>
                <Link to="/gst/gstreport" className="block px-3 py-2 text-sm hover:bg-slate-100">GST Report</Link>
              </div>
            )}
          </div>
          {/* ---------- end GST accordion ---------- */}

          {/* ---------- VENDOR Accordion ---------- */}
          <div className="px-1 group relative">
            <button
              type="button"
              onClick={() => setVendorOpen((s) => !s)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-dashboard-sidebar-hover",
                (isPathStartsWith("/newvendor") || isPathStartsWith("/vendorlist") || vendorOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
              )}
              title={isCollapsed ? "Vendor" : undefined}
              aria-expanded={vendorOpen}
            >
              <div className="flex items-center gap-3">
                <Building2 className={cn("h-5 w-5 flex-shrink-0 transition-colors", (isPathStartsWith("/newvendor") || isPathStartsWith("/vendorlist")) ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")} />
                {!isCollapsed && <span className={cn("font-medium transition-colors", (isPathStartsWith("/newvendor") || isPathStartsWith("/vendorlist")) ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")}>Vendor</span>}
              </div>
              {!isCollapsed ? <span className="flex items-center">{vendorOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span> : null}
            </button>

            {!isCollapsed && vendorOpen && (
              <div className="mt-2 ml-9 space-y-1">
                <Link to="/NewVendor" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/NewVendor") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <PlusCircle className="h-4 w-4" />
                  <span>New Vendor</span>
                </Link>

                <Link to="/VendorList" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/VendorList") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <FileText className="h-4 w-4" />
                  <span>Vendor List</span>
                </Link>
              </div>
            )}

            {isCollapsed && vendorOpen && (
              <div className="absolute left-full ml-2 w-44 bg-white rounded shadow z-50">
                <Link to="/NewVendor" className="block px-3 py-2 text-sm hover:bg-slate-100">New Vendor</Link>
                <Link to="/VendorList" className="block px-3 py-2 text-sm hover:bg-slate-100">Vendor List</Link>
              </div>
            )}
          </div>
          {/* ---------- end VENDOR accordion ---------- */}

          {/* ---------- Revisit accordion ---------- */}
          <div className="px-1 group relative">
            <button
              type="button"
              onClick={() => setRevisitOpen((s) => !s)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-dashboard-sidebar-hover",
                (isPathStartsWith("/newrevist") || isPathStartsWith("/revisitlist") || revisitOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
              )}
              title={isCollapsed ? "Revisit" : undefined}
              aria-expanded={revisitOpen}
            >
              <div className="flex items-center gap-3">
                <MapPin className={cn("h-5 w-5 flex-shrink-0 transition-colors", (isPathStartsWith("/newrevist") || isPathStartsWith("/revisitlist")) ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")} />
                {!isCollapsed && <span className={cn("font-medium transition-colors", (isPathStartsWith("/newrevist") || isPathStartsWith("/revisitlist")) ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")}>Revisit</span>}
              </div>
              {!isCollapsed ? <span className="flex items-center">{revisitOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span> : null}
            </button>

            {!isCollapsed && revisitOpen && (
              <div className="mt-2 ml-9 space-y-1">
                <Link to="/NewRevist" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/NewRevist") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <PlusCircle className="h-4 w-4" />
                  <span>NewRevist</span>
                </Link>

                <Link to="/RevisitList" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/RevisitList") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <FileText className="h-4 w-4" />
                  <span>RevisitList</span>
                </Link>
              </div>
            )}

            {isCollapsed && revisitOpen && (
              <div className="absolute left-full ml-2 w-44 bg-white rounded shadow z-50">
                <Link to="/NewRevist" className="block px-3 py-2 text-sm hover:bg-slate-100">NewRevist</Link>
                <Link to="/RevisitList" className="block px-3 py-2 text-sm hover:bg-slate-100">RevisitList</Link>
              </div>
            )}
          </div>
          {/* ---------- end Revisit accordion ---------- */}

          {/* ---------- Management accordion ---------- */}
          <div className="px-1 group relative">
            <button
              type="button"
              onClick={() => setManagementOpen((s) => !s)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-dashboard-sidebar-hover",
                (isPathStartsWith("/management/") || managementOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
              )}
              title={isCollapsed ? "Management" : undefined}
              aria-expanded={managementOpen}
            >
              <div className="flex items-center gap-3">
                <Users className={cn("h-5 w-5 flex-shrink-0 transition-colors", isPathStartsWith("/management/") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")} />
                {!isCollapsed && <span className={cn("font-medium transition-colors", isPathStartsWith("/management/") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")}>Management</span>}
              </div>
              {!isCollapsed ? <span className="flex items-center">{managementOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span> : null}
            </button>

            {!isCollapsed && managementOpen && (
              <div className="mt-2 ml-9 space-y-1">
                <Link to="/Management/AssetsManagement" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/Management/AssetsManagement") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <FileText className="h-4 w-4" />
                  <span>AssetsManagement</span>
                </Link>

                <Link to="/Management/RouteManagement" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/Management/RouteManagement") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <Map className="h-4 w-4" />
                  <span>RouteManagement</span>
                </Link>

                <Link to="/Management/MasterManagement" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/Management/MasterManagement") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <FileText className="h-4 w-4" />
                  <span>MasterManagement</span>
                </Link>

                <Link to="/Management/CategoryManagement" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/Management/CategoryManagement") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <ClipboardList className="h-4 w-4" />
                  <span>CategoryManagement</span>
                </Link>
              </div>
            )}

            {isCollapsed && managementOpen && (
              <div className="absolute left-full ml-2 w-56 bg-white rounded shadow z-50">
                <Link to="/Management/AssetsManagement" className="block px-3 py-2 text-sm hover:bg-slate-100">AssetsManagement</Link>
                <Link to="/Management/RouteManagement" className="block px-3 py-2 text-sm hover:bg-slate-100">RouteManagement</Link>
                <Link to="/Management/MasterManagement" className="block px-3 py-2 text-sm hover:bg-slate-100">MasterManagement</Link>
                <Link to="/Management/CategoryManagement" className="block px-3 py-2 text-sm hover:bg-slate-100">CategoryManagement</Link>
              </div>
            )}
          </div>
          {/* ---------- end Management accordion ---------- */}

          {/* ---------- Vehicle Payments accordion ---------- */}
          <div className="px-1 group relative">
            <button
              type="button"
              onClick={() => setVehicleOpen((s) => !s)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-dashboard-sidebar-hover",
                (isPathStartsWith("/vehiclepayments/") || vehicleOpen) && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active"
              )}
              title={isCollapsed ? "Vehicle Payments" : undefined}
              aria-expanded={vehicleOpen}
            >
              <div className="flex items-center gap-3">
                <CreditCard className={cn("h-5 w-5 flex-shrink-0 transition-colors", isPathStartsWith("/vehiclepayments/") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")} />
                {!isCollapsed && <span className={cn("font-medium transition-colors", isPathStartsWith("/vehiclepayments/") ? "text-dashboard-sidebar-active" : "text-dashboard-sidebar-foreground")}>Vehicle Payments</span>}
              </div>
              {!isCollapsed ? <span className="flex items-center">{vehicleOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span> : null}
            </button>

            {!isCollapsed && vehicleOpen && (
              <div className="mt-2 ml-9 space-y-1">
                <Link to="/VehiclePayments/VehiclePaymentsList" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/VehiclePayments/VehiclePaymentsList") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <FileText className="h-4 w-4" />
                  <span>VehiclePaymentsList</span>
                </Link>

                <Link to="/VehiclePayments/RentVehiclePaymentsList" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/VehiclePayments/RentVehiclePaymentsList") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <FileText className="h-4 w-4" />
                  <span>RentVehiclePaymentsList</span>
                </Link>

                <Link to="/VehiclePayments/ConsolidatedVehiclePay" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isPathActive("/VehiclePayments/ConsolidatedVehiclePay") && "bg-dashboard-sidebar-active/10 border-l-4 border-dashboard-sidebar-active")}>
                  <FileText className="h-4 w-4" />
                  <span>ConsolidatedVehiclePay</span>
                </Link>
              </div>
            )}

            {isCollapsed && vehicleOpen && (
              <div className="absolute left-full ml-2 w-56 bg-white rounded shadow z-50">
                <Link to="/VehiclePayments/VehiclePaymentsList" className="block px-3 py-2 text-sm hover:bg-slate-100">VehiclePaymentsList</Link>
                <Link to="/VehiclePayments/RentVehiclePaymentsList" className="block px-3 py-2 text-sm hover:bg-slate-100">RentVehiclePaymentsList</Link>
                <Link to="/VehiclePayments/ConsolidatedVehiclePay" className="block px-3 py-2 text-sm hover:bg-slate-100">ConsolidatedVehiclePay</Link>
              </div>
            )}
          </div>
          {/* ---------- end Vehicle Payments accordion ---------- */}
        </nav>
      </div>

      {/* footer / user */}
      {!isCollapsed && (
        <div className="p-4 border-t border-dashboard-sidebar-hover flex-shrink-0">
          <div className="flex items-center gap-3">{/* user area */}</div>
        </div>
      )}
      {/* scrollbar styling */}
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 8px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: inherit; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.06); border-radius: 8px; border: 2px solid transparent; background-clip: padding-box; }
        .sidebar-scroll:hover::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.12); }
        .sidebar-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent; }
      `}</style>
    </div>
  );
};







