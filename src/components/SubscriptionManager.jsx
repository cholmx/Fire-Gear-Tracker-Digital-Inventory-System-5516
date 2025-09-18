import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { stripeService, STRIPE_PLANS } from '../lib/stripe'
import SafeIcon from '../common/SafeIcon'
import Modal from './Modal'
import LoadingSpinner from './LoadingSpinner'
import * as FiIcons from 'react-icons/fi'

const { FiCreditCard, FiCheck, FiArrowRight, FiExternalLink, FiGift, FiZap, FiStar } = FiIcons

const SubscriptionManager = ({ showUpgradeModal, onClose }) => {
  const { user, department } = useAuth()
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(department?.plan || 'free')

  const currentPlan = STRIPE_PLANS[department?.plan || 'free']
  const plans = Object.values(STRIPE_PLANS)

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return

    setLoading(true)
    try {
      const plan = STRIPE_PLANS[planId]
      const paymentLink = plan.paymentLinks?.[billingCycle]
      
      if (paymentLink) {
        // Store upgrade context for post-payment handling
        sessionStorage.setItem('upgradeContext', JSON.stringify({
          fromPlan: department?.plan,
          toPlan: planId,
          billingCycle,
          userId: user?.id,
          departmentId: department?.id
        }))
        
        // Redirect to Stripe payment link
        window.location.href = paymentLink
      } else {
        throw new Error('Payment link not available for this plan')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Failed to start upgrade process. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    if (!department?.customerId) {
      alert('No billing information found. Please contact support.')
      return
    }

    setLoading(true)
    try {
      await stripeService.createPortalSession(department.customerId)
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPrice = (plan) => {
    if (plan.monthlyPrice === 0) return 'Free'
    return billingCycle === 'monthly' 
      ? stripeService.formatPrice(plan.monthlyPrice)
      : stripeService.formatPrice(plan.yearlyPrice)
  }

  const getPeriod = (plan) => {
    if (plan.monthlyPrice === 0) return ''
    return billingCycle === 'monthly' ? '/month' : '/year'
  }

  const getSavings = (plan) => {
    if (plan.monthlyPrice === 0) return ''
    const savings = stripeService.calculateYearlySavings(plan)
    return savings > 0 ? `Save ${stripeService.formatPrice(savings)}/year` : ''
  }

  const isCurrentPlan = (planId) => {
    return department?.plan === planId
  }

  const canUpgrade = (planId) => {
    const planOrder = { free: 0, professional: 1, unlimited: 2 }
    const currentOrder = planOrder[department?.plan || 'free']
    const targetOrder = planOrder[planId]
    return targetOrder > currentOrder
  }

  const canDowngrade = (planId) => {
    const planOrder = { free: 0, professional: 1, unlimited: 2 }
    const currentOrder = planOrder[department?.plan || 'free']
    const targetOrder = planOrder[planId]
    return targetOrder < currentOrder
  }

  return (
    <Modal
      isOpen={showUpgradeModal}
      onClose={onClose}
      title="Subscription Management"
      size="xl"
    >
      <div className="space-y-6">
        {/* Current Plan Status */}
        <div className="bg-mission-bg-tertiary rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary">
              Current Plan
            </h3>
            {department?.subscriptionStatus === 'trial' && (
              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-roboto-mono font-medium">
                TRIAL
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-fire-red rounded-lg">
              <SafeIcon icon={FiCreditCard} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-inter-tight font-bold text-mission-text-primary">
                {currentPlan.name}
              </h4>
              <p className="text-mission-text-secondary">
                {currentPlan.monthlyPrice === 0 ? 'Free forever' : 
                 `${getPrice(currentPlan)}${getPeriod(currentPlan)}`}
              </p>
              {department?.subscriptionStatus === 'trial' && (
                <p className="text-yellow-400 text-sm">
                  Trial ends in {Math.ceil((new Date(department.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))} days
                </p>
              )}
            </div>
          </div>

          {department?.plan !== 'free' && (
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="mt-4 flex items-center space-x-2 text-mission-accent-blue hover:text-blue-400 transition-colors"
            >
              <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
              <span>Manage Billing</span>
            </button>
          )}
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <span className={`font-roboto-mono text-xs ${
            billingCycle === 'monthly' ? 'text-mission-text-primary' : 'text-mission-text-muted'
          }`}>
            MONTHLY
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingCycle === 'yearly' ? 'bg-fire-red' : 'bg-mission-border'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <span className={`font-roboto-mono text-xs ${
            billingCycle === 'yearly' ? 'text-mission-text-primary' : 'text-mission-text-muted'
          }`}>
            YEARLY
          </span>
          <span className="text-mission-accent-green text-xs font-roboto-mono font-medium">
            SAVE UP TO 17%
          </span>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-lg p-6 transition-all ${
                isCurrentPlan(plan.id)
                  ? 'border-fire-red ring-2 ring-fire-red/20 bg-fire-red/5'
                  : selectedPlan === plan.id
                  ? 'border-mission-accent-blue ring-2 ring-mission-accent-blue/20'
                  : 'border-mission-border hover:border-mission-border-light'
              } ${plan.id === 'professional' ? 'ring-1 ring-fire-red/30' : ''}`}
            >
              {plan.id === 'professional' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-fire-red text-white px-3 py-1 rounded-full text-xs font-roboto-mono font-medium">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {isCurrentPlan(plan.id) && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-fire-red rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-inter-tight font-bold text-mission-text-primary mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-3xl font-inter-tight font-bold text-mission-text-primary">
                    {getPrice(plan)}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-mission-text-muted">{getPeriod(plan)}</span>
                  )}
                </div>
                {billingCycle === 'yearly' && getSavings(plan) && (
                  <p className="text-mission-accent-green text-xs font-roboto-mono font-medium">
                    {getSavings(plan)}
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="text-center p-3 bg-mission-bg-tertiary rounded">
                  <div className="text-sm font-inter-tight font-bold text-mission-text-primary">
                    {plan.limits.stations === Infinity ? 'Unlimited' : plan.limits.stations} Stations
                  </div>
                  <div className="text-sm font-inter-tight font-bold text-mission-text-primary">
                    {plan.limits.equipment === Infinity ? 'Unlimited' : plan.limits.equipment} Equipment Items
                  </div>
                  <div className="text-sm font-inter-tight font-bold text-mission-text-primary">
                    {plan.limits.users === Infinity ? 'Unlimited' : plan.limits.users} Users
                  </div>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-2">
                      <SafeIcon icon={FiCheck} className="w-4 h-4 text-mission-accent-green flex-shrink-0" />
                      <span className="text-sm text-mission-text-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                {isCurrentPlan(plan.id) ? (
                  <div className="text-center py-2 text-mission-accent-green font-roboto-mono text-xs">
                    CURRENT PLAN
                  </div>
                ) : canUpgrade(plan.id) ? (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading}
                    className="w-full bg-fire-red hover:bg-fire-red-dark disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors font-inter font-medium flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" showText={false} />
                    ) : (
                      <>
                        <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
                        <span>Upgrade</span>
                      </>
                    )}
                  </button>
                ) : canDowngrade(plan.id) ? (
                  <button
                    onClick={() => handleManageBilling()}
                    className="w-full border border-mission-border hover:bg-mission-bg-primary text-mission-text-primary px-4 py-2 rounded-lg transition-colors font-inter font-medium"
                  >
                    Downgrade
                  </button>
                ) : (
                  <div className="text-center py-2 text-mission-text-muted font-roboto-mono text-xs">
                    CONTACT SUPPORT
                  </div>
                )}

                {plan.id === 'free' && !isCurrentPlan(plan.id) && (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    className="w-full border border-mission-border hover:bg-mission-bg-primary text-mission-text-primary px-4 py-2 rounded-lg transition-colors font-inter font-medium"
                  >
                    Switch to Free
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Security Notice */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiCreditCard} className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-medium mb-1">Secure Payment Processing</h4>
              <p className="text-blue-300 text-sm">
                All payments are processed securely by Stripe. We never store your payment information. 
                You can cancel or change your subscription at any time through the billing portal.
              </p>
            </div>
          </div>
        </div>

        {/* Usage Information */}
        {department?.plan !== 'free' && (
          <div className="bg-mission-bg-tertiary rounded-lg p-4">
            <h4 className="text-base font-inter-tight font-medium text-mission-text-primary mb-3">
              Current Usage
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-roboto-mono font-bold text-mission-text-primary">
                  {/* This would come from actual usage data */}
                  1
                </div>
                <div className="text-xs text-mission-text-muted">Stations</div>
              </div>
              <div>
                <div className="text-lg font-roboto-mono font-bold text-mission-text-primary">
                  {/* This would come from actual usage data */}
                  0
                </div>
                <div className="text-xs text-mission-text-muted">Equipment</div>
              </div>
              <div>
                <div className="text-lg font-roboto-mono font-bold text-mission-text-primary">
                  1
                </div>
                <div className="text-xs text-mission-text-muted">Users</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-mission-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-mission-text-muted hover:text-mission-text-primary transition-colors"
          >
            Close
          </button>
          
          {department?.plan !== 'free' && (
            <button
              onClick={handleManageBilling}
              disabled={loading}
              className="flex items-center space-x-2 bg-mission-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiCreditCard} className="w-4 h-4" />
              <span>Manage Billing</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default SubscriptionManager