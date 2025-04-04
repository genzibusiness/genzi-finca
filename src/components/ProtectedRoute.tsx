
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  console.log("ProtectedRoute - Current state:", { user, loading });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    console.log("ProtectedRoute - No user found, redirecting to /auth");
    return <Navigate to="/auth" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
