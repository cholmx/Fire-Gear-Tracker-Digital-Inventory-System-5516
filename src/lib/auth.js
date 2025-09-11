// Authentication service using Supabase
import supabase from './supabase'
import {toast} from './toast'

export class AuthService {
  constructor() {
    this.currentUser = null
    this.department = null
  }

  async initializeAuth() {
    try {
      // Get current session
      const {data: {session}} = await supabase.auth.getSession()
      
      if (session?.user) {
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
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    }
  }

  async getOrCreateUserProfile(user) {
    try {
      // First, try to get existing user profile
      const {data: existingProfile, error: profileError} = await supabase
        .from('user_profiles')
        .select(`
          *,
          department:departments(id, name, plan, created_at)
        `)
        .eq('user_id', user.id)
        .single()

      if (existingProfile && !profileError) {
        return {
          ...existingProfile,
          departmentId: existingProfile.department.id,
          departmentName: existingProfile.department.name,
          plan: existingProfile.department.plan,
          departmentCreatedAt: existingProfile.department.created_at
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
      console.log('Starting signup process...', {email, departmentName: departmentData.name})

      // Step 1: Create the auth user
      const {data: authData, error: authError} = await supabase.auth.signUp({
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
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      console.log('Auth user created:', authData.user.id)

      // Step 2: Create department
      const {data: department, error: deptError} = await supabase
        .from('departments')
        .insert({
          name: departmentData.name,
          admin_email: email,
          plan: departmentData.selectedPlan || 'free',
          subscription_status: 'active'
        })
        .select()
        .single()

      if (deptError) {
        console.error('Department creation error:', deptError)
        throw new Error('Failed to create department: ' + deptError.message)
      }

      console.log('Department created:', department.id)

      // Step 3: Create user profile
      const {data: profile, error: profileError} = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          department_id: department.id,
          email: email,
          first_name: departmentData.adminFirstName,
          last_name: departmentData.adminLastName,
          role: 'fire-chief',
          status: 'active'
        })
        .select()
        .single()

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error('Failed to create user profile: ' + profileError.message)
      }

      console.log('User profile created:', profile.id)

      // Step 4: Initialize subscription usage tracking
      const resources = ['stations', 'equipment', 'users']
      for (const resource of resources) {
        const {error: usageError} = await supabase
          .from('subscription_usage')
          .insert({
            department_id: department.id,
            resource_type: resource,
            current_usage: resource === 'users' ? 1 : 0 // Start with 1 user (the admin)
          })

        if (usageError) {
          console.warn('Usage tracking setup warning:', usageError)
          // Don't fail signup for this
        }
      }

      // Step 5: Create default station
      const {data: defaultStation, error: stationError} = await supabase
        .from('stations')
        .insert({
          department_id: department.id,
          name: 'Station 1',
          address: '',
          phone: '',
          created_by: profile.id
        })
        .select()
        .single()

      if (stationError) {
        console.warn('Default station creation warning:', stationError)
        // Don't fail signup for this
      } else {
        console.log('Default station created:', defaultStation.id)
      }

      // Set up the user objects
      this.currentUser = {
        id: authData.user.id,
        email: authData.user.email,
        name: `${departmentData.adminFirstName} ${departmentData.adminLastName}`,
        firstName: departmentData.adminFirstName,
        lastName: departmentData.adminLastName,
        role: 'fire-chief',
        department: departmentData.name,
        departmentId: department.id,
        plan: department.plan,
        createdAt: authData.user.created_at
      }

      this.department = {
        id: department.id,
        name: departmentData.name,
        adminEmail: email,
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
      console.error('Sign up error:', error)
      toast.error('Failed to create account: ' + error.message)
      return {
        success: false,
        error
      }
    }
  }

  async signIn(email, password) {
    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
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

        // Update last login
        await supabase
          .from('user_profiles')
          .update({last_login: new Date().toISOString()})
          .eq('user_id', data.user.id)

        toast.success('Successfully signed in!')
        return {
          success: true,
          user: this.currentUser
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Failed to sign in: ' + error.message)
      return {
        success: false,
        error
      }
    }
  }

  async signOut() {
    try {
      const {error} = await supabase.auth.signOut()
      if (error) throw error

      this.currentUser = null
      this.department = null
      toast.success('Successfully signed out')
      return {success: true}
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
      return {success: false, error}
    }
  }

  async resetPassword(email) {
    try {
      const {error} = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error

      toast.success('Password reset email sent')
      return {success: true}
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('Failed to send reset email')
      return {success: false, error}
    }
  }

  async updatePassword(newPassword) {
    try {
      const {error} = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) throw error

      toast.success('Password updated successfully')
      return {success: true}
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('Failed to update password')
      return {success: false, error}
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
    const {subscriptionStatus, trialEndsAt} = this.department

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

export {USER_ROLES}
export const authService = new AuthService()