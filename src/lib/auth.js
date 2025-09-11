// Authentication service using Supabase with atomic signup operations
import supabase, { signupOperations, handleSupabaseError } from './supabase'
import { toast } from './toast'
import { transformDataToSnakeCase, transformDataToCamelCase } from './database'

export class AuthService {
  constructor() {
    this.currentUser = null
    this.department = null
  }

  async initializeAuth() {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Check if user has completed signup
        const signupStatus = await this.checkSignupStatus(session.user.id)
        
        if (signupStatus.status === 'completed') {
          // Get or create user profile
          const userProfile = await this.getOrCreateUserProfile(session.user)
          
          this.currentUser = {
            id: session.user.id,
            email: session.user.email,
            name: userProfile.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : 'User',
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            role: userProfile.role || 'fire-chief',
            department: userProfile.departmentName,
            departmentId: userProfile.departmentId,
            plan: userProfile.plan || 'free',
            lastLogin: new Date().toISOString(),
            createdAt: session.user.created_at
          }

          this.department = {
            id: userProfile.departmentId,
            name: userProfile.departmentName,
            adminEmail: session.user.email,
            plan: userProfile.plan || 'free',
            subscriptionStatus: 'active',
            createdAt: userProfile.departmentCreatedAt
          }
        } else {
          // User needs to complete signup
          console.log('User needs to complete signup process')
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    }
  }

  async checkSignupStatus(userId) {
    try {
      const { data, error } = await supabase.rpc('get_user_signup_status', {
        auth_user_id: userId
      })

      if (error) {
        console.error('Error checking signup status:', error)
        return { status: 'error', message: error.message }
      }

      return data
    } catch (error) {
      console.error('Error checking signup status:', error)
      return { status: 'error', message: error.message }
    }
  }

  async validateSignupData(email, departmentName) {
    try {
      const { data, error } = await supabase.rpc('can_signup', {
        user_email: email,
        dept_name: departmentName
      })

      if (error) {
        console.error('Error validating signup data:', error)
        return { allowed: false, reason: 'validation_error', message: error.message }
      }

      return data
    } catch (error) {
      console.error('Error validating signup data:', error)
      return { allowed: false, reason: 'validation_error', message: error.message }
    }
  }

