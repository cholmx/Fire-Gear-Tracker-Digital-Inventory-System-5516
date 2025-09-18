import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SafeIcon from '../common/SafeIcon'
import LoadingSpinner from './LoadingSpinner'
import * as FiIcons from 'react-icons/fi'

const { FiCheck, FiCreditCard, FiArrowRight } = FiIcons

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, department } = useAuth()
  const [processing, setProcessing] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const paymentStatus = searchParams.get('payment')
    
    if (paymentStatus === 'success' || sessionId) {
      handlePaymentSuccess(sessionId)
    } else {
      setProcessing(false)
    }
  }, [searchParams])

  const handlePaymentSuccess = async (sessionId) => {
    try {
      // Get upgrade context from session storage
      const upgradeContext = sessionStorage.getItem('upgradeContext')
      const pendingUser = sessionStorage.getItem('pendingUser')
      
      if (upgradeContext) {
        const context = JSON.parse(upgradeContext)
        console.log('Processing upgrade:', context)
        
        // In a real app, you would verify the payment with your backend
        // and update the user's subscription status
        
        // Clear the context
        sessionStorage.removeItem('upgradeContext')
        
        // Show success and redirect
        setTimeout(() => {
          navigate('/app/settings?tab=subscription&upgraded=true')
        }, 3000)
      } else if (pendingUser) {
        const userData = JSON.parse(pendingUser)
        console.log('Processing new user payment:', userData)
        
        // Clear the pending user data
        sessionStorage.removeItem('pendingUser')
        
        // Redirect to app
        setTimeout(() => {
          navigate('/app')
        }, 3000)
      } else {
        // Generic success
        setTimeout(() => {
          navigate('/app')
        }, 3000)
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      setError('Failed to process payment. Please contact support.')
    } finally {
      setProcessing(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mission-bg-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-mission-bg-secondary border border-red-800 rounded-lg p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-600 rounded-lg mx-auto mb-6">
            <SafeIcon icon={FiX} className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-inter-tight font-bold text-red-400 mb-4">
            Payment Error
          </h2>
          <p className="text-red-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/app/settings')}
            className="bg-fire-red hover:bg-fire-red-dark text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to Settings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mission-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-mission-bg-secondary border border-mission-border rounded-lg p-8 text-center">
        {processing ? (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-mission-accent-blue rounded-lg mx-auto mb-6">
              <LoadingSpinner size="md" showText={false} />
            </div>
            <h2 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-4">
              Processing Payment
            </h2>
            <p className="text-mission-text-secondary mb-6">
              Please wait while we confirm your payment and update your account...
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-lg mx-auto mb-6">
              <SafeIcon icon={FiCheck} className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-4">
              Payment Successful!
            </h2>
            <p className="text-mission-text-secondary mb-6">
              Your subscription has been activated. You now have access to all features of your plan.
            </p>
            <div className="flex items-center justify-center space-x-2 text-mission-accent-green mb-6">
              <SafeIcon icon={FiCreditCard} className="w-4 h-4" />
              <span className="text-sm font-roboto-mono">SUBSCRIPTION ACTIVE</span>
            </div>
            <button
              onClick={() => navigate('/app')}
              className="flex items-center justify-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-6 py-3 rounded-lg transition-colors w-full"
            >
              <span>Continue to Dashboard</span>
              <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentSuccess