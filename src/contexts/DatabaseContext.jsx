import React, { createContext, useContext, useState, useEffect } from 'react'
import { db } from '../lib/database'
import { checkConnection, quickConnectionTest, connectionMonitor } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { analytics } from '../lib/analytics'

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [healthStatus, setHealthStatus] = useState('unknown')
  const [connectionDetails, setConnectionDetails] = useState({})
  const [lastHealthCheck, setLastHealthCheck] = useState(null)

  // ✅ FIXED: Wait for auth to complete before initializing database
  useEffect(() => {
    // Don't initialize until auth is complete
    if (authLoading) {
      console.log('🔄 Waiting for auth to complete...')
      return
    }

    // If user is authenticated, wait for department context
    if (user && !department?.id) {
      console.log('🔄 Waiting for department context...')
      return
    }

    console.log('✅ Auth ready, initializing database...', {
      user: user?.email,
      department: department?.name,
      departmentId: department?.id
    })

    initializeDatabase()
  }, [authLoading, user, department])

  // Set up connection monitoring when component mounts
  useEffect(() => {
    // Start connection monitoring
    connectionMonitor.startMonitoring(30000) // Check every 30 seconds

    // Listen for connection status changes
    const removeListener = connectionMonitor.addListener((status) => {
      console.log('📡 Connection status update:', status)
      setIsConnected(status.connected)
      
      if (!status.connected && status.error) {
        setError(status.error)
        setHealthStatus('error')
      }
    })

    // Cleanup on unmount
    return () => {
      removeListener()
      connectionMonitor.stopMonitoring()
    }
  }, [])

  const initializeDatabase = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('🚀 Starting database initialization...')

      // Set department context if available
      if (department?.id) {
        console.log('🏢 Setting department context:', department.id)
        db.setDepartmentId(department.id)
      } else if (user) {
        console.warn('⚠️ User authenticated but no department context available')
      }

      // Perform comprehensive health check
      console.log('🔍 Performing comprehensive health check...')
      const health = await checkConnection()
      
      setLastHealthCheck(new Date())
      setConnectionDetails(health.details || {})

      if (health.healthy) {
        setIsConnected(true)
        setHealthStatus('healthy')
        setError(null)
        
        console.log('✅ Database connected and healthy')
        
        if (department?.id) {
          analytics.track('database_connected', {
            department_id: department.id,
            user_id: user?.id,
            connection_latency: health.latency,
            connection_details: health.details
          })
        }
      } else {
        console.error('❌ Database health check failed:', health.error)
        setError(health.error)
        setIsConnected(health.connected) // Might be connected but not healthy
        setHealthStatus('error')

        // Track connection issues
        if (department?.id) {
          analytics.trackError(health.error, {
            context: 'database_health_check',
            department_id: department.id,
            user_id: user?.id,
            health_details: health.details
          })
        }
      }

    } catch (err) {
      console.error('❌ Database initialization error:', err)
      setError(err)
      setIsConnected(false)
      setHealthStatus('error')
      setConnectionDetails({ criticalError: err.message })

      if (department?.id) {
        analytics.trackError(err, {
          context: 'database_initialization',
          department_id: department.id,
          user_id: user?.id
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const checkHealth = async () => {
    console.log('🔄 Performing on-demand health check...')
    
    try {
      setIsLoading(true)
      const health = await checkConnection()
      
      setLastHealthCheck(new Date())
      setConnectionDetails(health.details || {})
      setHealthStatus(health.healthy ? 'healthy' : 'error')
      setIsConnected(health.connected)
      
      if (health.error) {
        setError(health.error)
      } else {
        setError(null)
      }

      console.log('✅ Health check completed:', {
        connected: health.connected,
        healthy: health.healthy,
        latency: health.latency
      })

      return health
    } catch (error) {
      console.error('❌ Health check failed:', error)
      setHealthStatus('error')
      setIsConnected(false)
      setError(error)
      
      return {
        connected: false,
        healthy: false,
        error
      }
    } finally {
      setIsLoading(false)
    }
  }

  const reconnect = async () => {
    console.log('🔄 Attempting to reconnect database...')
    await initializeDatabase()
  }

  // Database operations with proper error handling and context validation
  const query = async (table, options = {}) => {
    try {
      // Ensure we have a healthy connection
      if (!isConnected) {
        console.error('❌ No database connection available for query:', table)
        throw new Error('Database not connected. Please check your connection and try again.')
      }

      // Ensure department context is available
      const departmentId = await db.getCurrentDepartmentId()
      if (!departmentId) {
        console.error('❌ No department context available for query:', table)
        throw new Error('Department context not available. Please ensure you are logged in.')
      }

      console.log('➕ Querying', table, 'with department context:', departmentId)
      const result = await db.query(table, options)

      if (department?.id) {
        analytics.track('database_query', {
          table,
          department_id: department.id,
          record_count: result.length,
          query_options: options
        })
      }

      return result
    } catch (error) {
      console.error('❌ Database query error:', error)
      analytics.trackError(error, {
        context: 'database_query',
        table,
        department_id: department?.id,
        query_options: options
      })

      // Check if it's a connection issue
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        setIsConnected(false)
        setHealthStatus('error')
        setError(error)
      }

      return []
    }
  }

  const insert = async (table, data, options = {}) => {
    try {
      // Ensure we have a healthy connection
      if (!isConnected) {
        console.error('❌ No database connection available for insert:', table)
        throw new Error('Database not connected. Please check your connection and try again.')
      }

      // Ensure department context is available
      const departmentId = await db.getCurrentDepartmentId()
      if (!departmentId) {
        console.error('❌ No department context available for insert:', table)
        throw new Error('Department context not available. Please ensure you are logged in.')
      }

      console.log('➕ Inserting into', table, 'with department context:', departmentId)
      const result = await db.insert(table, data, options)

      if (department?.id) {
        analytics.track('database_insert', {
          table,
          department_id: department.id,
          data_size: JSON.stringify(data).length
        })
      }

      return result
    } catch (error) {
      console.error('❌ Database insert error:', error)
      analytics.trackError(error, {
        context: 'database_insert',
        table,
        department_id: department?.id
      })

      // Check if it's a connection issue
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        setIsConnected(false)
        setHealthStatus('error')
        setError(error)
      }

      throw error
    }
  }

  const update = async (table, id, updates, options = {}) => {
    try {
      // Ensure we have a healthy connection
      if (!isConnected) {
        console.error('❌ No database connection available for update:', table)
        throw new Error('Database not connected. Please check your connection and try again.')
      }

      // Ensure department context is available
      const departmentId = await db.getCurrentDepartmentId()
      if (!departmentId) {
        console.error('❌ No department context available for update:', table)
        throw new Error('Department context not available. Please ensure you are logged in.')
      }

      const result = await db.update(table, id, updates, options)

      if (department?.id) {
        analytics.track('database_update', {
          table,
          department_id: department.id,
          record_id: id
        })
      }

      return result
    } catch (error) {
      console.error('❌ Database update error:', error)
      analytics.trackError(error, {
        context: 'database_update',
        table,
        department_id: department?.id,
        record_id: id
      })

      // Check if it's a connection issue
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        setIsConnected(false)
        setHealthStatus('error')
        setError(error)
      }

      throw error
    }
  }

  const remove = async (table, id, options = {}) => {
    try {
      // Ensure we have a healthy connection
      if (!isConnected) {
        console.error('❌ No database connection available for delete:', table)
        throw new Error('Database not connected. Please check your connection and try again.')
      }

      // Ensure department context is available
      const departmentId = await db.getCurrentDepartmentId()
      if (!departmentId) {
        console.error('❌ No department context available for delete:', table)
        throw new Error('Department context not available. Please ensure you are logged in.')
      }

      await db.delete(table, id, options)

      if (department?.id) {
        analytics.track('database_delete', {
          table,
          department_id: department.id,
          record_id: id
        })
      }

      return true
    } catch (error) {
      console.error('❌ Database delete error:', error)
      analytics.trackError(error, {
        context: 'database_delete',
        table,
        department_id: department?.id,
        record_id: id
      })

      // Check if it's a connection issue
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        setIsConnected(false)
        setHealthStatus('error')
        setError(error)
      }

      throw error
    }
  }

  const syncLocalToDatabase = async () => {
    // No longer needed since we're using Supabase directly
    return true
  }

  // Get connection statistics
  const getConnectionStats = () => {
    return {
      isConnected,
      healthStatus,
      lastHealthCheck,
      connectionDetails,
      error: error?.message || null,
      latency: connectionDetails.latency || null,
      authenticated: connectionDetails.userId ? true : false,
      hasProfile: connectionDetails.profileId ? true : false,
      hasDepartment: connectionDetails.departmentId ? true : false,
      canQueryData: connectionDetails.dataQuery || false
    }
  }

  const value = {
    isConnected,
    isLoading: isLoading || authLoading, // Include auth loading state
    error,
    healthStatus,
    connectionDetails,
    lastHealthCheck,
    reconnect,
    query,
    insert,
    update,
    remove,
    syncLocalToDatabase,
    checkHealth,
    getConnectionStats,
    isDemo: false
  }

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  )
}

export default DatabaseContext