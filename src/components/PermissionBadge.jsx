import React from 'react';
import { USER_ROLES } from '../contexts/UserContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiShield, FiUser, FiEye, FiEdit, FiTrash2, FiSettings } = FiIcons;

const PermissionBadge = ({ role, size = 'sm', showTooltip = true }) => {
  if (!role || !USER_ROLES[role]) return null;

  const roleData = USER_ROLES[role];
  
  const getIcon = (role) => {
    switch (role) {
      case 'fire-chief':
      case 'assistant-chief':
        return FiShield;
      case 'captain':
      case 'lieutenant':
        return FiUser;
      case 'inspector':
        return FiEye;
      default:
        return FiUser;
    }
  };

  const sizeClasses = {
    xs: 'px-1 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className="relative group">
      <span 
        className={`
          inline-flex items-center space-x-1 rounded-full font-roboto-mono font-medium
          ${sizeClasses[size]}
          ${roleData.color} bg-current/10 border border-current/30
        `}
      >
        <SafeIcon icon={getIcon(role)} className="w-3 h-3" />
        <span>{roleData.name.toUpperCase()}</span>
      </span>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <div className="bg-mission-bg-primary border border-mission-border rounded-lg p-3 shadow-xl min-w-64">
            <div className="text-sm font-inter-tight font-medium text-white mb-1">
              {roleData.name}
            </div>
            <div className="text-xs text-mission-text-muted mb-2">
              {roleData.description}
            </div>
            <div className="text-xs text-mission-text-muted">
              {roleData.permissions.length} permissions
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionBadge;