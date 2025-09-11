import React from 'react'
import { useDatabase } from '../contexts/DatabaseContext'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiDatabase, FiAlertCircle, FiCheckCircle, FiServer, FiWifi, FiWifiOff, FiActivity } = FiIcons

const DatabaseStatus = ({ detailed = false }) => {
  const { 
    isConnected, 
    isLoading, 
    error, 
    healthStatus, 
    connectionDetails, 
    lastHealthCheck,
    getConnectionStats 
  } = useDatabase()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-mission-text-muted">
        <SafeIcon icon={FiDatabase} className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-roboto-mono">Connecting...</span>
      </div>
    )
  }

  // Get detailed connection statistics
  const stats = getConnectionStats()

  // Determine status icon and color
  const getStatusDisplay = () => {
    if (!isConnected) {
      return {
        icon: FiWifiOff,
        color: 'text-red-400',
        label: 'Disconnected',
        status: 'error'
      }
    }

    if (healthStatus === 'healthy') {
      return {
        icon: FiCheckCircle,
        color: 'text-mission-accent-green',
        label: 'Connected',
        status: 'healthy'
      }
    }

    if (healthStatus === 'error') {
      return {
        icon: FiAlertCircle,
        color: 'text-red-400',
        label: 'Connection Issues',
        status: 'error'
      }
    }

    return {
      icon: FiWifi,
      color: 'text-yellow-400',
      label: 'Connecting',
      status: 'warning'
    }
  }

  const statusDisplay = getStatusDisplay()

  // Simple status display
  if (!detailed) {
    return (
      <div className="flex items-center space-x-2">
        <SafeIcon icon={statusDisplay.icon} className={`w-4 h-4 ${statusDisplay.color}`} />
        <span className={`text-sm font-roboto-mono ${statusDisplay.color}`}>
          {statusDisplay.label}
        </span>
        {stats.latency && (
          <span className="text-xs font-roboto-mono text-mission-text-muted">
            ({stats.latency}ms)
          </span>
        )}
      </div>
    )
  }

  // Detailed status display
  return (
    <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={statusDisplay.icon} className={`w-5 h-5 ${statusDisplay.color}`} />
          <div>
            <h3 className={`text-base font-inter-tight font-semibold ${statusDisplay.color}`}>
              {statusDisplay.label}
            </h3>
            <p className="text-xs font-roboto-mono text-mission-text-muted">
              Supabase PostgreSQL Database
            </p>
          </div>
        </div>
        {lastHealthCheck && (
          <div className="text-right">
            <p className="text-xs font-roboto-mono text-mission-text-muted">
              Last check: {lastHealthCheck.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {/* Connection Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-lg font-roboto-mono font-bold ${
            stats.isConnected ? 'text-mission-accent-green' : 'text-red-400'
          }`}>
            {stats.isConnected ? '✓' : '✗'}
          </div>
          <p className="text-xs font-inter text-mission-text-muted">Connected</p>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-roboto-mono font-bold ${
            stats.authenticated ? 'text-mission-accent-green' : 'text-mission-text-muted'
          }`}>
            {stats.authenticated ? '✓' : '○'}
          </div>
          <p className="text-xs font-inter text-mission-text-muted">Authenticated</p>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-roboto-mono font-bold ${
            stats.hasProfile ? 'text-mission-accent-green' : 'text-mission-text-muted'
          }`}>
            {stats.hasProfile ? '✓' : '○'}
          </div>
          <p className="text-xs font-inter text-mission-text-muted">Profile</p>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-roboto-mono font-bold ${
            stats.canQueryData ? 'text-mission-accent-green' : 'text-mission-text-muted'
          }`}>
            {stats.canQueryData ? '✓' : '○'}
          </div>
          <p className="text-xs font-inter text-mission-text-muted">Data Access</p>
        </div>
      </div>

      {/* Performance Metrics */}
      {stats.latency && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiActivity} className="w-4 h-4 text-mission-accent-blue" />
            <span className="text-sm font-inter text-mission-text-secondary">
              Latency: <span className="font-roboto-mono">{stats.latency}ms</span>
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-red-400 font-medium text-sm">Connection Error</h4>
              <p className="text-red-300 text-xs mt-1">{error.message || error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Department Context */}
      {stats.hasDepartment && connectionDetails.departmentName && (
        <div className="bg-mission-bg-tertiary rounded-lg p-3">
          <h4 className="text-sm font-inter font-medium text-mission-text-primary mb-2">
            Department Context
          </h4>
          <div className="space-y-1">
            <p className="text-xs font-inter text-mission-text-secondary">
              <span className="font-medium">Department:</span> {connectionDetails.departmentName}
            </p>
            {connectionDetails.departmentPlan && (
              <p className="text-xs font-inter text-mission-text-secondary">
                <span className="font-medium">Plan:</span> {connectionDetails.departmentPlan}
              </p>
            )}
            {connectionDetails.userRole && (
              <p className="text-xs font-inter text-mission-text-secondary">
                <span className="font-medium">Role:</span> {connectionDetails.userRole}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DatabaseStatus