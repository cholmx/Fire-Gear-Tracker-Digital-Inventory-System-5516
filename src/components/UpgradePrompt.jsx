import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { STRIPE_PLANS, stripeService } from '../lib/stripe'
import SafeIcon from '../common/SafeIcon'
import SubscriptionManager from './SubscriptionManager'
import * as FiIcons from 'react-icons/fi'

const { FiLock, FiArrowRight, FiStar } = FiIcons

const UpgradePrompt = ({ 
  feature, 
  resource, 
  title,
  description,
  showModal = true 
}) => {
  const { department } = useAuth()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const currentPlan = STRIPE_PLANS[department?.plan || 'free']
  const nextPlan = getNextPlan()

  function getNextPlan() {
    const planOrder = ['free', 'professional', 'unlimited']
    const currentIndex = planOrder.indexOf(department?.plan || 'free')
    const nextIndex = currentIndex + 1
    
    if (nextIndex < planOrder.length) {
      return STRIPE_PLANS[planOrder[nextIndex]]
    }
    
    return null
  }

  const getResourceLimit = (planId, resourceType) => {
    const plan = STRIPE_PLANS[planId]
    const limit = plan?.limits[resourceType]
    return limit === Infinity ? 'Unlimited' : limit
  }

  if (!nextPlan) {
    return (
      <div className="text-center py-8 bg-mission-bg-secondary border border-mission-border rounded-lg">
        <SafeIcon icon={FiStar} className="w-8 h-8 text-mission-accent-green mx-auto mb-3" />
        <h3 className="text-base font-inter-tight font-semibold text-mission-text-primary mb-2">
          You're on the highest plan!
        </h3>
        <p className="text-mission-text-secondary text-sm">
          You have access to all features and unlimited usage.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="text-center py-8 bg-yellow-900/20 border border-yellow-800 rounded-lg">
        <SafeIcon icon={FiLock} className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
        
        <h3 className="text-base font-inter-tight font-semibold text-yellow-400 mb-2">
          {title || `${feature || resource} Limit Reached`}
        </h3>
        
        <p className="text-yellow-300 text-sm mb-4">
          {description || `You've reached your ${resource} limit on the ${currentPlan.name} plan.`}
        </p>

        {resource && (
          <div className="bg-yellow-900/30 rounded-lg p-3 mb-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-yellow-200">Current Plan ({currentPlan.name}):</span>
              <span className="font-roboto-mono text-yellow-100">
                {getResourceLimit(currentPlan.id, resource)} {resource}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-yellow-200">Upgrade to {nextPlan.name}:</span>
              <span className="font-roboto-mono text-green-400">
                {getResourceLimit(nextPlan.id, resource)} {resource}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="inline-flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <span>Upgrade to {nextPlan.name}</span>
            <SafeIcon icon={FiArrowRight} className="w-3 h-3" />
          </button>
          
          <p className="text-xs text-yellow-300">
            Starting at {stripeService.formatPrice(nextPlan.monthlyPrice)}/month
          </p>
        </div>
      </div>

      {showModal && (
        <SubscriptionManager 
          showUpgradeModal={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  )
}

export default UpgradePrompt