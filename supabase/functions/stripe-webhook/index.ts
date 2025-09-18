import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface WebhookPayload {
  type: string
  data: {
    object: any
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured')
    }

    // In a real implementation, you would verify the webhook signature here
    // For now, we'll parse the payload directly
    const payload: WebhookPayload = JSON.parse(body)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different webhook events
    switch (payload.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, payload.data.object)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, payload.data.object)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, payload.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, payload.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabase, payload.data.object)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, payload.data.object)
        break
        
      default:
        console.log(`Unhandled webhook event: ${payload.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handleCheckoutCompleted(supabase: any, session: any) {
  console.log('Checkout completed:', session.id)
  
  const customerId = session.customer
  const subscriptionId = session.subscription
  const customerEmail = session.customer_details?.email
  
  if (!customerEmail) {
    throw new Error('No customer email found in checkout session')
  }

  // Update department with Stripe customer info
  const { error } = await supabase
    .from('departments')
    .update({
      customer_id: customerId,
      subscription_id: subscriptionId,
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('admin_email', customerEmail)

  if (error) {
    console.error('Error updating department:', error)
    throw error
  }

  console.log('Department updated with subscription info')
}

async function handleSubscriptionCreated(supabase: any, subscription: any) {
  console.log('Subscription created:', subscription.id)
  
  const customerId = subscription.customer
  const planId = getPlanFromPriceId(subscription.items.data[0]?.price?.id)
  
  // Update department plan
  const { error } = await supabase
    .from('departments')
    .update({
      plan: planId,
      subscription_status: 'active',
      subscription_id: subscription.id,
      updated_at: new Date().toISOString()
    })
    .eq('customer_id', customerId)

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: any) {
  console.log('Subscription updated:', subscription.id)
  
  const customerId = subscription.customer
  const planId = getPlanFromPriceId(subscription.items.data[0]?.price?.id)
  const status = subscription.status === 'active' ? 'active' : 
                subscription.status === 'past_due' ? 'past_due' : 'cancelled'
  
  // Update department
  const { error } = await supabase
    .from('departments')
    .update({
      plan: planId,
      subscription_status: status,
      updated_at: new Date().toISOString()
    })
    .eq('customer_id', customerId)

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  console.log('Subscription deleted:', subscription.id)
  
  const customerId = subscription.customer
  
  // Downgrade to free plan
  const { error } = await supabase
    .from('departments')
    .update({
      plan: 'free',
      subscription_status: 'cancelled',
      subscription_id: null,
      updated_at: new Date().toISOString()
    })
    .eq('customer_id', customerId)

  if (error) {
    console.error('Error handling subscription deletion:', error)
    throw error
  }
}

async function handlePaymentSucceeded(supabase: any, invoice: any) {
  console.log('Payment succeeded:', invoice.id)
  
  const customerId = invoice.customer
  
  // Ensure subscription is active
  const { error } = await supabase
    .from('departments')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('customer_id', customerId)

  if (error) {
    console.error('Error updating payment status:', error)
    throw error
  }
}

async function handlePaymentFailed(supabase: any, invoice: any) {
  console.log('Payment failed:', invoice.id)
  
  const customerId = invoice.customer
  
  // Mark subscription as past due
  const { error } = await supabase
    .from('departments')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('customer_id', customerId)

  if (error) {
    console.error('Error updating payment failure:', error)
    throw error
  }
}

function getPlanFromPriceId(priceId: string): string {
  // Map Stripe price IDs to plan names
  const priceIdMap: Record<string, string> = {
    'price_professional_monthly': 'professional',
    'price_professional_yearly': 'professional',
    'price_unlimited_monthly': 'unlimited',
    'price_unlimited_yearly': 'unlimited'
  }
  
  return priceIdMap[priceId] || 'free'
}