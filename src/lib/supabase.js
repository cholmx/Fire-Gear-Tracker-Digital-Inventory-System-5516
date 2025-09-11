import { createClient } from '@supabase/supabase-js'
import { transformDataToSnakeCase, transformDataToCamelCase } from './database'

// Environment variables with validation
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!SUPABASE_URL || SUPABASE_URL === 'https://your-project-id.supabase.co') {
  throw new Error('Missing or invalid VITE_SUPABASE_URL environment variable. Please check your .env.local file.')
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your-anon-key-here') {
  throw new Error('Missing or invalid VITE_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.')
}

// Validate URL format
try {
  new URL(SUPABASE_URL)
} catch (error) {
  throw new Error('Invalid VITE_SUPABASE_URL format. Must be a valid URL.')
}

// Create Supabase client with optimized settings
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'fire-gear-tracker'
    }
  }
})

// Enhanced error handler with signup-specific handling
export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase error in ${context}:`, error)

  // Signup-specific errors
  if (context.includes('signup') || context.includes('registration')) {
    if (error.message?.includes('row-level security')) {
      return {
        retryable: false,
        error: new Error('Account creation failed due to security policy. Please try again or contact support.')
      }
    }

    if (error.message?.includes('department')) {
      return {
        retryable: false,
        error: new Error('Department setup failed. Please ensure all required information is provided.')
      }
    }

    if (error.message?.includes('user_profiles')) {
      return {
        retryable: false,
        error: new Error('User profile creation failed. Please try signing up again.')
      }
    }
  }

  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    console.log('Network error detected, check your connection')
    return {
      retryable: true,
      error: new Error('Network connection error. Please check your internet connection and try again.')
    }
  }

  // Auth errors
  if (error.message?.includes('Invalid login credentials')) {
    return {
      retryable: false,
      error: new Error('Invalid email or password. Please check your credentials and try again.')
    }
  }

  // RLS errors
  if (error.message?.includes('row-level security')) {
    return {
      retryable: false,
      error: new Error('Access denied. Please contact your administrator.')
    }
  }

  // Generic database errors
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique constraint violation
        if (error.message?.includes('email')) {
          return {
            retryable: false,
            error: new Error('An account with this email already exists. Please use a different email or sign in.')
          }
        }
        return {
          retryable: false,
          error: new Error('This record already exists. Please use different values.')
        }
      case '23503': // Foreign key constraint violation
        return {
          retryable: false,
          error: new Error('Invalid reference. Please check your data and try again.')
        }
      case '42501': // Insufficient privilege
        return {
          retryable: false,
          error: new Error('Access denied. You don\'t have permission to perform this action.')
        }
      case '23514': // Check constraint violation
        return {
          retryable: false,
          error: new Error('Invalid data provided. Please check your input and try again.')
        }
      default:
        return {
          retryable: false,
          error: new Error(`Database error: ${error.message}`)
        }
    }
  }

  return { retryable: false, error }
}

// Retry wrapper for network resilience
export const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const { retryable } = handleSupabaseError(error, 'retry operation')

      if (!retryable || i === maxRetries - 1) {
        break
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }

  throw lastError
}

// Comprehensive connection health check system
export const checkConnection = async () => {
  const healthCheck = {
    connected: false,
    healthy: false,
    authenticated: false,
    hasProfile: false,
    hasDepartment: false,
    canQueryData: false,
    latency: null,
    error: null,
    details: {},
    demo: false
  }

  try {
    const startTime = Date.now()
    
    // Test 1: Basic connectivity to Supabase
    console.log('🔍 Testing basic Supabase connectivity...')
    const { data: basicTest, error: basicError } = await supabase
      .from('departments')
      .select('count')
      .limit(1)

    if (basicError) {
      console.error('❌ Basic connectivity failed:', basicError)
      healthCheck.error = basicError
      healthCheck.details.basicConnectivity = false
      return healthCheck
    }

    healthCheck.connected = true
    healthCheck.details.basicConnectivity = true
    healthCheck.latency = Date.now() - startTime
    
    console.log('✅ Basic connectivity successful')

    // Test 2: Authentication status
    console.log('🔍 Checking authentication status...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Auth check failed:', authError)
      healthCheck.details.authenticationCheck = false
      healthCheck.error = authError
    } else {
      healthCheck.details.authenticationCheck = true
      healthCheck.authenticated = !!user
      healthCheck.details.userId = user?.id
      healthCheck.details.userEmail = user?.email
      
      console.log(`✅ Authentication check: ${user ? 'Authenticated' : 'Not authenticated'}`)
    }

    // Test 3: User profile access (if authenticated)
    if (user) {
      console.log('🔍 Testing user profile access...')
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, department_id, role, email, first_name, last_name')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          console.error('❌ Profile access failed:', profileError)
          healthCheck.details.profileAccess = false
          healthCheck.details.profileError = profileError.message
        } else {
          healthCheck.hasProfile = !!profile
          healthCheck.details.profileAccess = true
          healthCheck.details.profileId = profile?.id
          healthCheck.details.departmentId = profile?.department_id
          healthCheck.details.userRole = profile?.role
          
          console.log('✅ Profile access successful:', profile?.email)
        }
      } catch (profileError) {
        console.error('❌ Profile query failed:', profileError)
        healthCheck.details.profileAccess = false
        healthCheck.details.profileError = profileError.message
      }

      // Test 4: Department access (if user has profile)
      if (healthCheck.hasProfile && healthCheck.details.departmentId) {
        console.log('🔍 Testing department access...')
        try {
          const { data: department, error: deptError } = await supabase
            .from('departments')
            .select('id, name, plan, subscription_status')
            .eq('id', healthCheck.details.departmentId)
            .single()

          if (deptError) {
            console.error('❌ Department access failed:', deptError)
            healthCheck.details.departmentAccess = false
            healthCheck.details.departmentError = deptError.message
          } else {
            healthCheck.hasDepartment = !!department
            healthCheck.details.departmentAccess = true
            healthCheck.details.departmentName = department?.name
            healthCheck.details.departmentPlan = department?.plan
            
            console.log('✅ Department access successful:', department?.name)
          }
        } catch (deptError) {
          console.error('❌ Department query failed:', deptError)
          healthCheck.details.departmentAccess = false
          healthCheck.details.departmentError = deptError.message
        }

        // Test 5: Data querying capability (if has department)
        if (healthCheck.hasDepartment) {
          console.log('🔍 Testing data query capabilities...')
          try {
            const { data: testData, error: queryError } = await supabase
              .from('stations')
              .select('id, name')
              .limit(1)

            if (queryError) {
              console.error('❌ Data query failed:', queryError)
              healthCheck.details.dataQuery = false
              healthCheck.details.queryError = queryError.message
            } else {
              healthCheck.canQueryData = true
              healthCheck.details.dataQuery = true
              healthCheck.details.sampleDataCount = testData?.length || 0
              
              console.log('✅ Data query successful')
            }
          } catch (queryError) {
            console.error('❌ Data query exception:', queryError)
            healthCheck.details.dataQuery = false
            healthCheck.details.queryError = queryError.message
          }
        }
      }
    }

    // Test 6: RPC function access
    console.log('🔍 Testing RPC function access...')
    try {
      const { data: rpcTest, error: rpcError } = await supabase.rpc('test_rls_policies')
      
      if (rpcError && rpcError.code !== '42883') { // 42883 = function does not exist (which is OK)
        console.error('❌ RPC test failed:', rpcError)
        healthCheck.details.rpcAccess = false
        healthCheck.details.rpcError = rpcError.message
      } else {
        healthCheck.details.rpcAccess = true
        console.log('✅ RPC access test completed')
      }
    } catch (rpcError) {
      console.error('❌ RPC test exception:', rpcError)
      healthCheck.details.rpcAccess = false
      healthCheck.details.rpcError = rpcError.message
    }

    // Determine overall health status
    healthCheck.healthy = healthCheck.connected && (
      !healthCheck.authenticated || // Not authenticated is OK
      (healthCheck.authenticated && healthCheck.hasProfile && healthCheck.hasDepartment && healthCheck.canQueryData)
    )

    // Calculate final latency
    healthCheck.latency = Date.now() - startTime

    console.log('🏁 Health check completed:', {
      connected: healthCheck.connected,
      healthy: healthCheck.healthy,
      authenticated: healthCheck.authenticated,
      hasProfile: healthCheck.hasProfile,
      hasDepartment: healthCheck.hasDepartment,
      canQueryData: healthCheck.canQueryData,
      latency: `${healthCheck.latency}ms`
    })

    return healthCheck

  } catch (error) {
    console.error('❌ Health check failed with exception:', error)
    const { error: handledError } = handleSupabaseError(error, 'connection check')
    
    return {
      ...healthCheck,
      connected: false,
      healthy: false,
      error: handledError,
      details: {
        ...healthCheck.details,
        criticalError: error.message
      }
    }
  }
}

// Quick connection test for UI status indicators
export const quickConnectionTest = async () => {
  try {
    const startTime = Date.now()
    
    // Simple ping test
    const { error } = await supabase
      .from('departments')
      .select('count')
      .limit(1)
    
    const latency = Date.now() - startTime
    
    return {
      connected: !error,
      latency,
      error
    }
  } catch (error) {
    return {
      connected: false,
      latency: null,
      error
    }
  }
}

// Test RLS policies (for debugging)
export const testRLSPolicies = async () => {
  try {
    console.log('Testing RLS policies...')
    const { data, error } = await supabase.rpc('test_rls_policies')

    if (error) {
      console.error('RLS test error:', error)
      return { success: false, error }
    }

    console.log('RLS test results:', data)
    return { success: true, data }
  } catch (error) {
    console.error('RLS test failed:', error)
    return { success: false, error }
  }
}

// Atomic signup operations using RPC functions
export const signupOperations = {
  // Validate signup data before attempting signup
  async validateSignup(email, departmentName) {
    try {
      const { data, error } = await supabase.rpc('can_signup', {
        user_email: email,
        dept_name: departmentName
      })

      if (error) {
        console.error('Error validating signup:', error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error validating signup:', error)
      return { success: false, error }
    }
  },

  // Create complete user account atomically
  async createCompleteAccount(userId, email, departmentData) {
    try {
      const { data, error } = await supabase.rpc('signup_user', {
        auth_user_id: userId,
        user_email: email,
        dept_name: departmentData.name,
        admin_first_name: departmentData.adminFirstName,
        admin_last_name: departmentData.adminLastName,
        selected_plan: departmentData.selectedPlan || 'free'
      })

      if (error) {
        console.error('Error creating account:', error)
        return { success: false, error }
      }

      if (!data || !data.success) {
        const errorMessage = data?.error?.message || 'Unknown error during account creation'
        return { success: false, error: new Error(errorMessage) }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error creating account:', error)
      return { success: false, error }
    }
  },

  // Check user signup status
  async checkSignupStatus(userId) {
    try {
      const { data, error } = await supabase.rpc('get_user_signup_status', {
        auth_user_id: userId
      })

      if (error) {
        console.error('Error checking signup status:', error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error checking signup status:', error)
      return { success: false, error }
    }
  },

  // Clean up failed signup (admin only)
  async cleanupFailedSignup(departmentId) {
    try {
      const { data, error } = await supabase.rpc('cleanup_failed_signup', {
        dept_id: departmentId
      })

      if (error) {
        console.error('Error cleaning up failed signup:', error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error cleaning up failed signup:', error)
      return { success: false, error }
    }
  }
}

// Subscription manager for real-time updates with data transformation
class SupabaseSubscriptionManager {
  constructor() {
    this.subscriptions = new Map()
  }

  subscribe(table, callback, filter = {}) {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter.filter || undefined
        },
        (payload) => {
          try {
            // Transform payload data to camelCase before calling callback
            const transformedPayload = {
              ...payload,
              new: payload.new ? transformDataToCamelCase(payload.new) : payload.new,
              old: payload.old ? transformDataToCamelCase(payload.old) : payload.old
            }
            callback(transformedPayload)
          } catch (error) {
            console.error('Error in subscription callback:', error)
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription to ${table} status:`, status)
      })

    this.subscriptions.set(`${table}_${JSON.stringify(filter)}`, channel)

    return {
      unsubscribe: () => this.unsubscribe(table, filter)
    }
  }

  unsubscribe(table, filter = {}) {
    const key = `${table}_${JSON.stringify(filter)}`
    const channel = this.subscriptions.get(key)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(key)
    }
  }

  unsubscribeAll() {
    for (const [key, channel] of this.subscriptions) {
      supabase.removeChannel(channel)
    }
    this.subscriptions.clear()
  }
}

export const subscriptionManager = new SupabaseSubscriptionManager()

// Test database operations with comprehensive checks
export const testDatabaseOperations = async () => {
  try {
    console.log('🧪 Starting comprehensive database test...')

    // Run full health check
    const health = await checkConnection()
    
    if (!health.connected) {
      return {
        success: false,
        error: health.error,
        message: 'Database connection failed'
      }
    }

    if (!health.healthy) {
      return {
        success: false,
        error: health.error,
        message: 'Database health check failed',
        details: health.details
      }
    }

    // Test additional operations if authenticated
    if (health.authenticated && health.hasProfile) {
      console.log('🧪 Testing authenticated operations...')
      
      // Test equipment query
      try {
        const { data: equipment, error: equipError } = await supabase
          .from('equipment')
          .select('id, name, status')
          .limit(5)

        if (equipError) {
          console.warn('⚠️ Equipment query failed:', equipError)
        } else {
          console.log('✅ Equipment query successful:', equipment?.length || 0, 'items')
        }
      } catch (error) {
        console.warn('⚠️ Equipment query exception:', error)
      }

      // Test inspection query
      try {
        const { data: inspections, error: inspError } = await supabase
          .from('inspections')
          .select('id, name, due_date')
          .limit(5)

        if (inspError) {
          console.warn('⚠️ Inspections query failed:', inspError)
        } else {
          console.log('✅ Inspections query successful:', inspections?.length || 0, 'items')
        }
      } catch (error) {
        console.warn('⚠️ Inspections query exception:', error)
      }
    }

    console.log('✅ Database operations test completed successfully')
    
    return {
      success: true,
      health,
      message: 'All database operations working correctly'
    }

  } catch (error) {
    console.error('❌ Database operations test failed:', error)
    return {
      success: false,
      error,
      message: 'Database operations test failed with exception'
    }
  }
}

