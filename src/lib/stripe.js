import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export { stripePromise }

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  currency: 'usd',
  country: 'US'
}

// Plan configurations with Stripe price IDs
export const STRIPE_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    stripePriceIds: {
      monthly: null,
      yearly: null
    },
    features: [
      'Equipment tracking & inventory',
      'Inspection scheduling', 
      'Equipment history',
      'Cloud storage & sync',
      'NFPA compliance templates'
    ],
    limits: {
      stations: 1,
      equipment: 50,
      users: 3
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 14,
    yearlyPrice: 140,
    stripePriceIds: {
      monthly: 'price_professional_monthly',
      yearly: 'price_professional_yearly'
    },
    paymentLinks: {
      monthly: 'https://buy.stripe.com/bJecN71MXc5r0NXeqecbC03',
      yearly: 'https://buy.stripe.com/00waEZezJb1n8gp0zocbC06'
    },
    features: [
      'Everything in Free plan',
      'Multi-station management',
      'Advanced reporting',
      'Real-time sync',
      'Email support'
    ],
    limits: {
      stations: 3,
      equipment: 300,
      users: 10
    }
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    monthlyPrice: 28,
    yearlyPrice: 280,
    stripePriceIds: {
      monthly: 'price_unlimited_monthly',
      yearly: 'price_unlimited_yearly'
    },
    paymentLinks: {
      monthly: 'https://buy.stripe.com/3cI7sNcrBc5rgMV2HwcbC05',
      yearly: 'https://buy.stripe.com/3cIfZjfDNfhDcwFdmacbC04'
    },
    features: [
      'Everything in Professional plan',
      'Unlimited stations & equipment',
      'Advanced analytics',
      'Priority support'
    ],
    limits: {
      stations: Infinity,
      equipment: Infinity,
      users: Infinity
    }
  }
}

// Stripe service class
export class StripeService {
  constructor() {
    this.stripe = null
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return this.stripe
    
    try {
      this.stripe = await stripePromise
      this.initialized = true
      return this.stripe
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
      throw new Error('Payment system unavailable')
    }
  }

  async createCheckoutSession(priceId, customerId = null, metadata = {}) {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerId,
          metadata,
          successUrl: `${window.location.origin}/app?payment=success`,
          cancelUrl: `${window.location.origin}/signup?payment=cancelled`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      const stripe = await this.initialize()
      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      throw error
    }
  }

  async createPortalSession(customerId) {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: `${window.location.origin}/app/settings`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Portal error:', error)
      throw error
    }
  }

  // Get plan by ID
  getPlan(planId) {
    return STRIPE_PLANS[planId] || null
  }

  // Get all plans
  getAllPlans() {
    return Object.values(STRIPE_PLANS)
  }

  // Calculate savings for yearly billing
  calculateYearlySavings(plan) {
    if (plan.monthlyPrice === 0) return 0
    const monthlyCost = plan.monthlyPrice * 12
    return monthlyCost - plan.yearlyPrice
  }

  // Format price for display
  formatPrice(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Check if plan requires payment
  requiresPayment(planId) {
    const plan = this.getPlan(planId)
    return plan && plan.monthlyPrice > 0
  }

  // Get payment link for plan
  getPaymentLink(planId, billingCycle = 'monthly') {
    const plan = this.getPlan(planId)
    return plan?.paymentLinks?.[billingCycle] || null
  }
}

export const stripeService = new StripeService()
export default stripeService