  async getOrCreateUserProfile(user) {
    try {
      // First, try to get existing user profile
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          department:departments(id, name, plan, created_at)
        `)
        .eq('user_id', user.id)
        .single()

      if (existingProfile && !profileError) {
        // Transform the data to camelCase for consistency
        const transformedProfile = transformDataToCamelCase(existingProfile)
        return {
          ...transformedProfile,
          departmentId: transformedProfile.department.id,
          departmentName: transformedProfile.department.name,
          plan: transformedProfile.department.plan,
          departmentCreatedAt: transformedProfile.department.createdAt
        }
      }

      // If no profile exists, this means it's a new signup
      // The profile should have been created during signup
      throw new Error('User profile not found. Please sign up again.')
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  }

  async signUp(email, password, departmentData) {
    try {
      console.log('🚀 Starting atomic signup process...', {
        email,
        departmentName: departmentData.name
      })

      // Step 1: Validate signup data first
      const validation = await this.validateSignupData(email, departmentData.name)
      if (!validation.allowed) {
        throw new Error(validation.message)
      }

      // Step 2: Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: departmentData.adminFirstName,
            lastName: departmentData.adminLastName,
            department: departmentData.name
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        const { error: handledError } = handleSupabaseError(authError, 'signup - auth creation')
        throw handledError
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 3: Create department, profile, and initial data atomically using RPC
      const { data: signupResult, error: signupError } = await supabase.rpc('signup_user', {
        auth_user_id: authData.user.id,
        user_email: email,
        dept_name: departmentData.name,
        admin_first_name: departmentData.adminFirstName,
        admin_last_name: departmentData.adminLastName,
        selected_plan: departmentData.selectedPlan || 'free'
      })

      if (signupError) {
        console.error('🔥 Atomic signup failed:', signupError)
        
        // Try to clean up the auth user if department creation failed
        try {
          await supabase.auth.signOut()
          console.log('🧹 Cleaned up auth user after failed signup')
        } catch (cleanupError) {
          console.error('Failed to clean up auth user:', cleanupError)
        }
        
        throw new Error(`Signup failed: ${signupError.message}`)
      }

      if (!signupResult || !signupResult.success) {
        console.error('🔥 Signup RPC returned failure:', signupResult)
        
        // Clean up auth user
        try {
          await supabase.auth.signOut()
          console.log('🧹 Cleaned up auth user after failed signup')
        } catch (cleanupError) {
          console.error('Failed to clean up auth user:', cleanupError)
        }
        
        const errorMessage = signupResult?.error?.message || 'Unknown signup error'
        throw new Error(errorMessage)
      }

      console.log('✅ Atomic signup completed successfully:', signupResult)

      // Set up the user objects from the RPC result
      const department = signupResult.department
      const userProfile = signupResult.user_profile

      this.currentUser = {
        id: authData.user.id,
        email: authData.user.email,
        name: `${userProfile.first_name} ${userProfile.last_name}`,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        role: 'fire-chief',
        department: department.name,
        departmentId: department.id,
        plan: department.plan,
        createdAt: authData.user.created_at
      }

      this.department = {
        id: department.id,
        name: department.name,
        adminEmail: department.admin_email,
        plan: department.plan,
        subscriptionStatus: department.subscription_status,
        createdAt: department.created_at
      }

      toast.success('Account created successfully!')
      
      return {
        success: true,
        user: this.currentUser,
        department: this.department
      }

    } catch (error) {
      console.error('❌ Sign up error:', error)
      toast.error('Failed to create account: ' + error.message)
      
      return {
        success: false,
        error
      }
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        const { error: handledError } = handleSupabaseError(error, 'signin')
        throw handledError
      }

      if (data.user) {
        // Check if user has completed signup
        const signupStatus = await this.checkSignupStatus(data.user.id)
        
        if (signupStatus.status !== 'completed') {
          throw new Error('Account setup is incomplete. Please complete your registration.')
        }

        // Get user profile and department info
        const userProfile = await this.getOrCreateUserProfile(data.user)
        
        this.currentUser = {
          id: data.user.id,
          email: data.user.email,
          name: userProfile.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : 'User',
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          role: userProfile.role,
          department: userProfile.departmentName,
          departmentId: userProfile.departmentId,
          plan: userProfile.plan,
          lastLogin: new Date().toISOString(),
          createdAt: data.user.created_at
        }

        this.department = {
          id: userProfile.departmentId,
          name: userProfile.departmentName,
          adminEmail: data.user.email,
          plan: userProfile.plan,
          subscriptionStatus: 'active',
          createdAt: userProfile.departmentCreatedAt
        }

        // Update last login (data will be automatically transformed to snake_case)
        await supabase
          .from('user_profiles')
          .update({ lastLogin: new Date().toISOString() })
          .eq('user_id', data.user.id)

        toast.success('Successfully signed in!')
        return { success: true, user: this.currentUser }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Failed to sign in: ' + error.message)
      return { success: false, error }
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      this.currentUser = null
      this.department = null
      toast.success('Successfully signed out')
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
      return { success: false, error }
    }
  }

  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error

      toast.success('Password reset email sent')
      return { success: true }
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('Failed to send reset email')
      return { success: false, error }
    }
  }

  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error

      toast.success('Password updated successfully')
      return { success: true }
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('Failed to update password')
      return { success: false, error }
    }
  }

  // Check if user has permission
  hasPermission(permission) {
    if (!this.currentUser?.role) return false
    const rolePermissions = USER_ROLES[this.currentUser.role]?.permissions || []
    return rolePermissions.includes(permission)
  }

  // Check subscription status
  isSubscriptionActive() {
    if (!this.department) return false
    const { subscriptionStatus, trialEndsAt } = this.department

    // Active subscription
    if (subscriptionStatus === 'active') return true

    // Trial period
    if (subscriptionStatus === 'trial') {
      return trialEndsAt ? new Date() < new Date(trialEndsAt) : true
    }

    return false
  }

  // Get plan limits
  getPlanLimits() {
    const plan = this.department?.plan || 'free'
    const limits = {
      free: {
        stations: 1,
        equipment: 50,
        users: 3
      },
      professional: {
        stations: 3,
        equipment: 300,
        users: 10
      },
      unlimited: {
        stations: Infinity,
        equipment: Infinity,
        users: Infinity
      }
    }
    return limits[plan] || limits.free
  }

  cleanup() {
    // No cleanup needed for Supabase
  }
}

// User roles and permissions
const USER_ROLES = {
  'fire-chief': {
    name: 'Fire Chief',
    permissions: [
      'view_all_equipment',
      'edit_all_equipment',
      'delete_equipment',
      'manage_stations',
      'manage_inspections',
      'manage_users',
      'view_reports',
      'export_data',
      'system_settings',
      'manage_subscription'
    ]
  },
  'assistant-chief': {
    name: 'Assistant Chief',
    permissions: [
      'view_all_equipment',
      'edit_all_equipment',
      'delete_equipment',
      'manage_stations',
      'manage_inspections',
      'view_reports',
      'export_data'
    ]
  },
  'captain': {
    name: 'Captain',
    permissions: [
      'view_all_equipment',
      'edit_assigned_equipment',
      'manage_assigned_stations',
      'manage_inspections',
      'view_reports'
    ]
  },
  'lieutenant': {
    name: 'Lieutenant',
    permissions: [
      'view_all_equipment',
      'edit_assigned_equipment',
      'manage_inspections',
      'view_reports'
    ]
  },
  'firefighter': {
    name: 'Firefighter',
    permissions: [
      'view_assigned_equipment',
      'update_equipment_status',
      'view_inspections'
    ]
  },
  'inspector': {
    name: 'Inspector',
    permissions: [
      'view_all_equipment',
      'manage_inspections',
      'view_reports',
      'export_inspection_data'
    ]
  }
}

export { USER_ROLES }
export const authService = new AuthService()