import React from 'react'
import { useDatabase } from '../contexts/DatabaseContext'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiDatabase, FiAlertCircle, FiCheckCircle, FiServer } = FiIcons

const DatabaseStatus = () => {
  const { isConnected, isLoading, error, healthStatus } = useDatabase()

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-mission-text-muted">
        <SafeIcon icon={FiDatabase} className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-roboto-mono">Connecting...</span>
      </div>
    )
  }

  // Connected status
  if (isConnected && healthStatus === 'healthy') {
    return (
      <div className="flex items-center space-x-2 text-mission-accent-green">
        <SafeIcon icon={FiCheckCircle} className="w-4 h-4" />
        <span className="text-sm font-roboto-mono">Supabase Connected</span>
      </div>
    )
  }

  // Error status
  if (error || healthStatus === 'error') {
    return (
      <div className="flex items-center space-x-2 text-red-400">
        <SafeIcon icon={FiAlertCircle} className="w-4 h-4" />
        <span className="text-sm font-roboto-mono">Connection Error</span>
      </div>
    )
  }

  // Default disconnected status
  return (
    <div className="flex items-center space-x-2 text-mission-text-muted">
      <SafeIcon icon={FiServer} className="w-4 h-4" />
      <span className="text-sm font-roboto-mono">Disconnected</span>
    </div>
  )
}

export default DatabaseStatus