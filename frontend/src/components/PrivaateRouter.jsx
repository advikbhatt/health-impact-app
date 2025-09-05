// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ user, children }) => {
  if (!user) {
    // 🚪 if no user → go to login
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;