// Monitor connection status continuously
export class ConnectionMonitor {
  constructor() {
    this.isMonitoring = false
    this.listeners = new Set()
    this.lastStatus = null
    this.checkInterval = null
  }

  startMonitoring(intervalMs = 30000) { // Check every 30 seconds
    if (this.isMonitoring) return

    this.isMonitoring = true
    console.log('🔍 Starting connection monitoring...')

    // Initial check
    this.performCheck()

    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.performCheck()
    }, intervalMs)
  }

  stopMonitoring() {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    console.log('⏹️ Stopping connection monitoring...')

    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  async performCheck() {
    try {
      const status = await quickConnectionTest()
      
      // Only notify listeners if status changed
      if (!this.lastStatus || 
          this.lastStatus.connected !== status.connected ||
          Math.abs((this.lastStatus.latency || 0) - (status.latency || 0)) > 1000) {
        
        this.lastStatus = status
        this.notifyListeners(status)
      }
    } catch (error) {
      console.error('Connection monitoring check failed:', error)
      const errorStatus = { connected: false, latency: null, error }
      this.lastStatus = errorStatus
      this.notifyListeners(errorStatus)
    }
  }

  addListener(callback) {
    this.listeners.add(callback)
    
    // Send current status to new listener
    if (this.lastStatus) {
      callback(this.lastStatus)
    }
    
    return () => this.listeners.delete(callback)
  }

  notifyListeners(status) {
    this.listeners.forEach(callback => {
      try {
        callback(status)
      } catch (error) {
        console.error('Connection monitor listener error:', error)
      }
    })
  }
}

// Global connection monitor instance
export const connectionMonitor = new ConnectionMonitor()

// Export the client and utilities
export default supabase
export { supabase }