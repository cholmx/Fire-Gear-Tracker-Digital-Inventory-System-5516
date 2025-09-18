import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ValidationService } from '../lib/validation'
import { stripeService, STRIPE_PLANS } from '../lib/stripe'
import SafeIcon from '../common/SafeIcon'
import LoadingSpinner from '../components/LoadingSpinner'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiBuilding, FiArrowLeft, FiCheck, FiCreditCard, FiGift, FiAlertTriangle } = FiIcons

const SignUp = () => {
  const { signUp, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedPlan = searchParams.get('plan') || 'free'

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Department info
    departmentName: '',
    adminFirstName: '',
    adminLastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Plan selection
    selectedPlan: preselectedPlan,
    billingCycle: 'monthly',
    // Agreement
    agreedToTerms: false,
    agreedToPrivacy: false
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationInProgress, setValidationInProgress] = useState(false)

  const plans = Object.values(STRIPE_PLANS)

  const getPrice = (plan) => {
    return stripeService.formatPrice(
      formData.billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
    )
  }

  const getPeriod = (plan) => {
    if (plan.monthlyPrice === 0) return ''
    return formData.billingCycle === 'monthly' ? '/month' : '/year'
  }

  const getSavings = (plan) => {
    const savings = stripeService.calculateYearlySavings(plan)
    return savings > 0 ? `Save ${stripeService.formatPrice(savings)}/year` : ''
  }

  const validateStep1 = async () => {
    const stepErrors = {}

    if (!formData.departmentName.trim()) {
      stepErrors.departmentName = 'Department name is required'
    } else if (formData.departmentName.trim().length < 2) {
      stepErrors.departmentName = 'Department name must be at least 2 characters'
    }

    if (!formData.adminFirstName.trim()) {
      stepErrors.adminFirstName = 'First name is required'
    }

    if (!formData.adminLastName.trim()) {
      stepErrors.adminLastName = 'Last name is required'
    }

    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const validateStep2 = () => {
    const stepErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      stepErrors.email = 'Email is required'
    } else if (!ValidationService.isValidEmail(formData.email)) {
      stepErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    const passwordErrors = ValidationService.validatePassword(formData.password)
    if (passwordErrors.length > 0) {
      stepErrors.password = passwordErrors[0]
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      stepErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const validateStep3 = () => {
    const stepErrors = {}

    // Terms agreement
    if (!formData.agreedToTerms) {
      stepErrors.agreedToTerms = 'You must agree to the Terms of Service'
    }

    if (!formData.agreedToPrivacy) {
      stepErrors.agreedToPrivacy = 'You must agree to the Privacy Policy'
    }

    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const handleNext = async () => {
    if (step === 1) {
      if (await validateStep1()) {
        setStep(2)
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3)
      }
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    } else if (step === 3) {
      setStep(2)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep3()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      console.log('🚀 Starting atomic signup process...')
      
      // Create account using the atomic signup process
      const result = await signUp(formData.email, formData.password, {
        name: formData.departmentName,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        selectedPlan: formData.selectedPlan,
        billingCycle: formData.billingCycle
      })

      if (result.success) {
        console.log('✅ Account created successfully')
        
        // Handle payment flow based on selected plan
        if (formData.selectedPlan === 'free') {
          // Free plan - go directly to app
          navigate('/app')
        } else {
          // Paid plan - redirect to Stripe payment
          const selectedPlan = STRIPE_PLANS[formData.selectedPlan]
          
          if (selectedPlan) {
            const paymentLink = stripeService.getPaymentLink(formData.selectedPlan, formData.billingCycle)
            
            if (paymentLink) {
              // Store user info in sessionStorage for post-payment redirect
              sessionStorage.setItem('pendingUser', JSON.stringify({
                email: formData.email,
                plan: formData.selectedPlan,
                billingCycle: formData.billingCycle
              }))
              
              // Redirect to Stripe payment
              window.location.href = paymentLink
            } else {
              // Fallback to app if no payment link
              navigate('/app')
            }
          } else {
            navigate('/app')
          }
        }
      } else {
        console.error('❌ Signup failed:', result.error)
        setErrors({ submit: result.error?.message || 'Signup failed. Please try again.' })
      }
    } catch (error) {
      console.error('❌ Signup error:', error)
      setErrors({ submit: error.message || 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null })
    }
  }

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '' }

    let score = 0
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)
    ]

    score = checks.filter(Boolean).length

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['bg-red-600', 'bg-orange-600', 'bg-yellow-600', 'bg-blue-600', 'bg-green-600']

    return {
      strength: score,
      label: labels[score - 1] || '',
      color: colors[score - 1] || 'bg-gray-600',
      percentage: (score / 5) * 100
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Department Information'
      case 2: return 'Account Setup'
      case 3: return 'Choose Your Plan'
      default: return 'Sign Up'
    }
  }

  return (
    <div className="min-h-screen bg-mission-bg-primary font-inter flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-mission-bg-secondary border border-mission-border rounded-lg shadow-xl p-8">
          {/* Back button */}
          <button
            onClick={() => step === 1 ? navigate('/') : handleBack()}
            className="flex items-center space-x-2 text-mission-text-muted hover:text-mission-text-primary transition-colors mb-6 font-inter"
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
            <span>{step === 1 ? 'Back to home' : 'Back'}</span>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-fire-red rounded-lg mx-auto mb-4">
              <SafeIcon icon="ShieldCheck" className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-inter-tight font-bold text-mission-text-primary">
              Create Your Account
            </h1>
            <p className="text-mission-text-muted mt-2 font-inter">
              Step {step} of 3: {getStepTitle()}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-fire-red text-white' : 'bg-mission-bg-tertiary text-mission-text-muted'
              }`}>
                {step > 1 ? <SafeIcon icon={FiCheck} className="w-3 h-3" /> : '1'}
              </div>
              <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-fire-red' : 'bg-mission-bg-tertiary'}`} />
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? 'bg-fire-red text-white' : 'bg-mission-bg-tertiary text-mission-text-muted'
              }`}>
                {step > 2 ? <SafeIcon icon={FiCheck} className="w-3 h-3" /> : '2'}
              </div>
              <div className={`flex-1 h-1 rounded ${step >= 3 ? 'bg-fire-red' : 'bg-mission-bg-tertiary'}`} />
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? 'bg-fire-red text-white' : 'bg-mission-bg-tertiary text-mission-text-muted'
              }`}>
                3
              </div>
            </div>
          </div>

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext() }}>
            {step === 1 && (
              /* Step 1: Department Information */
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                    Department Name *
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiBuilding} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mission-text-muted" />
                    <input
                      type="text"
                      value={formData.departmentName}
                      onChange={(e) => handleInputChange('departmentName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-mission-bg-tertiary border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter ${
                        errors.departmentName ? 'border-red-500' : 'border-mission-border'
                      }`}
                      placeholder="e.g., Metro Fire Department"
                      required
                    />
                  </div>
                  {errors.departmentName && (
                    <p className="text-red-400 text-sm mt-1">{errors.departmentName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                      Admin First Name *
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mission-text-muted" />
                      <input
                        type="text"
                        value={formData.adminFirstName}
                        onChange={(e) => handleInputChange('adminFirstName', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-mission-bg-tertiary border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter ${
                          errors.adminFirstName ? 'border-red-500' : 'border-mission-border'
                        }`}
                        placeholder="First name"
                        required
                      />
                    </div>
                    {errors.adminFirstName && (
                      <p className="text-red-400 text-sm mt-1">{errors.adminFirstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                      Admin Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.adminLastName}
                      onChange={(e) => handleInputChange('adminLastName', e.target.value)}
                      className={`w-full px-4 py-3 bg-mission-bg-tertiary border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter ${
                        errors.adminLastName ? 'border-red-500' : 'border-mission-border'
                      }`}
                      placeholder="Last name"
                      required
                    />
                    {errors.adminLastName && (
                      <p className="text-red-400 text-sm mt-1">{errors.adminLastName}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={validationInProgress}
                  className="w-full bg-fire-red hover:bg-fire-red-dark disabled:opacity-50 text-white font-inter font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {validationInProgress ? (
                    <>
                      <LoadingSpinner size="sm" showText={false} />
                      <span className="ml-2">Validating...</span>
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            )}

            {step === 2 && (
              /* Step 2: Account Setup */
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mission-text-muted" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-mission-bg-tertiary border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter ${
                        errors.email ? 'border-red-500' : 'border-mission-border'
                      }`}
                      placeholder="your.email@department.gov"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mission-text-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 bg-mission-bg-tertiary border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter ${
                        errors.password ? 'border-red-500' : 'border-mission-border'
                      }`}
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mission-text-muted hover:text-mission-text-secondary"
                    >
                      <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-mission-text-muted">Password strength</span>
                        <span className={`font-medium ${
                          passwordStrength.strength >= 4 ? 'text-green-400' :
                          passwordStrength.strength >= 3 ? 'text-blue-400' :
                          passwordStrength.strength >= 2 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-mission-bg-primary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mission-text-muted" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 bg-mission-bg-tertiary border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter ${
                        errors.confirmPassword ? 'border-red-500' : 'border-mission-border'
                      }`}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mission-text-muted hover:text-mission-text-secondary"
                    >
                      <SafeIcon icon={showConfirmPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-fire-red hover:bg-fire-red-dark text-white font-inter font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 3 && (
              /* Step 3: Plan Selection */
              <div className="space-y-6">
                {/* Billing Toggle */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <span className={`font-roboto-mono text-xs ${
                    formData.billingCycle === 'monthly' ? 'text-mission-text-primary' : 'text-mission-text-muted'
                  }`}>
                    MONTHLY
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('billingCycle', formData.billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.billingCycle === 'yearly' ? 'bg-fire-red' : 'bg-mission-border'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className={`font-roboto-mono text-xs ${
                    formData.billingCycle === 'yearly' ? 'text-mission-text-primary' : 'text-mission-text-muted'
                  }`}>
                    YEARLY
                  </span>
                  <span className="text-mission-accent-green text-xs font-roboto-mono font-medium">SAVE UP TO 17%</span>
                </div>

                {/* Plan Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handleInputChange('selectedPlan', plan.id)}
                      className={`relative p-6 border rounded-lg transition-all text-left ${
                        formData.selectedPlan === plan.id 
                          ? 'border-fire-red ring-2 ring-fire-red/20 bg-fire-red/5' 
                          : 'border-mission-border hover:border-mission-border-light'
                      } ${plan.popular ? 'ring-1 ring-fire-red/30' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-fire-red text-white px-3 py-1 rounded-full text-xs font-roboto-mono font-medium">
                            MOST POPULAR
                          </span>
                        </div>
                      )}

                      {formData.selectedPlan === plan.id && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-fire-red rounded-full flex items-center justify-center">
                            <SafeIcon icon={FiCheck} className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <h3 className="text-lg font-inter-tight font-bold text-mission-text-primary mb-2">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-mission-text-muted mb-3">{plan.description}</p>
                        <div className="mb-2">
                          <span className="text-2xl font-inter-tight font-bold text-mission-text-primary">
                            {getPrice(plan)}
                          </span>
                          {plan.monthlyPrice > 0 && (
                            <span className="text-sm text-mission-text-muted">{getPeriod(plan)}</span>
                          )}
                        </div>
                        {formData.billingCycle === 'yearly' && getSavings(plan) && (
                          <p className="text-mission-accent-green text-xs font-roboto-mono font-medium">
                            {getSavings(plan)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="text-center p-3 bg-mission-bg-tertiary rounded">
                          <div className="text-sm font-inter-tight font-bold text-mission-text-primary">
                            {plan.limits.stations === Infinity ? 'Unlimited' : plan.limits.stations} Stations
                          </div>
                          <div className="text-sm font-inter-tight font-bold text-mission-text-primary">
                            {plan.limits.equipment === Infinity ? 'Unlimited' : plan.limits.equipment} Equipment
                          </div>
                          <div className="text-sm font-inter-tight font-bold text-mission-text-primary">
                            {plan.limits.users === Infinity ? 'Unlimited' : plan.limits.users} Users
                          </div>
                        </div>

                        <ul className="space-y-1">
                          {plan.features.slice(0, 3).map((feature, i) => (
                            <li key={i} className="flex items-center space-x-2">
                              <SafeIcon icon={FiCheck} className="w-3 h-3 text-mission-accent-green flex-shrink-0" />
                              <span className="text-xs text-mission-text-muted">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {plan.id === 'free' && (
                        <div className="flex items-center space-x-1 text-mission-accent-green">
                          <SafeIcon icon={FiGift} className="w-4 h-4" />
                          <span className="text-xs font-roboto-mono font-medium">FREE FOREVER</span>
                        </div>
                      )}

                      {plan.id !== 'free' && (
                        <div className="flex items-center space-x-1 text-mission-accent-blue">
                          <SafeIcon icon={FiCreditCard} className="w-4 h-4" />
                          <span className="text-xs font-roboto-mono font-medium">CANCEL ANYTIME</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Terms and Privacy */}
                <div className="space-y-3 pt-4 border-t border-mission-border">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.agreedToTerms}
                      onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                      className="mt-1 rounded border-mission-border text-fire-red focus:ring-fire-red focus:ring-offset-mission-bg-secondary"
                    />
                    <span className="text-sm text-mission-text-secondary">
                      I agree to the{' '}
                      <Link to="/terms" className="text-fire-red hover:text-fire-red-light underline">
                        Terms of Service
                      </Link>
                    </span>
                  </label>
                  {errors.agreedToTerms && (
                    <p className="text-red-400 text-sm">{errors.agreedToTerms}</p>
                  )}

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.agreedToPrivacy}
                      onChange={(e) => handleInputChange('agreedToPrivacy', e.target.checked)}
                      className="mt-1 rounded border-mission-border text-fire-red focus:ring-fire-red focus:ring-offset-mission-bg-secondary"
                    />
                    <span className="text-sm text-mission-text-secondary">
                      I agree to the{' '}
                      <Link to="/privacy" className="text-fire-red hover:text-fire-red-light underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreedToPrivacy && (
                    <p className="text-red-400 text-sm">{errors.agreedToPrivacy}</p>
                  )}
                </div>

                {errors.submit && (
                  <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3 font-inter">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <SafeIcon icon={FiAlertTriangle} className="w-4 h-4" />
                      <span className="font-medium">Signup Failed</span>
                    </div>
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-fire-red hover:bg-fire-red-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-inter font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" showText={false} />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>
                      {formData.selectedPlan === 'free' ? 'Create Free Account' : 'Continue to Payment'}
                    </span>
                  )}
                </button>

                <div className="text-center text-xs text-mission-text-muted">
                  {formData.selectedPlan === 'free'
                    ? 'Start using Fire Gear Tracker immediately with no payment required'
                    : 'You will be redirected to secure payment processing'
                  }
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-mission-text-muted text-sm font-inter">
              Already have an account?{' '}
              <Link to="/login" className="text-fire-red hover:text-fire-red-light font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp