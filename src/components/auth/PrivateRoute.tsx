
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
  permissionRequired?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  permissionRequired 
}) => {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    // You could render a loading spinner here
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permissionRequired && !hasPermission(permissionRequired)) {
    // Redirect to home if the user doesn't have the required permission
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
