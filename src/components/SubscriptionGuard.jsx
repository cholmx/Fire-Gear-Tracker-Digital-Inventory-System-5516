import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usageTracker } from '../lib/analytics'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiLock, FiCreditCard, FiArrowRight } = FiIcons

const SubscriptionGuard = ({ 
  children, 
  feature, 
  resource,
  showUpgrade = true,
  fallback = null 
}) => {
  const { user, department, isSubscriptionActive, getPlanLimits, canUseFeature } = useAuth()

  // Check subscription status
  if (!isSubscriptionActive()) {
    if (fallback) return fallback
    
    return (
      <div className="text-center py-12 bg-mission-bg-secondary border border-mission-border rounded-lg">
        <SafeIcon icon={FiLock} className="w-12 h-12 text-mission-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-2">
          Subscription Required
        </h3>
        <p className="text-mission-text-secondary mb-6">
          {department?.subscription_status === 'trial' 
            ? 'Your trial has expired. Please upgrade to continue using this feature.'
            : 'This feature requires an active subscription.'
          }
        </p>
        {showUpgrade && (
          <button className="inline-flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-6 py-3 rounded-lg transition-colors">
            <SafeIcon icon={FiCreditCard} className="w-4 h-4" />
            <span>Upgrade Plan</span>
            <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  // Check feature availability
  if (feature && !canUseFeature(feature)) {
    if (fallback) return fallback
    
    return (
      <div className="text-center py-8 bg-yellow-900/20 border border-yellow-800 rounded-lg">
        <SafeIcon icon={FiLock} className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
        <h3 className="text-base font-inter-tight font-semibold text-yellow-400 mb-2">
          Feature Not Available
        </h3>
        <p className="text-yellow-300 text-sm mb-4">
          This feature is not available on your current plan.
        </p>
        {showUpgrade && (
          <button className="inline-flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors text-sm">
            <span>Upgrade Plan</span>
            <SafeIcon icon={FiArrowRight} className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  }

  // Check resource limits
  if (resource) {
    const limits = getPlanLimits()
    const limit = limits[resource]
    
    if (limit !== undefined && limit !== Infinity) {
      const usage = usageTracker.checkLimit(resource, 0)
      
      if (!usage.allowed) {
        if (fallback) return fallback
        
        return (
          <div className="text-center py-8 bg-orange-900/20 border border-orange-800 rounded-lg">
            <SafeIcon icon={FiLock} className="w-8 h-8 text-orange-400 mx-auto mb-3" />
            <h3 className="text-base font-inter-tight font-semibold text-orange-400 mb-2">
              Limit Reached
            </h3>
            <p className="text-orange-300 text-sm mb-4">
              You've reached your {resource} limit of {limit}. Upgrade to add more.
            </p>
            {showUpgrade && (
              <button className="inline-flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors text-sm">
                <span>Upgrade Plan</span>
                <SafeIcon icon={FiArrowRight} className="w-3 h-3" />
              </button>
            )}
          </div>
        )
      }
    }
  }

  return children
}

// Usage limit warning component
export const UsageLimitWarning = ({ resource }) => {
  const { getPlanLimits } = useAuth()
  const limits = getPlanLimits()
  const limit = limits[resource]
  
  if (!limit || limit === Infinity) return null
  
  const usage = usageTracker.checkLimit(resource, 0)
  
  if (usage.percentage < 80) return null
  
  const severity = usage.percentage >= 95 ? 'critical' : 'warning'
  const bgColor = severity === 'critical' ? 'bg-red-900/20 border-red-800' : 'bg-yellow-900/20 border-yellow-800'
  const textColor = severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
  
  return (
    <div className={`p-3 rounded-lg border ${bgColor} mb-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiCreditCard} className={`w-4 h-4 ${textColor}`} />
          <span className={`text-sm font-inter ${textColor}`}>
            {Math.round(usage.percentage)}% of {resource} limit used
          </span>
        </div>
        <button className="text-xs bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1 rounded transition-colors">
          Upgrade
        </button>
      </div>
      <div className="mt-2 bg-mission-bg-primary rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${severity === 'critical' ? 'bg-red-600' : 'bg-yellow-600'}`}
          style={{ width: `${usage.percentage}%` }}
        />
      </div>
    </div>
  )
}

export default SubscriptionGuard