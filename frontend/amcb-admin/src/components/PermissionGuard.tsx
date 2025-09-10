import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  children, 
  fallback = <div className="text-gray-500 text-sm">Accès non autorisé</div> 
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Composants spécialisés pour des permissions communes
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="admin_management">
    {children}
  </PermissionGuard>
);

export const SuperAdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="super_admin">
    {children}
  </PermissionGuard>
);

export const UserManagementGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="users">
    {children}
  </PermissionGuard>
);

export const KYCManagementGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="kyc">
    {children}
  </PermissionGuard>
);

export const AccountManagementGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="accounts">
    {children}
  </PermissionGuard>
);

export const TransactionManagementGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="transactions">
    {children}
  </PermissionGuard>
);

export const SupportManagementGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="support">
    {children}
  </PermissionGuard>
);

export const ReportsGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="reports">
    {children}
  </PermissionGuard>
);

export const SettingsGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PermissionGuard permission="settings">
    {children}
  </PermissionGuard>
);
