// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";

// type PublicRouteProps = {
//   children: React.ReactNode;
// };

// const PublicRoute = ({ children }: PublicRouteProps) => {
//   const { user, isLoading } = useAuth();

//   if (isLoading) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }

//   // If user is logged in → redirect to products (or dashboard)
//   if (user) {
//     return <Navigate to="/products" replace />;
//   }

//   // Else allow public access
//   return <>{children}</>;
// };

// export default PublicRoute;
// src/components/PublicRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // adjust path

type Props = { children: React.ReactNode };

const PublicRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export default PublicRoute;
