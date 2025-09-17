// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { DashboardLayout } from "@/layouts/DashboardLayout";
// import Dashboard from "@/pages/Dashboard";
// import Products from "@/pages/Products";
// import RouteMap from "@/pages/RouteMap";
// import Employees from "@/pages/Employees";
// import Inventory from "@/pages/Inventory";
// import Franchise from "@/pages/Franchise";
// import Customer from "@/pages/Customer";  
// import CategoryWiseSale from "./pages/CategoryWiseSale";
// import StockVariation from "./pages/StockVariation";
// import NotFound from "@/pages/NotFound";
// import { AuthProvider } from "@/components/contexts/AuthContext";
// import { LoginForm } from "@/components/auth/LoginForm";
// // import { SignupForm } from "./components/auth/SignUpForm";
// import { ForgotPasswordForm } from "./components/auth/ForgotPasswordForm";
// import ProtectedRoute from "@/components/auth/ProtectedRoute";


// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <AuthProvider>
//         <BrowserRouter>
//           <Routes>
//             {/* Public Route */}
//             <Route path="/login" element={<LoginForm />} />
//             {/* <Route path="/signup" element={<SignupForm />} /> */}
//        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
//             {/* Protected Routes */}
//             <Route
//               path="/"
//               element={
//                 <ProtectedRoute>
//                   <DashboardLayout>
//                     <Dashboard />
//                   </DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/products"
//               element={
//                 <ProtectedRoute>
//                   <DashboardLayout>
//                     <Products />
//                   </DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/routemap"
//               element={
//                 <ProtectedRoute>
//                   <DashboardLayout>
//                     <RouteMap />
//                   </DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/employees"
//               element={
//                 <ProtectedRoute>
//                   <DashboardLayout>
//                     <Employees />
//                   </DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/inventory"
//               element={
//                 <ProtectedRoute>
//                   <DashboardLayout>
//                     <Inventory />
//                   </DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/franchise"
//               element={
//                 <ProtectedRoute>
//                   <DashboardLayout>
//                     <Franchise />
//                   </DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/customer"
//               element={
//                 <ProtectedRoute>
//                   <DashboardLayout>
//                     <Customer />
//                   </DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/categorywisesale"
//               element={
//                 <ProtectedRoute>
//                   <DashboardLayout>
//                     <CategoryWiseSale />
//                   </DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />
//             <Route
//               path="/StockVariation"
//               element={
//                 <ProtectedRoute>
//                   <DashboardLayout>
//                     <StockVariation />
//                   </DashboardLayout>
//                 </ProtectedRoute>
//               }
//             />

//             {/* Catch-all */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </BrowserRouter>
//       </AuthProvider>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import RouteMap from "@/pages/RouteMap";
import Employees from "@/pages/Employees";
import Inventory from "@/pages/Inventory";
import Franchise from "@/pages/Franchise";
import Customer from "@/pages/Customer";
import CategoryWiseSale from "./pages/CategoryWiseSale";
import StockVariation from "./pages/StockVariation";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/components/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
// import { SignupForm } from "./components/auth/SignUpForm";
import { ForgotPasswordForm } from "./components/auth/ForgotPasswordForm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OrderReport from "./pages/OrderReport";
import QrPayments from "./pages/QrPayments";
import PayLater from "./pages/PayLater";
import DiscountInvoices from "./pages/DiscountInvoices";
import TeleCallerList from "./pages/TeleCallerList";
import TeleCallerStatus from "./pages/TeleCallerStatus";
import CrmReport from "./pages/CrmReport";
import Obsales from "./pages/Obsales"

