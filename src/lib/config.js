// Application configuration with environment variables

export const config = {
  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  
  // Application
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'Fire Gear Tracker',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
    version: import.meta.env.PACKAGE_VERSION || '1.0.0'
  },
  
  // Analytics
  analytics: {
    id: import.meta.env.VITE_ANALYTICS_ID
  },
  
  // Stripe (for payments)
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  },
  
  // Feature flags
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enablePayments: import.meta.env.VITE_ENABLE_PAYMENTS === 'true',
    enableRealtime: import.meta.env.VITE_ENABLE_REALTIME !== 'false', // Default true
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true'
  }
}

// Validation function
export const validateConfig = () => {
  const errors = []
  
  if (!config.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required')
  }
  
  if (!config.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required')
  }
  
  if (config.supabase.url && !config.supabase.url.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must start with https://')
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`)
  }
  
  return true
}

// Environment helpers
export const isDevelopment = () => config.app.environment === 'development'
export const isProduction = () => config.app.environment === 'production'
export const isDebugMode = () => config.features.debugMode

export default config