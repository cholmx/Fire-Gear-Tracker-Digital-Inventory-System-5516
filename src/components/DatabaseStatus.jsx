import React, { useState, useEffect } from 'react'
import { db } from '../lib/database'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiDatabase, FiCheckCircle, FiAlertCircle, FiWifiOff, FiRefreshCw } = FiIcons

const DatabaseStatus = ({ detailed = false }) => {
  const [status, setStatus] = useState({
    connected: false,
    healthy: false,
    loading: true,
    error: null,
    latency: null
  })

  const [lastCheck, setLastCheck] = useState(null)

  useEffect(() => {
    checkStatus()
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkStatus = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }))
      
      const startTime = Date.now()
      const health = await db.healthCheck()
      const latency = Date.now() - startTime
      
      setStatus({
        connected: health.connected,
        healthy: health.healthy,
        loading: false,
        error: health.error,
        latency
      })
      
      setLastCheck(new Date())
      
    } catch (error) {
      setStatus({
        connected: false,
        healthy: false,
        loading: false,
        error: error.message,
        latency: null
      })
    }
  }

  const getStatusDisplay = () => {
    if (status.loading) {
      return { icon: FiRefreshCw, color: 'text-mission-text-muted animate-spin', label: 'Checking...' }
    }
    
    if (!status.connected) {
      return { icon: FiWifiOff, color: 'text-red-400', label: 'Disconnected' }
    }
    
    if (status.healthy) {
      return { icon: FiCheckCircle, color: 'text-mission-accent-green', label: 'Connected' }
    }
    
    return { icon: FiAlertCircle, color: 'text-yellow-400', label: 'Issues' }
  }

  const statusDisplay = getStatusDisplay()

  if (!detailed) {
    return (
      <div className="flex items-center space-x-2">
        <SafeIcon icon={statusDisplay.icon} className={`w-4 h-4 ${statusDisplay.color}`} />
        <span className={`text-sm font-roboto-mono ${statusDisplay.color}`}>
          {statusDisplay.label}
        </span>
        {status.latency && (
          <span className="text-xs font-roboto-mono text-mission-text-muted">
            ({status.latency}ms)
          </span>
        )}
      </div>
    )
  }

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
              Supabase Database
            </p>
          </div>
        </div>
        <button
          onClick={checkStatus}
          disabled={status.loading}
          className="p-2 hover:bg-mission-bg-tertiary rounded transition-colors"
        >
          <SafeIcon 
            icon={FiRefreshCw} 
            className={`w-4 h-4 text-mission-text-muted ${status.loading ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-lg font-roboto-mono font-bold ${status.connected ? 'text-mission-accent-green' : 'text-red-400'}`}>
            {status.connected ? '✓' : '✗'}
          </div>
          <p className="text-xs font-inter text-mission-text-muted">Connected</p>
        </div>
        <div className="text-center">
          <div className={`text-lg font-roboto-mono font-bold ${status.healthy ? 'text-mission-accent-green' : 'text-mission-text-muted'}`}>
            {status.healthy ? '✓' : '○'}
          </div>
          <p className="text-xs font-inter text-mission-text-muted">Healthy</p>
        </div>
        <div className="text-center">
          <div className={`text-lg font-roboto-mono font-bold ${status.latency ? 'text-mission-accent-blue' : 'text-mission-text-muted'}`}>
            {status.latency || '—'}
          </div>
          <p className="text-xs font-inter text-mission-text-muted">Latency (ms)</p>
        </div>
        <div className="text-center">
          <div className={`text-lg font-roboto-mono font-bold ${!status.error ? 'text-mission-accent-green' : 'text-red-400'}`}>
            {!status.error ? '✓' : '✗'}
          </div>
          <p className="text-xs font-inter text-mission-text-muted">Error Free</p>
        </div>
      </div>

      {status.error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-red-400 font-medium text-sm">Connection Error</h4>
              <p className="text-red-300 text-xs mt-1">{status.error.message || status.error}</p>
            </div>
          </div>
        </div>
      )}

      {lastCheck && (
        <div className="text-xs text-mission-text-muted text-center mt-4">
          Last checked: {lastCheck.toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}

export default DatabaseStatus