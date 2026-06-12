import React from 'react';
import { Navigate, useLocation } from 'react-router';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (userRole !== 'ROLE_ADMIN') {
    return <Navigate to="/student-dashboard" replace />;
  }

  return <>{children}</>;
}

export function RequireStudent({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (userRole === 'ROLE_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}