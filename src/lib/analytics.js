// Analytics and usage tracking
export class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId()
    this.startTime = Date.now()
    this.events = []
    this.flushInterval = 30000 // 30 seconds
    this.maxBatchSize = 50
    
    this.startSession()
    this.setupPeriodicFlush()
  }
  
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  startSession() {
    this.track('session_start', {
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    })
  }
  
  track(event, properties = {}) {
    const eventData = {
      event,
      properties: {
        ...properties,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        page_title: document.title
      }
    }
    
    this.events.push(eventData)
    
    // Auto-flush if batch size reached
    if (this.events.length >= this.maxBatchSize) {
      this.flush()
    }
  }
  
  // Equipment tracking
  trackEquipmentAction(action, equipmentId, metadata = {}) {
    this.track('equipment_action', {
      action,
      equipment_id: equipmentId,
      ...metadata
    })
  }
  
  // Inspection tracking
  trackInspectionAction(action, inspectionId, metadata = {}) {
    this.track('inspection_action', {
      action,
      inspection_id: inspectionId,
      ...metadata
    })
  }
  
  // User interaction tracking
  trackUserInteraction(element, action = 'click') {
    this.track('user_interaction', {
      element,
      action,
      timestamp: Date.now()
    })
  }
  
  // Performance tracking
  trackPerformance(metric, value, context = {}) {
    this.track('performance_metric', {
      metric,
      value,
      context
    })
  }
  
  // Error tracking
  trackError(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context
    })
  }
  
  // Feature usage tracking
  trackFeatureUsage(feature, action = 'used', metadata = {}) {
    this.track('feature_usage', {
      feature,
      action,
      ...metadata
    })
  }
  
  // Page view tracking
  trackPageView(path, title) {
    this.track('page_view', {
      path,
      title,
      referrer: document.referrer
    })
  }
  
  // Search tracking
  trackSearch(query, results_count, context = {}) {
    this.track('search', {
      query,
      results_count,
      ...context
    })
  }
  
  // Export tracking
  trackExport(type, format, record_count) {
    this.track('export', {
      type,
      format,
      record_count
    })
  }
  
  async flush() {
    if (this.events.length === 0) return
    
    const eventsToSend = [...this.events]
    this.events = []
    
    try {
      // In a real implementation, you would send to your analytics service
      // For now, we'll just log to console and optionally store in Supabase
      console.log('Analytics events:', eventsToSend)
      
      // Store in Supabase for department analytics
      if (window.supabase && eventsToSend.length > 0) {
        await window.supabase
          .from('analytics_events')
          .insert(eventsToSend.map(event => ({
            event_name: event.event,
            properties: event.properties,
            session_id: this.sessionId
          })))
      }
    } catch (error) {
      console.error('Failed to flush analytics events:', error)
      // Re-add events to queue for retry
      this.events = [...eventsToSend, ...this.events]
    }
  }
  
  setupPeriodicFlush() {
    setInterval(() => {
      this.flush()
    }, this.flushInterval)
    
    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush()
    })
  }
  
  // Department-specific metrics
  getDepartmentMetrics() {
    const currentTime = Date.now()
    const sessionDuration = currentTime - this.startTime
    
    return {
      session_duration: sessionDuration,
      events_tracked: this.events.length,
      session_id: this.sessionId
    }
  }
  
  // A/B testing support
  trackExperiment(experiment_name, variant, action = 'viewed') {
    this.track('experiment', {
      experiment_name,
      variant,
      action
    })
  }
  
  // Conversion tracking
  trackConversion(goal, value = null, metadata = {}) {
    this.track('conversion', {
      goal,
      value,
      ...metadata
    })
  }
}

// Usage tracking for plan limits
export class UsageTracker {
  constructor() {
    this.limits = {}
    this.usage = {}
  }
  
  setLimits(limits) {
    this.limits = limits
  }
  
  updateUsage(resource, count) {
    this.usage[resource] = count
  }
  
  checkLimit(resource, increment = 1) {
    const currentUsage = this.usage[resource] || 0
    const limit = this.limits[resource]
    
    if (limit === undefined || limit === Infinity) {
      return { allowed: true, remaining: Infinity }
    }
    
    const newUsage = currentUsage + increment
    const allowed = newUsage <= limit
    const remaining = Math.max(0, limit - newUsage)
    
    return {
      allowed,
      remaining,
      current: currentUsage,
      limit,
      percentage: (currentUsage / limit) * 100
    }
  }
  
  getUsageStats() {
    const stats = {}
    
    Object.keys(this.limits).forEach(resource => {
      const limit = this.limits[resource]
      const usage = this.usage[resource] || 0
      
      stats[resource] = {
        usage,
        limit,
        percentage: limit === Infinity ? 0 : (usage / limit) * 100,
        remaining: limit === Infinity ? Infinity : Math.max(0, limit - usage)
      }
    })
    
    return stats
  }
  
  isNearLimit(resource, threshold = 0.8) {
    const stats = this.getUsageStats()[resource]
    if (!stats || stats.limit === Infinity) return false
    
    return stats.percentage >= (threshold * 100)
  }
  
  getWarnings() {
    const warnings = []
    
    Object.keys(this.limits).forEach(resource => {
      if (this.isNearLimit(resource, 0.8)) {
        const stats = this.getUsageStats()[resource]
        warnings.push({
          resource,
          message: `You're using ${Math.round(stats.percentage)}% of your ${resource} limit`,
          severity: stats.percentage >= 95 ? 'critical' : 'warning'
        })
      }
    })
    
    return warnings
  }
}

// Global analytics instance
export const analytics = new AnalyticsService()
export const usageTracker = new UsageTracker()

// Auto-track common events
document.addEventListener('DOMContentLoaded', () => {
  analytics.trackPageView(window.location.pathname, document.title)
})

// Track navigation
let currentPath = window.location.pathname
setInterval(() => {
  if (window.location.pathname !== currentPath) {
    currentPath = window.location.pathname
    analytics.trackPageView(currentPath, document.title)
  }
}, 1000)

export default analytics