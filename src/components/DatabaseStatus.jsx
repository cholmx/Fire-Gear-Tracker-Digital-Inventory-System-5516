import React from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDatabase, FiWifi, FiWifiOff, FiAlertCircle, FiCheckCircle, FiServer } = FiIcons;

const DatabaseStatus = () => {
  const { isConnected, isLoading, error, checkConnection } = useDatabase();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-mission-text-muted">
        <SafeIcon icon={FiDatabase} className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-roboto-mono">Connecting to PostgreSQL...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-400">
        <SafeIcon icon={FiAlertCircle} className="w-4 h-4" />
        <span className="text-sm font-roboto-mono">Backend API Error</span>
        <button
          onClick={checkConnection}
          className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${isConnected ? 'text-mission-accent-green' : 'text-mission-text-muted'}`}>
      <SafeIcon icon={isConnected ? FiCheckCircle : FiServer} className="w-4 h-4" />
      <span className="text-sm font-roboto-mono">
        {isConnected ? 'PostgreSQL Connected' : 'Local Storage Mode'}
      </span>
    </div>
  );
};

export default DatabaseStatus;