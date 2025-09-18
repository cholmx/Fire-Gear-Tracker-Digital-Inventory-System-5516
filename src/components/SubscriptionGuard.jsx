import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import useSubscription from '../hooks/useSubscription'
import UpgradePrompt from './UpgradePrompt'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiLock, FiCreditCard, FiArrowRight } = FiIcons

const SubscriptionGuard = ({ 
  children, 
  feature, 
  resource,
  increment = 1,
  fallback = null 
}) => {
  const { isSubscriptionActive } = useAuth()
  const subscription = useSubscription()

  // Check subscription status
  if (!isSubscriptionActive) {
    if (fallback) return fallback
    
    return (
      <UpgradePrompt 
        title="Subscription Required"
        description="Your trial has expired. Please upgrade to continue using this feature."
      />
    )
  }

  // Check feature availability
  if (feature && !subscription.isSubscriptionActive) {
    if (fallback) return fallback
    
    return (
      <UpgradePrompt 
        feature={feature}
        title="Feature Not Available"
        description="This feature is not available on your current plan."
      />
    )
  }

  // Check resource limits
  if (resource) {
    const limitCheck = subscription.checkLimit(resource, increment)
    
    if (!limitCheck.allowed) {
      if (fallback) return fallback
      
      return (
        <UpgradePrompt 
          resource={resource}
          title="Limit Reached"
          description={`You've reached your ${resource} limit of ${limitCheck.limit}. Upgrade to add more.`}
        />
      )
    }
  }

  return children
}

// Usage limit warning component
export const UsageLimitWarning = ({ resource }) => {
  const subscription = useSubscription()
  const limitCheck = subscription.checkLimit(resource, 0)
  
  if (limitCheck.limit === Infinity || limitCheck.percentage < 80) return null
  
  const severity = limitCheck.percentage >= 95 ? 'critical' : 'warning'
  const bgColor = severity === 'critical' ? 'bg-red-900/20 border-red-800' : 'bg-yellow-900/20 border-yellow-800'
  const textColor = severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
  
  return (
    <div className={`p-3 rounded-lg border ${bgColor} mb-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiCreditCard} className={`w-4 h-4 ${textColor}`} />
          <span className={`text-sm font-inter ${textColor}`}>
            {limitCheck.percentage}% of {resource} limit used
          </span>
        </div>
        <button className="text-xs bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1 rounded transition-colors">
          Upgrade
        </button>
      </div>
      <div className="mt-2 bg-mission-bg-primary rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${severity === 'critical' ? 'bg-red-600' : 'bg-yellow-600'}`}
          style={{ width: `${limitCheck.percentage}%` }}
        />
      </div>
    </div>
  )
}

export default SubscriptionGuard