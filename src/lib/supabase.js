import { createClient } from '@supabase/supabase-js'

// Environment variables with validation
const SUPABASE_URL = 'https://xibhmevisztsdlpueutj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpYmhtZXZpc3p0c2RscHVldXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NzkxMTEsImV4cCI6MjA2NjU1NTExMX0.NnKoDfqIinXqATfHAtdA-khC9Ea8ytNnzzUfkrwBgEg'

// Validate environment variables
if (!SUPABASE_URL || SUPABASE_URL === 'https://your-project-id.supabase.co') {
  throw new Error('Missing or invalid VITE_SUPABASE_URL environment variable. Please check your .env.local file.')
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your-anon-key-here') {
  throw new Error('Missing or invalid VITE_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.')
}

// Create Supabase client with security-hardened settings
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'fire-gear-tracker-auth'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'fire-gear-tracker',
      'x-application-version': '1.0.0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10 // Rate limit realtime events
    }
  }
})

// Enhanced error handler with security-focused logging
export const handleSupabaseError = (error, context = '') => {
  console.error('Supabase error:', { message: error.message, code: error.code, context })

  // Authentication errors
  if (error.message?.includes('Invalid login credentials')) {
    return new Error('Invalid email or password. Please check your credentials and try again.')
  }

  if (error.message?.includes('Email not confirmed')) {
    return new Error('Please check your email and click the confirmation link before signing in.')
  }

  // Authorization errors (RLS violations)
  if (error.message?.includes('row-level security') || error.code === '42501') {
    return new Error('Access denied. You don\'t have permission to access this data.')
  }

  // Database constraint violations
  if (error.code === '23505') { // Unique constraint
    if (error.message?.includes('email')) {
      return new Error('An account with this email already exists.')
    }
    if (error.message?.includes('serial_number')) {
      return new Error('This serial number is already in use.')
    }
    return new Error('This record already exists.')
  }

  if (error.code === '23503') { // Foreign key constraint
    return new Error('Invalid reference. Please ensure all required data exists.')
  }

  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return new Error('Network connection error. Please check your internet connection and try again.')
  }

  // Generic error (don't expose internal details)
  return new Error('An unexpected error occurred. Please try again or contact support.')
}

// Simplified connection health check
export const checkConnection = async () => {
  const healthCheck = {
    connected: false,
    healthy: false,
    authenticated: false,
    hasProfile: false,
    error: null,
    latency: null
  }

  try {
    const startTime = Date.now()
    
    // Test basic connectivity
    const { error: basicError } = await supabase
      .from('departments')
      .select('count')
      .limit(1)
    
    if (basicError) {
      healthCheck.error = handleSupabaseError(basicError, 'connection check')
      return healthCheck
    }

    healthCheck.connected = true
    healthCheck.latency = Date.now() - startTime

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      healthCheck.error = handleSupabaseError(authError, 'auth check')
    } else {
      healthCheck.authenticated = !!user
      
      // Check if user has profile
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, department_id, role')
          .eq('user_id', user.id)
          .single()
        
        if (!profileError && profile) {
          healthCheck.hasProfile = true
        }
      }
    }

    healthCheck.healthy = healthCheck.connected && (!healthCheck.authenticated || healthCheck.hasProfile)
    return healthCheck

  } catch (error) {
    return {
      ...healthCheck,
      error: handleSupabaseError(error, 'connection check')
    }
  }
}

// Export the client
export default supabase
export { supabase }