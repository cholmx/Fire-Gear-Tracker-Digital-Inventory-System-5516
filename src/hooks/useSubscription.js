import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { STRIPE_PLANS } from '../lib/stripe'

export const useSubscription = () => {
  const { department } = useAuth()
  const { stations, equipment } = useData()
  const [usage, setUsage] = useState({
    stations: 0,
    equipment: 0,
    users: 1
  })

  useEffect(() => {
    setUsage({
      stations: stations.length,
      equipment: equipment.length,
      users: 1 // This would come from actual user count
    })
  }, [stations, equipment])

  const getCurrentPlan = () => {
    return STRIPE_PLANS[department?.plan || 'free']
  }

  const getPlanLimits = () => {
    const plan = getCurrentPlan()
    return plan?.limits || { stations: 1, equipment: 50, users: 3 }
  }

  const checkLimit = (resource, increment = 1) => {
    const limits = getPlanLimits()
    const currentUsage = usage[resource] || 0
    const limit = limits[resource]
    
    if (limit === Infinity) {
      return { allowed: true, remaining: Infinity, percentage: 0 }
    }
    
    const newUsage = currentUsage + increment
    const allowed = newUsage <= limit
    const remaining = Math.max(0, limit - newUsage)
    const percentage = (currentUsage / limit) * 100
    
    return {
      allowed,
      remaining,
      current: currentUsage,
      limit,
      percentage: Math.round(percentage)
    }
  }

  const isNearLimit = (resource, threshold = 80) => {
    const check = checkLimit(resource, 0)
    return check.percentage >= threshold
  }

  const getUsageWarnings = () => {
    const warnings = []
    const limits = getPlanLimits()
    
    Object.entries(usage).forEach(([resource, count]) => {
      const limit = limits[resource]
      if (limit !== Infinity) {
        const percentage = (count / limit) * 100
        
        if (percentage >= 80) {
          warnings.push({
            resource,
            count,
            limit,
            percentage: Math.round(percentage),
            severity: percentage >= 100 ? 'critical' : percentage >= 90 ? 'high' : 'medium'
          })
        }
      }
    })
    
    return warnings
  }

  const canUpgrade = () => {
    const planOrder = { free: 0, professional: 1, unlimited: 2 }
    const currentOrder = planOrder[department?.plan || 'free']
    return currentOrder < 2 // Can upgrade if not on unlimited
  }

  const getNextPlan = () => {
    const planOrder = ['free', 'professional', 'unlimited']
    const currentIndex = planOrder.indexOf(department?.plan || 'free')
    const nextIndex = currentIndex + 1
    
    if (nextIndex < planOrder.length) {
      return STRIPE_PLANS[planOrder[nextIndex]]
    }
    
    return null
  }

  const isSubscriptionActive = () => {
    if (!department) return false
    
    const { subscriptionStatus, trialEndsAt } = department
    
    // Active subscription
    if (subscriptionStatus === 'active') return true
    
    // Trial period
    if (subscriptionStatus === 'trial') {
      return trialEndsAt ? new Date() < new Date(trialEndsAt) : true
    }
    
    return false
  }

  const getDaysUntilTrialEnd = () => {
    if (department?.subscriptionStatus !== 'trial' || !department.trialEndsAt) {
      return null
    }
    
    const trialEnd = new Date(department.trialEndsAt)
    const today = new Date()
    const diffTime = trialEnd - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }

  return {
    usage,
    limits: getPlanLimits(),
    currentPlan: getCurrentPlan(),
    checkLimit,
    isNearLimit,
    getUsageWarnings,
    canUpgrade,
    getNextPlan,
    isSubscriptionActive: isSubscriptionActive(),
    daysUntilTrialEnd: getDaysUntilTrialEnd()
  }
}

export default useSubscription