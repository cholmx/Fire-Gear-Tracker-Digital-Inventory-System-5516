import React from 'react';
import { useUsers } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiShield, FiLock } = FiIcons;

const RoleGuard = ({ 
  children, 
  permission, 
  role, 
  fallback = null,
  showMessage = true 
}) => {
  const { hasPermission } = useUsers();
  const { user } = useAuth();

  // Check permission if specified
  if (permission && !hasPermission(user, permission)) {
    if (fallback) return fallback;
    
    if (showMessage) {
      return (
        <div className="text-center py-8">
          <SafeIcon icon={FiLock} className="w-8 h-8 text-mission-text-muted mx-auto mb-2" />
          <p className="text-mission-text-muted text-sm">
            Access denied - insufficient permissions
          </p>
        </div>
      );
    }
    
    return null;
  }

  // Check role if specified
  if (role && user?.role !== role) {
    if (fallback) return fallback;
    
    if (showMessage) {
      return (
        <div className="text-center py-8">
          <SafeIcon icon={FiShield} className="w-8 h-8 text-mission-text-muted mx-auto mb-2" />
          <p className="text-mission-text-muted text-sm">
            Access denied - role required: {role}
          </p>
        </div>
      );
    }
    
    return null;
  }

  return children;
};

export default RoleGuard;