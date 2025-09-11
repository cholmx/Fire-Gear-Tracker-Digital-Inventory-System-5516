import React, { useState } from 'react'
import { useDatabase } from '../contexts/DatabaseContext'
import SafeIcon from '../common/SafeIcon'
import Modal from './Modal'
import DatabaseStatus from './DatabaseStatus'
import * as FiIcons from 'react-icons/fi'

const { FiDatabase, FiSettings, FiPlay, FiServer, FiRefreshCw, FiAlertTriangle, FiInfo, FiCheckCircle } = FiIcons

const DatabaseSetup = () => {
  const { 
    isConnected, 
    reconnect, 
    healthStatus, 
    error, 
    checkHealth, 
    getConnectionStats 
  } = useDatabase()
  const [showSetup, setShowSetup] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [healthCheckLoading, setHealthCheckLoading] = useState(false)

  const handleReconnect = async () => {
    setSetupLoading(true)
    try {
      await reconnect()
      setShowSetup(false)
    } catch (error) {
      console.error('Reconnection failed:', error)
    } finally {
      setSetupLoading(false)
    }
  }

  const handleHealthCheck = async () => {
    setHealthCheckLoading(true)
    try {
      await checkHealth()
    } catch (error) {
      console.error('Health check failed:', error)
    } finally {
      setHealthCheckLoading(false)
    }
  }

  // Check if environment variables are properly configured
  const isConfigured = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    return supabaseUrl && 
           supabaseKey && 
           supabaseUrl !== 'https://your-project-id.supabase.co' && 
           supabaseKey !== 'your-anon-key-here'
  }

  const connectionStats = getConnectionStats()

  // Don't show setup button if already connected and healthy
  if (isConnected && healthStatus === 'healthy') {
    return null
  }

  // Show different button based on status
  const getButtonConfig = () => {
    if (!isConfigured()) {
      return {
        icon: FiAlertTriangle,
        text: 'Configure Database',
        color: 'bg-yellow-600 hover:bg-yellow-700',
        textColor: 'text-white'
      }
    }

    if (error) {
      return {
        icon: FiRefreshCw,
        text: 'Retry Connection',
        color: 'bg-red-600 hover:bg-red-700',
        textColor: 'text-white'
      }
    }

    return {
      icon: FiDatabase,
      text: 'Setup Database',
      color: 'bg-mission-accent-blue hover:bg-blue-600',
      textColor: 'text-white'
    }
  }

  const buttonConfig = getButtonConfig()

  return (
    <>
      <button
        onClick={() => setShowSetup(true)}
        className={`flex items-center space-x-2 ${buttonConfig.color} ${buttonConfig.textColor} px-3 py-2 rounded-lg transition-colors`}
      >
        <SafeIcon icon={buttonConfig.icon} className="w-4 h-4" />
        <span className="text-sm font-inter">
          {buttonConfig.text}
        </span>
      </button>

      <Modal
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
        title="Database Connection"
        size="lg"
      >
        <div className="space-y-6">
          {/* Configuration Check */}
          {!isConfigured() && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-yellow-400 font-medium mb-1">Environment Variables Not Configured</h4>
                  <p className="text-yellow-300 text-sm mb-3">
                    Your Supabase credentials are not properly configured. Please set up your environment variables.
                  </p>
                  <div className="bg-yellow-900/30 rounded p-3 font-mono text-xs">
                    <p className="text-yellow-200 mb-2">Create a <code>.env.local</code> file with:</p>
                    <div className="text-yellow-100 space-y-1">
                      <p>VITE_SUPABASE_URL=https://your-project-id.supabase.co</p>
                      <p>VITE_SUPABASE_ANON_KEY=your-anon-key-here</p>
                    </div>
                  </div>
                  <p className="text-yellow-300 text-xs mt-2">
                    Get these values from your Supabase project dashboard → Settings → API
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Database Status */}
          <DatabaseStatus detailed={true} />

          {/* Connection Statistics */}
          {isConfigured() && (
            <div className="bg-mission-bg-tertiary rounded-lg p-4">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">
                Connection Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-mission-text-muted">Database URL:</span>
                  <p className="font-mono text-mission-text-secondary break-all">
                    {import.meta.env.VITE_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '')}.supabase.co
                  </p>
                </div>
                <div>
                  <span className="text-mission-text-muted">Health Status:</span>
                  <p className={`font-mono ${
                    healthStatus === 'healthy' ? 'text-mission-accent-green' :
                    healthStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {healthStatus?.toUpperCase() || 'UNKNOWN'}
                  </p>
                </div>
                {connectionStats.latency && (
                  <div>
                    <span className="text-mission-text-muted">Latency:</span>
                    <p className="font-mono text-mission-text-secondary">{connectionStats.latency}ms</p>
                  </div>
                )}
                {connectionStats.lastHealthCheck && (
                  <div>
                    <span className="text-mission-text-muted">Last Check:</span>
                    <p className="font-mono text-mission-text-secondary">
                      {connectionStats.lastHealthCheck.toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Database Features */}
          <div className="bg-mission-bg-tertiary rounded-lg p-4">
            <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-2">
              <SafeIcon icon={FiServer} className="w-5 h-5 text-mission-accent-blue inline mr-2" />
              Supabase Database Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-mission-accent-green" />
                <span className="text-mission-text-secondary">Real-time synchronization</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-mission-accent-green" />
                <span className="text-mission-text-secondary">Automatic cloud backups</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-mission-accent-green" />
                <span className="text-mission-text-secondary">Multi-user collaboration</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-mission-accent-green" />
                <span className="text-mission-text-secondary">Enterprise-grade security</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-mission-accent-green" />
                <span className="text-mission-text-secondary">Scalable PostgreSQL database</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCheckCircle} className="w-4 h-4 text-mission-accent-green" />
                <span className="text-mission-text-secondary">Row-level security</span>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="text-red-400 font-medium mb-1">Connection Error</h4>
                  <p className="text-red-300 text-sm mb-3">{error.message}</p>
                  
                  <div className="text-red-300 text-xs space-y-1">
                    <p><strong>Troubleshooting steps:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Check your internet connection</li>
                      <li>Verify your Supabase project is active (not paused)</li>
                      <li>Ensure environment variables are correct</li>
                      <li>Check Supabase dashboard for service status</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowSetup(false)}
              className="px-4 py-2 text-mission-text-muted hover:text-mission-text-primary transition-colors"
            >
              Close
            </button>
            
            {isConfigured() && (
              <>
                <button
                  onClick={handleHealthCheck}
                  disabled={healthCheckLoading}
                  className="flex items-center space-x-2 bg-mission-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <SafeIcon 
                    icon={FiRefreshCw} 
                    className={`w-4 h-4 ${healthCheckLoading ? 'animate-spin' : ''}`} 
                  />
                  <span>{healthCheckLoading ? 'Checking...' : 'Health Check'}</span>
                </button>
                
                <button
                  onClick={handleReconnect}
                  disabled={setupLoading}
                  className="flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <SafeIcon 
                    icon={setupLoading ? FiRefreshCw : FiPlay} 
                    className={`w-4 h-4 ${setupLoading ? 'animate-spin' : ''}`} 
                  />
                  <span>{setupLoading ? 'Connecting...' : 'Reconnect'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}

export default DatabaseSetup