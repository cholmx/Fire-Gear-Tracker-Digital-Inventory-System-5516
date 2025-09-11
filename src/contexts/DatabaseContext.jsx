import React,{createContext,useContext,useState,useEffect} from 'react'
import {db} from '../lib/database'
import {checkConnection} from '../lib/supabase'
import {useAuth} from './AuthContext'
import {analytics} from '../lib/analytics'

const DatabaseContext=createContext()

export const useDatabase=()=> {
  const context=useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context
}

export const DatabaseProvider=({children})=> {
  const {user,department}=useAuth()
  const [isConnected,setIsConnected]=useState(false)
  const [isLoading,setIsLoading]=useState(true)
  const [error,setError]=useState(null)
  const [healthStatus,setHealthStatus]=useState('unknown')

  useEffect(()=> {
    initializeDatabase()
  },[])

  const initializeDatabase=async ()=> {
    try {
      setIsLoading(true)
      setError(null)

      // Set department context if available
      if (department?.id) {
        db.setDepartmentId(department.id)
      }

      // Check database health
      const health=await checkConnection()
      if (health.healthy) {
        setIsConnected(true)
        setHealthStatus('healthy')
        analytics.track('database_connected',{department_id: department?.id})
        // Removed the toast notification here
      } else {
        setError(health.error)
        setIsConnected(false)
        setHealthStatus('error')
        // Only show error toast for actual failures, not initial connection attempts
        if (health.error && !health.error.message?.includes('fetch')) {
          console.warn('Database connection failed:',health.error)
        }
      }
    } catch (err) {
      console.error('Database initialization error:',err)
      setError(err)
      setIsConnected(false)
      setHealthStatus('error')
      // Only log errors, don't show toast
    } finally {
      setIsLoading(false)
    }
  }

  const checkHealth=async ()=> {
    const health=await checkConnection()
    setHealthStatus(health.healthy ? 'healthy' : 'error')
    setIsConnected(health.healthy)
    return health
  }

  const reconnect=async ()=> {
    await initializeDatabase()
  }

  // Database operations
  const query=async (table,options={})=> {
    try {
      return await db.query(table,options)
    } catch (error) {
      analytics.trackError(error,{context: 'database_query',table})
      return []
    }
  }

  const insert=async (table,data,options={})=> {
    try {
      const result=await db.insert(table,data,options)
      analytics.track('database_insert',{table,department_id: db.currentDepartmentId})
      return result
    } catch (error) {
      analytics.trackError(error,{context: 'database_insert',table})
      throw error
    }
  }

  const update=async (table,id,updates,options={})=> {
    try {
      const result=await db.update(table,id,updates,options)
      analytics.track('database_update',{table,department_id: db.currentDepartmentId})
      return result
    } catch (error) {
      analytics.trackError(error,{context: 'database_update',table})
      throw error
    }
  }

  const remove=async (table,id,options={})=> {
    try {
      await db.delete(table,id,options)
      analytics.track('database_delete',{table,department_id: db.currentDepartmentId})
      return true
    } catch (error) {
      analytics.trackError(error,{context: 'database_delete',table})
      throw error
    }
  }

  const syncLocalToDatabase=async ()=> {
    // No longer needed since we're using Supabase directly
    return true
  }

  const value={
    isConnected,
    isLoading,
    error,
    healthStatus,
    reconnect,
    query,
    insert,
    update,
    remove,
    syncLocalToDatabase,
    checkHealth,
    isDemo: false
  }

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  )
}

export default DatabaseContext