// NEW: SKU pages (place these files at src/pages/sku/ if not present)
import SkuList from "@/pages/SkuList";
import SkuMovement from "@/pages/SkuMovement";
import Sku from "@/pages/Sku";
import BeatList from "./pages/BeatList";
import ObSales from "./pages/Obsales";
import ExpenseSummary from "./pages/ExpenseSummary";
import CashWithdrawl from "./pages/CashWithdrawl";
import Billing from "./pages/Billing";
import RealTimeInventory from "./pages/RealTimeInventory";
import DailyInventory from "./pages/DailyInventory";
import SlocStock from "./pages/SlocStock";
import Settlement from "./pages/Settlement";
import PreShortSupply from "./pages/PreShortSupply";
import GstCacheProfitability from "./pages/GstCacheProfitability";
import GstReport from "./pages/GstReport";
import GstProfitability from "./pages/GstProfitability";
import GstCacheReport from "./pages/GstCacheReport";
import NewVendor from "./pages/NewVendor";
import VendorList from "./pages/VendorList";
import NewRevisit from "./pages/NewRevisit";
import RevisitList from "./pages/RevisitList";
import CategoryManagement from "./pages/CategoryManagement";
import MasterManagement from "./pages/MasterManagement";
import RouteManagement from "./pages/RouteManagement";
import AssetsManagement from "./pages/AssetsManagement";
import ConsolidatedVehiclePay from "./pages/ConsolidatedVehiclePay";
import RentVehiclePaymentsList from "./pages/RentVehiclePaymentsList";
import VehiclePaymentsList from "./pages/VehiclePaymentsList";
import ItUpdates from "./pages/ItUpdates";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginForm />} />
            {/* <Route path="/signup" element={<SignupForm />} /> */}
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Products />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/routemap"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <RouteMap />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Employees />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Inventory />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/franchise"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Franchise />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Customer />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/categorywisesale"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CategoryWiseSale />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/StockVariation"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <StockVariation />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/BeatList"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <BeatList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* ---------- SKU routes (new) ---------- */}
            <Route
              path="/sku/list"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SkuList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sku/movement"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SkuMovement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sku/sku"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Sku />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* ---------- end SKU routes ---------- */}
            <Route
              path="/OrderReport"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <OrderReport />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
              <Route
              path="/QrPayments"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <QrPayments />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
              {/* ---------- PAY later routes (new) ---------- */}
              <Route
              path="/PayLater/Paylater"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PayLater />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/PayLater/DiscountInvoices"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DiscountInvoices />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
                 {/* ---------- end PAY later routes  ---------- */}
    {/* ---------- TeleCaller routes (new) ---------- */}
            <Route
              path="/Telecaller/TelecallerList"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <TeleCallerList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/Telecaller/TelecallerStatus"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <TeleCallerStatus />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/Telecaller/CrmReport"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CrmReport />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* ---------- end TeleCaller routes ---------- */}
             <Route
              path="/Telecaller/CrmReport"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CrmReport />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
              <Route
              path="/ObSales"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ObSales />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/ExpenseSummary"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ExpenseSummary />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/CashWithdrawl"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CashWithdrawl />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/Billing"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Billing />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/DailyInventory"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DailyInventory />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/RealTimeInventory"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <RealTimeInventory />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
               <Route
              path="/SlocStock"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SlocStock />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/Settlement"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Settlement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/PreShortSupply"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PreShortSupply />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

             {/* ---------- GST routes (new) ---------- */}
            <Route
              path="/Gst/GstCacheProfitability"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <GstCacheProfitability />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/Gst/GstCacheReport"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <GstCacheReport />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/Gst/GstProfitability"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <GstProfitability />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/Gst/GstReport"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <GstReport />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* ---------- end GST routes ---------- */}
 
            {/* ---------- start VENDOR routes ---------- */}
            <Route
              path="/NewVendor"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <NewVendor />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/VendorList"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <VendorList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             
           {/* ---------- end VENDOR routes ---------- */}

            {/* ---------- start REVIST routes ---------- */}
            <Route
              path="/NewRevist"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <NewRevisit />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/RevisitList"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <RevisitList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
           {/* ---------- end REVISIT routes ---------- */}


            {/* ---------- start MANAGEMENT routes ---------- */}
            <Route
              path="Management/AssetsManagement"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AssetsManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="Management/RouteManagement"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <RouteManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="Management/MasterManagement"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MasterManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="Management/CategoryManagement"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CategoryManagement />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
           {/* ---------- end MANAGEMENT routes ---------- */}
            <Route
              path="VehiclePayments/VehiclePaymentsList"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <VehiclePaymentsList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="VehiclePayments/RentVehiclePaymentsList"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <RentVehiclePaymentsList />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="VehiclePayments/ConsolidatedVehiclePay"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ConsolidatedVehiclePay />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/ItUpdates"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ItUpdates />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <NotFound />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

