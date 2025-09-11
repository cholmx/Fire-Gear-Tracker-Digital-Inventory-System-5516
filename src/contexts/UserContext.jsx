import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const UserContext = createContext();

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

// User roles and permissions
export const USER_ROLES = {
  'fire-chief': {
    name: 'Fire Chief',
    description: 'Full administrative access to all features and data',
    color: 'text-red-400',
    permissions: [
      'view_all_equipment',
      'edit_all_equipment',
      'delete_equipment',
      'manage_stations',
      'manage_inspections',
      'manage_users',
      'view_reports',
      'export_data',
      'system_settings'
    ]
  },
  'assistant-chief': {
    name: 'Assistant Chief',
    description: 'Administrative access with some restrictions',
    color: 'text-orange-400',
    permissions: [
      'view_all_equipment',
      'edit_all_equipment',
      'delete_equipment',
      'manage_stations',
      'manage_inspections',
      'view_reports',
      'export_data'
    ]
  },
  'captain': {
    name: 'Captain',
    description: 'Station-level management and equipment oversight',
    color: 'text-blue-400',
    permissions: [
      'view_all_equipment',
      'edit_assigned_equipment',
      'manage_assigned_stations',
      'manage_inspections',
      'view_reports'
    ]
  },
  'lieutenant': {
    name: 'Lieutenant',
    description: 'Equipment management and inspection scheduling',
    color: 'text-green-400',
    permissions: [
      'view_all_equipment',
      'edit_assigned_equipment',
      'manage_inspections',
      'view_reports'
    ]
  },
  'firefighter': {
    name: 'Firefighter',
    description: 'View equipment status and basic updates',
    color: 'text-purple-400',
    permissions: [
      'view_assigned_equipment',
      'update_equipment_status',
      'view_inspections'
    ]
  },
  'inspector': {
    name: 'Inspector',
    description: 'Inspection management and compliance tracking',
    color: 'text-cyan-400',
    permissions: [
      'view_all_equipment',
      'manage_inspections',
      'view_reports',
      'export_inspection_data'
    ]
  }
};

export const PERMISSION_DESCRIPTIONS = {
  'view_all_equipment': 'View equipment across all stations',
  'view_assigned_equipment': 'View equipment at assigned stations only',
  'edit_all_equipment': 'Edit any equipment item',
  'edit_assigned_equipment': 'Edit equipment at assigned stations only',
  'delete_equipment': 'Delete equipment items',
  'update_equipment_status': 'Update equipment status and notes',
  'manage_stations': 'Add, edit, and delete stations',
  'manage_assigned_stations': 'Manage assigned stations only',
  'manage_inspections': 'Schedule and manage inspections',
  'manage_users': 'Add, edit, and delete user accounts',
  'view_reports': 'Access reports and analytics',
  'view_inspections': 'View inspection schedules and status',
  'export_data': 'Export equipment and inspection data',
  'export_inspection_data': 'Export inspection data only',
  'system_settings': 'Access system settings and configuration'
};

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load users from localStorage
    const savedUsers = localStorage.getItem('fire-gear-users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialize with default admin user
      const defaultAdmin = {
        id: uuidv4(),
        email: 'admin@firedept.gov',
        firstName: 'Fire',
        lastName: 'Chief',
        role: 'fire-chief',
        department: 'Fire Department',
        assignedStations: [], // Empty means all stations
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      };
      setUsers([defaultAdmin]);
      localStorage.setItem('fire-gear-users', JSON.stringify([defaultAdmin]));
    }

    // Set current user (in real app, this would come from auth)
    const currentUserData = localStorage.getItem('fire-gear-current-user');
    if (currentUserData) {
      setCurrentUser(JSON.parse(currentUserData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fire-gear-users', JSON.stringify(users));
  }, [users]);

  // User management functions
  const addUser = (userData) => {
    const newUser = {
      id: uuidv4(),
      ...userData,
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'system'
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id, updates) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
    ));
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const setUserStatus = (id, status) => {
    updateUser(id, { status, statusChangedAt: new Date().toISOString() });
  };

  // Permission checking functions
  const hasPermission = (user, permission) => {
    if (!user || !user.role) return false;
    const role = USER_ROLES[user.role];
    return role && role.permissions.includes(permission);
  };

  const canAccessStation = (user, stationId) => {
    if (!user) return false;
    
    // Fire Chief and Assistant Chief can access all stations
    if (['fire-chief', 'assistant-chief'].includes(user.role)) {
      return true;
    }
    
    // If no assigned stations, user can access all (for backwards compatibility)
    if (!user.assignedStations || user.assignedStations.length === 0) {
      return true;
    }
    
    // Check if user is assigned to this station
    return user.assignedStations.includes(stationId);
  };

  const canEditEquipment = (user, equipment) => {
    if (!user || !equipment) return false;
    
    // Check basic edit permission
    if (hasPermission(user, 'edit_all_equipment')) {
      return true;
    }
    
    if (hasPermission(user, 'edit_assigned_equipment')) {
      return canAccessStation(user, equipment.stationId);
    }
    
    if (hasPermission(user, 'update_equipment_status')) {
      return canAccessStation(user, equipment.stationId);
    }
    
    return false;
  };

  const canViewEquipment = (user, equipment) => {
    if (!user) return false;
    
    if (hasPermission(user, 'view_all_equipment')) {
      return true;
    }
    
    if (hasPermission(user, 'view_assigned_equipment')) {
      return canAccessStation(user, equipment.stationId);
    }
    
    return false;
  };

  const getAccessibleStations = (user, allStations) => {
    if (!user) return [];
    
    // Fire Chief and Assistant Chief can access all stations
    if (['fire-chief', 'assistant-chief'].includes(user.role)) {
      return allStations;
    }
    
    // If no assigned stations, user can access all (for backwards compatibility)
    if (!user.assignedStations || user.assignedStations.length === 0) {
      return allStations;
    }
    
    // Return only assigned stations
    return allStations.filter(station => user.assignedStations.includes(station.id));
  };

  const getAccessibleEquipment = (user, allEquipment) => {
    if (!user) return [];
    
    if (hasPermission(user, 'view_all_equipment')) {
      return allEquipment;
    }
    
    if (hasPermission(user, 'view_assigned_equipment')) {
      return allEquipment.filter(equipment => canAccessStation(user, equipment.stationId));
    }
    
    return [];
  };

  const value = {
    users,
    currentUser,
    setCurrentUser,
    addUser,
    updateUser,
    deleteUser,
    setUserStatus,
    hasPermission,
    canAccessStation,
    canEditEquipment,
    canViewEquipment,
    getAccessibleStations,
    getAccessibleEquipment
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};