import {createClient} from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xibhmevisztsdlpueutj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpYmhtZXZpc3p0c2RscHVldXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzkxMTEsImV4cCI6MjA2NjU1NTExMX0.NnKoDfqIinXqATfHAtdA-khC9Ea8ytNnzzUfkrwBgEg'

// Validate credentials
if (!SUPABASE_URL || SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co') {
  throw new Error('Missing Supabase URL. Please check your environment configuration.')
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase anonymous key. Please check your environment configuration.')
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

// Enhanced error handler
export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase error in ${context}:`, error)
  
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
      default:
        return {
          retryable: false,
          error: new Error(`Database error: ${error.message}`)
        }
    }
  }
  
  return {retryable: false, error}
}

// Retry wrapper for network resilience
export const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const {retryable} = handleSupabaseError(error, 'retry operation')
      
      if (!retryable || i === maxRetries - 1) {
        break
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  
  throw lastError
}

// Connection health check with better error handling
export const checkConnection = async () => {
  try {
    // Test basic connectivity
    const {data, error} = await supabase
      .from('departments')
      .select('count')
      .limit(1)
    
    if (error) {
      const {error: handledError} = handleSupabaseError(error, 'connection check')
      return {
        connected: false,
        healthy: false,
        error: handledError,
        demo: false
      }
    }
    
    return {
      connected: true,
      healthy: true,
      error: null,
      demo: false
    }
  } catch (error) {
    const {error: handledError} = handleSupabaseError(error, 'connection check')
    return {
      connected: false,
      healthy: false,
      error: handledError,
      demo: false
    }
  }
}

// Subscription manager for real-time updates
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
            callback(payload)
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

// Test database operations
export const testDatabaseOperations = async () => {
  try {
    console.log('Testing database operations...')
    
    // Test 1: Basic connectivity
    const connectionTest = await checkConnection()
    console.log('Connection test:', connectionTest)
    
    // Test 2: Auth status
    const {data: {user}} = await supabase.auth.getUser()
    console.log('Auth user:', user?.email || 'Not authenticated')
    
    // Test 3: User profile access (if authenticated)
    if (user) {
      const {data: profile, error: profileError} = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      console.log('User profile:', profile || 'No profile found')
      if (profileError) console.log('Profile error:', profileError)
    }
    
    return {success: true}
  } catch (error) {
    console.error('Database test failed:', error)
    return {success: false, error}
  }
}

// Export the client and utilities
export default supabase
export {supabase}