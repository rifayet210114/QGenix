// =========================================================================================
// src/components/AdminRoute.jsx — Route Security Guard for Admin Console
// -----------------------------------------------------------------------------------------
import React from 'react';
import { AdminRoute as BaseAdminRoute } from './RoleRoute';

export default function AdminRoute({ children }) {
  return <BaseAdminRoute>{children}</BaseAdminRoute>;
}
