import React, { createContext, useContext, useState, useEffect } from 'react'
import supabase, { handleSupabaseError } from '../lib/supabase'
import { db } from '../lib/database'
import { toast } from '../lib/toast'
import { STRIPE_PLANS } from '../lib/stripe'

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event)
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            await loadUserProfile(session.user)
          } catch (error) {
            console.error('❌ Error loading user profile:', error)
            setError(error.message)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          setUser(null)
          setDepartment(null)
          db.clearDepartmentContext()
          setError(null)
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
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        await loadUserProfile(session.user)
      }
      
    } catch (err) {
      console.error('❌ Auth initialization error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (authUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          department:departments(id, name, plan, subscription_status, admin_email)
        `)
        .eq('user_id', authUser.id)
        .single()

      if (error) {
        const handledError = handleSupabaseError(error, 'load user profile')
        throw handledError.error
      }

      if (!profile) {
        throw new Error('User profile not found')
      }

      const userObj = {
        id: authUser.id,
        email: authUser.email,
        name: `${profile.first_name} ${profile.last_name}`,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
        department: profile.department.name,
        departmentId: profile.department.id
      }

      const departmentObj = {
        id: profile.department.id,
        name: profile.department.name,
        plan: profile.department.plan,
        subscriptionStatus: profile.department.subscription_status,
        adminEmail: profile.department.admin_email
      }

      setUser(userObj)
      setDepartment(departmentObj)
      db.setDepartmentId(profile.department.id)
      
    } catch (error) {
      console.error('❌ Error loading user profile:', error)
      throw error
    }
  }

  const signUp = async (email, password, departmentData) => {
    try {
      setLoading(true)
      setError(null)

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) {
        const handledError = handleSupabaseError(authError, 'signup auth')
        throw handledError.error
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create department and profile using RPC
      const { data: signupResult, error: signupError } = await supabase.rpc('signup_user', {
        auth_user_id: authData.user.id,
        user_email: email,
        dept_name: departmentData.name,
        admin_first_name: departmentData.adminFirstName,
        admin_last_name: departmentData.adminLastName,
        selected_plan: departmentData.selectedPlan || 'free'
      })

      if (signupError) {
        // Clean up auth user on failure
        await supabase.auth.signOut()
        const handledError = handleSupabaseError(signupError, 'signup RPC')
        throw handledError.error
      }

      if (!signupResult?.success) {
        await supabase.auth.signOut()
        throw new Error(signupResult?.error?.message || 'Signup failed')
      }

      // Load user profile
      await loadUserProfile(authData.user)
      
      toast.success('Account created successfully!')
      return { success: true, user, department }

    } catch (error) {
      console.error('❌ Signup error:', error)
      setError(error.message)
      toast.error('Failed to create account: ' + error.message)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        const handledError = handleSupabaseError(error, 'signin')
        throw handledError.error
      }

      // Profile will be loaded by the auth state change listener
      toast.success('Successfully signed in!')
      return { success: true }

    } catch (error) {
      console.error('❌ Signin error:', error)
      setError(error.message)
      toast.error('Failed to sign in: ' + error.message)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        const handledError = handleSupabaseError(error, 'signout')
        throw handledError.error
      }

      toast.success('Successfully signed out')
      return { success: true }

    } catch (error) {
      console.error('❌ Signout error:', error)
      toast.error('Failed to sign out: ' + error.message)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  // Permission checking
  const hasPermission = (permission) => {
    const rolePermissions = {
      'fire-chief': ['view_all_equipment', 'edit_all_equipment', 'delete_equipment', 'manage_stations', 'manage_inspections', 'manage_users'],
      'assistant-chief': ['view_all_equipment', 'edit_all_equipment', 'delete_equipment', 'manage_stations', 'manage_inspections'],
      'captain': ['view_all_equipment', 'edit_assigned_equipment', 'manage_assigned_stations', 'manage_inspections'],
      'lieutenant': ['view_all_equipment', 'edit_assigned_equipment', 'manage_inspections'],
      'firefighter': ['view_assigned_equipment', 'update_equipment_status'],
      'inspector': ['view_all_equipment', 'manage_inspections']
    }

    return rolePermissions[user?.role]?.includes(permission) || false
  }

  const value = {
    user,
    department,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    login: signIn, // Alias
    logout: signOut, // Alias
    hasPermission,
    isSubscriptionActive: () => department?.subscriptionStatus === 'active' || department?.subscriptionStatus === 'trial',
    getPlanLimits: () => {
      const plan = STRIPE_PLANS[department?.plan || 'free']
      return plan?.limits || { stations: 1, equipment: 50, users: 3 }
    },
    canUseFeature: (feature) => {
      // All plans have the same features, only limits differ
      return isSubscriptionActive()
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext