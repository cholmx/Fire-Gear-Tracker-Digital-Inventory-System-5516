import React, { useState } from 'react'
import { useDatabase } from '../contexts/DatabaseContext'
import SafeIcon from '../common/SafeIcon'
import Modal from './Modal'
import * as FiIcons from 'react-icons/fi'

const { FiDatabase, FiSettings, FiPlay, FiServer, FiRefreshCw } = FiIcons

const DatabaseSetup = () => {
  const { isConnected, reconnect, healthStatus, error } = useDatabase()
  const [showSetup, setShowSetup] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)

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

  // Don't show setup button if already connected
  if (isConnected && healthStatus === 'healthy') {
    return null
  }

  return (
    <>
      <button
        onClick={() => setShowSetup(true)}
        className="flex items-center space-x-2 bg-mission-accent-blue hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors"
      >
        <SafeIcon icon={error ? FiRefreshCw : FiDatabase} className="w-4 h-4" />
        <span className="text-sm font-inter">
          {error ? 'Retry Connection' : 'Setup Database'}
        </span>
      </button>

      <Modal
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
        title="Database Connection"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-mission-bg-tertiary rounded-lg p-4">
            <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-2">
              Supabase Database Status
            </h3>
            <p className="text-mission-text-secondary mb-4">
              {isConnected 
                ? "Connected to Supabase database successfully!"
                : "Attempting to connect to your Supabase database..."
              }
            </p>
            
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4">
                <h4 className="text-red-400 font-medium mb-1">Connection Error</h4>
                <p className="text-red-300 text-sm">{error.message}</p>
              </div>
            )}

            <div className="flex items-center space-x-2 mb-3">
              <SafeIcon icon={FiServer} className="w-5 h-5 text-mission-accent-blue" />
              <span className="text-mission-accent-blue font-medium">Database Features:</span>
            </div>
            <ul className="text-mission-text-muted text-sm space-y-1 ml-7">
              <li>• Real-time synchronization</li>
              <li>• Automatic cloud backups</li>
              <li>• Multi-user collaboration</li>
              <li>• Enterprise-grade security</li>
              <li>• Scalable PostgreSQL database</li>
            </ul>
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <SafeIcon icon={FiDatabase} className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-medium">Connection Details</h4>
                <p className="text-blue-300 text-sm mt-1">
                  Connected to: <span className="font-mono">xibhmevisztsdlpueutj.supabase.co</span>
                </p>
                <p className="text-blue-300 text-sm">
                  Status: <span className="font-mono">{healthStatus || 'Unknown'}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowSetup(false)}
              className="px-4 py-2 text-mission-text-muted hover:text-mission-text-primary transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleReconnect}
              disabled={setupLoading}
              className="flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={setupLoading ? FiRefreshCw : FiPlay} className={`w-4 h-4 ${setupLoading ? 'animate-spin' : ''}`} />
              <span>{setupLoading ? 'Connecting...' : 'Retry Connection'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default DatabaseSetup