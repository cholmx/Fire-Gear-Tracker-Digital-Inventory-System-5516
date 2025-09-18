import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { STRIPE_PLANS } from '../lib/stripe'
import SafeIcon from '../common/SafeIcon'
import SubscriptionManager from './SubscriptionManager'
import * as FiIcons from 'react-icons/fi'

const { FiAlertTriangle, FiArrowRight, FiX } = FiIcons

const UsageLimitBanner = () => {
  const { department } = useAuth()
  const { stations, equipment } = useData()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !department || department.plan === 'unlimited') {
    return null
  }

  const currentPlan = STRIPE_PLANS[department.plan]
  if (!currentPlan) return null

  const usage = {
    stations: stations.length,
    equipment: equipment.length,
    users: 1 // This would come from actual user count
  }

  const limits = currentPlan.limits
  const warnings = []

  // Check for usage warnings
  Object.entries(usage).forEach(([resource, count]) => {
    const limit = limits[resource]
    if (limit !== Infinity) {
      const percentage = (count / limit) * 100
      
      if (percentage >= 90) {
        warnings.push({
          resource,
          count,
          limit,
          percentage: Math.round(percentage),
          severity: percentage >= 100 ? 'critical' : 'warning'
        })
      }
    }
  })

  if (warnings.length === 0) return null

  const criticalWarnings = warnings.filter(w => w.severity === 'critical')
  const hasBlockingLimits = criticalWarnings.length > 0

  return (
    <>
      <div className={`mx-6 mb-6 rounded-lg border p-4 ${
        hasBlockingLimits 
          ? 'bg-red-950/20 border-red-800' 
          : 'bg-yellow-900/20 border-yellow-800'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <SafeIcon 
              icon={FiAlertTriangle} 
              className={`w-5 h-5 mt-0.5 ${
                hasBlockingLimits ? 'text-red-400' : 'text-yellow-400'
              }`} 
            />
            <div className="flex-1">
              <h3 className={`font-medium mb-1 ${
                hasBlockingLimits ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {hasBlockingLimits ? 'Plan Limit Reached' : 'Approaching Plan Limit'}
              </h3>
              
              <div className="space-y-2">
                {warnings.map((warning) => (
                  <div key={warning.resource} className="flex items-center justify-between">
                    <span className={`text-sm ${
                      hasBlockingLimits ? 'text-red-300' : 'text-yellow-300'
                    }`}>
                      {warning.resource.charAt(0).toUpperCase() + warning.resource.slice(1)}: {warning.count}/{warning.limit}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-mission-bg-primary rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            warning.severity === 'critical' ? 'bg-red-600' : 'bg-yellow-600'
                          }`}
                          style={{ width: `${Math.min(warning.percentage, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-roboto-mono ${
                        hasBlockingLimits ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {warning.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className={`text-sm mt-2 ${
                hasBlockingLimits ? 'text-red-300' : 'text-yellow-300'
              }`}>
                {hasBlockingLimits 
                  ? 'You cannot add more items until you upgrade your plan.'
                  : 'Consider upgrading to avoid hitting your plan limits.'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors"
            >
              <span>UPGRADE</span>
              <SafeIcon icon={FiArrowRight} className="w-3 h-3" />
            </button>
            
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-mission-text-muted hover:text-mission-text-primary transition-colors"
            >
              <SafeIcon icon={FiX} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <SubscriptionManager 
        showUpgradeModal={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  )
}

export default UsageLimitBanner