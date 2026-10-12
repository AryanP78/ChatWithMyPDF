import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AppLayout from "../layout/Applayout";
import { useAuth } from "../../Context/AuthContext";

const ProtecteRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>loading...</p>
      </div>
    );
  }

  return isAuthenticated ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtecteRoute;
