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

// NEW: SKU pages (place these files at src/pages/sku/ if not present)
import SkuList from "@/pages/SkuList";
import SkuMovement from "@/pages/SkuMovement";
import Sku from "@/pages/Sku";
import BeatList from "./pages/BeatList";

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
              path="/"
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

