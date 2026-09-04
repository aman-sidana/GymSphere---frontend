import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("currentuser")) || null;

  if (!token || !currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = currentUser.role || "user";
    if (!allowedRoles.includes(userRole)) {
      if (userRole === "superadmin") return <Navigate to="/superadmin" replace />;
      if (userRole === "admin") return <Navigate to="/admin" replace />;
      if (userRole === "gym_manager") return <Navigate to="/manager" replace />;
      if (userRole === "trainer") return <Navigate to="/trainer" replace />;
      return <Navigate to="/user" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;