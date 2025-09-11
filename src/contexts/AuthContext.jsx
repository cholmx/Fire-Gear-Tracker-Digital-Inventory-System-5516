import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../lib/auth'
import { db } from '../lib/database'
import { toast } from '../lib/toast'
import { analytics } from '../lib/analytics'
import supabase from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [department, setDepartment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            console.log('✅ User signed in, initializing auth service...')
            // Initialize auth service with the new session
            await authService.initializeAuth()
            
            setUser(authService.currentUser)
            setDepartment(authService.department)
            
            // Set department context in database service
            if (authService.department?.id) {
              console.log('🏢 Setting department context:', authService.department.id)
              db.setDepartmentId(authService.department.id)
            }
            
            setError(null)
          } catch (error) {
            console.error('❌ Error handling sign in:', error)
            setError(error.message)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out, clearing context...')
          authService.currentUser = null
          authService.department = null
          setUser(null)
          setDepartment(null)
          db.clearDepartmentContext()
          setError(null)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed successfully')
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const initializeAuth = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 Initializing auth service...')
      // Initialize auth service
      await authService.initializeAuth()
      
      // Set initial state
      setUser(authService.currentUser)
      setDepartment(authService.department)
      
      // Set department context in database service
      if (authService.department?.id) {
        console.log('🏢 Setting initial department context:', authService.department.id)
        db.setDepartmentId(authService.department.id)
      }
      
      // Track authentication state
      if (authService.currentUser) {
        analytics.track('user_authenticated', {
          user_id: authService.currentUser.id,
          department_id: authService.department?.id
        })
      }
    } catch (err) {
      console.error('❌ Auth initialization error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, departmentData) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📝 Starting signup in AuthContext...', { email, departmentName: departmentData.name })
      
      const result = await authService.signUp(email, password, departmentData)
      
      if (result.success) {
        analytics.track('user_signup', {
          email,
          department_name: departmentData.name,
          plan: departmentData.selectedPlan || 'free'
        })
        
        setUser(result.user)
        setDepartment(result.department)
        
        // Set department context in database service
        console.log('🏢 Setting department context after signup:', result.department.id)
        db.setDepartmentId(result.department.id)
        
        // Initialize fresh department data
        await db.initializeDepartmentData(result.department.id)
        
        return { success: true }
      } else {
        setError(result.error.message)
        return { success: false, error: result.error }
      }
    } catch (err) {
      console.error('❌ SignUp error in AuthContext:', err)
      setError(err.message)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authService.signIn(email, password)
      
      if (result.success) {
        analytics.track('user_signin', { email })
        // State will be updated by the auth state change listener
        return { success: true }
      } else {
        setError(result.error.message)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      analytics.track('user_signout')
      
      const result = await authService.signOut()
      
      if (result.success) {
        // State will be updated by the auth state change listener
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (err) {
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      const result = await authService.resetPassword(email)
      if (result.success) {
        analytics.track('password_reset_requested', { email })
      }
      return result
    } catch (err) {
      return { success: false, error: err }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const result = await authService.updatePassword(newPassword)
      if (result.success) {
        analytics.track('password_updated')
      }
      return result
    } catch (err) {
      return { success: false, error: err }
    }
  }

  // Convenience method for login (alias for signIn)
  const login = async (email, password) => {
    return await signIn(email, password)
  }

  // Convenience method for logout (alias for signOut)
  const logout = async () => {
    return await signOut()
  }

  // Permission checking
  const hasPermission = (permission) => {
    return authService.hasPermission(permission)
  }

  // Subscription checking
  const isSubscriptionActive = () => {
    return authService.isSubscriptionActive()
  }

  const getPlanLimits = () => {
    return authService.getPlanLimits()
  }

  // Check if feature is available
  const canUseFeature = (feature) => {
    if (!isSubscriptionActive()) {
      return false
    }

    const limits = getPlanLimits()
    switch (feature) {
      case 'unlimited_equipment':
        return limits.equipment === Infinity
      case 'unlimited_stations':
        return limits.stations === Infinity
      case 'advanced_analytics':
        return department?.plan !== 'free'
      case 'api_access':
        return department?.plan === 'unlimited'
      default:
        return true
    }
  }

  const value = {
    user,
    department,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    login,
    logout,
    resetPassword,
    updatePassword,
    hasPermission,
    isSubscriptionActive,
    getPlanLimits,
    canUseFeature
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext