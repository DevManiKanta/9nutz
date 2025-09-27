// import React from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";

// type ProtectedRouteProps = {
//   children: React.ReactNode;
// };

// const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
//   const { user, isLoading } = useAuth();

//   if (isLoading) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;
// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // adjust path

type Props = { children: React.ReactNode };

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // while auth state is being resolved, show a loader to prevent redirect flicker
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (!isAuthenticated) {
    // redirect to login, preserve intended location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;





