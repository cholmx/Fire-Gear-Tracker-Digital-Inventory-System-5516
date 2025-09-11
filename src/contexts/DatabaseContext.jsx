import React, { createContext, useContext, useState, useEffect } from 'react'
import { checkConnection } from '../lib/supabase'
import { useAuth } from './AuthContext'

const DatabaseContext = createContext()

export const useDatabase = () => {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context
}

export const DatabaseProvider = ({ children }) => {
  const { user, department, loading: authLoading } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [healthStatus, setHealthStatus] = useState('unknown')
  const [error, setError] = useState(null)
  const [lastHealthCheck, setLastHealthCheck] = useState(null)

  useEffect(() => {
    if (!authLoading) {
      performHealthCheck()
      
      // Check health every 30 seconds
      const interval = setInterval(performHealthCheck, 30000)
      return () => clearInterval(interval)
    }
  }, [authLoading])

  const performHealthCheck = async () => {
    try {
      const health = await checkConnection()
      
      setIsConnected(health.connected)
      setHealthStatus(health.healthy ? 'healthy' : 'error')
      setError(health.error)
      setLastHealthCheck(new Date())
      
    } catch (error) {
      console.error('Health check failed:', error)
      setIsConnected(false)
      setHealthStatus('error')
      setError(error)
    }
  }

  const value = {
    isConnected,
    healthStatus,
    error,
    lastHealthCheck,
    checkHealth: performHealthCheck,
    getConnectionStats: () => ({
      isConnected,
      healthStatus,
      lastHealthCheck,
      error: error?.message || null,
      authenticated: !!user,
      hasProfile: !!department,
      canQueryData: isConnected && !!department
    })
  }

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  )
}

export default DatabaseContext