import React,{useState} from 'react'
import {Link,useNavigate} from 'react-router-dom'
import {motion} from 'framer-motion'
import {stripeService,STRIPE_PLANS} from '../lib/stripe'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi' 

const {FiCheck,FiArrowRight,FiStar,FiUsers,FiMenu,FiX,FiPackage,FiCalendar,FiMapPin,FiAlertTriangle,FiZap,FiDatabase,FiClock}=FiIcons 

const LandingPage=()=> {
  const navigate=useNavigate() 
  const [mobileMenuOpen,setMobileMenuOpen]=useState(false) 
  const [billingCycle,setBillingCycle]=useState('monthly') // 'monthly' or 'yearly' 

  const features=[ 
    {icon: FiPackage,title: 'Equipment Inventory Management',description: 'Complete digital inventory system with serial numbers,manufacturer details,and status tracking. Organize equipment by categories and stations.',benefits: ['Digital serial number tracking','Equipment history logs','Status management','Category organization']},
    {icon: FiCalendar,title: 'Inspection Scheduling',description: 'Schedule inspections for individual equipment or entire categories. Track due dates and completion status with built-in NFPA templates.',benefits: ['Individual & category inspections','NFPA compliance templates','Due date tracking','Inspection history']},
    {icon: FiMapPin,title: 'Multi-Station Management',description: 'Manage equipment across multiple fire stations with centralized oversight and station-specific views.',benefits: ['Multiple station support','Station-specific filtering','Centralized dashboard','Equipment location tracking']},
    {icon: FiAlertTriangle,title: 'Status Tracking',description: 'Track equipment status from in-service to out-of-service,repairs,and training use with detailed notes and history.',benefits: ['Multiple status options','Status change history','Required documentation','Equipment lifecycle tracking']},
    {icon: FiClock,title: 'Equipment History',description: 'Comprehensive audit trail of all equipment changes,status updates,and maintenance activities with timestamps.',benefits: ['Complete change history','User activity tracking','Detailed audit trail','Historical reporting']},
    {icon: FiDatabase,title: 'Cloud Database & Sync',description: 'All plans include secure cloud storage with PostgreSQL database,real-time sync across devices,and automatic backups.',benefits: ['Cloud-based storage','Real-time synchronization','Automatic backups','Multi-device access']} 
  ] 

  const testimonials=[ 
    {name: 'Fire Chief Johnson',department: 'Metro Fire Department',location: 'Sample City,State',content: 'Fire Gear Tracker has streamlined our equipment management process. The inspection scheduling helps us stay compliant and the equipment history is invaluable.',rating: 5,equipment: '250+ items tracked',savings: 'Improved organization'},
    {name: 'Captain Rodriguez',department: 'Valley Fire District',location: 'Sample Valley,State',content: 'Finally,a system that makes sense for fire departments. Easy to use and the equipment status tracking keeps us organized across all our stations.',rating: 5,equipment: '180+ items tracked',savings: 'Better compliance tracking'},
    {name: 'Lieutenant Williams',department: 'Riverside Fire Dept',location: 'Sample City,State',content: 'The digital inventory system is exactly what we needed. No more lost paperwork and we can access our equipment data from anywhere.',rating: 5,equipment: '320+ items tracked',savings: 'Paperless operations'} 
  ] 

  const plans = Object.values(STRIPE_PLANS).map(plan => ({
    ...plan,
    description: plan.id === 'free' ? 'Perfect for small departments getting started' :
                plan.id === 'professional' ? 'Ideal for growing departments' :
                'For large departments and districts',
    popular: plan.id === 'professional',
    cta: 'Get Started'
  }))

  // Filter plans based on billing cycle - show all plans but adjust pricing 
  const getPrice=(plan)=> {
    return stripeService.formatPrice(
      billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
    )
  } 

  const getPeriod=(plan)=> {
    if (plan.monthlyPrice===0) return '' 
    return billingCycle==='monthly' ? '/month' : '/year'
  } 

  const getSavings=(plan)=> {
    const savings = stripeService.calculateYearlySavings(plan)
    return savings > 0 ? `Save ${stripeService.formatPrice(savings)}/year` : ''
  } 

  const handlePlanClick=(plan)=> {
    // Use navigate instead of window.location.href for HashRouter 
    const signupPath=`/signup?plan=${plan.id}` 
    if (billingCycle==='yearly' && plan.id !=='free') {
      navigate(`${signupPath}&billing=yearly`)
    } else {
      navigate(signupPath)
    }
  } 

  const handleGetStarted=()=> {
    navigate('/signup')
  } 

  const scrollToPricing=()=> {
    const pricingSection=document.getElementById('pricing-section') 
    if (pricingSection) {
      pricingSection.scrollIntoView({behavior: 'smooth'})
    }
  } 

  return ( 
    <div className="min-h-screen bg-mission-bg-primary text-mission-text-primary font-inter mission-grid"> 
      {/* Navigation */} 
      <nav className="fixed top-0 w-full bg-mission-bg-primary/95 backdrop-blur-sm border-b border-mission-border z-50"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
          <div className="flex justify-between items-center h-16"> 
            <div className="flex items-center space-x-3"> 
              <div className="flex items-center justify-center w-10 h-10 bg-fire-red rounded-lg mission-glow-red"> 
                <SafeIcon icon="ShieldCheck" className="w-6 h-6 text-white" /> 
              </div> 
              <span className="text-xl font-inter-tight font-bold text-mission-text-primary">Fire Gear Tracker</span> 
            </div> 

            {/* Desktop Navigation */} 
            <div className="hidden md:flex items-center space-x-4"> 
              <Link to="/login" className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors" > 
                <span>SIGN IN</span> 
              </Link> 
              <button onClick={handleGetStarted} className="flex items-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors" > 
                <span>GET STARTED</span> 
              </button> 
            </div> 

            {/* Mobile menu button */} 
            <button onClick={()=> setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-mission-bg-tertiary transition-colors" > 
              <SafeIcon icon={mobileMenuOpen ? FiX : FiMenu} className="w-6 h-6 text-mission-text-primary" /> 
            </button> 
          </div> 

          {/* Mobile Navigation */} 
          {mobileMenuOpen && ( 
            <motion.div initial={{opacity: 0,y: -20}} animate={{opacity: 1,y: 0}} exit={{opacity: 0,y: -20}} className="md:hidden py-4 space-y-4 border-t border-mission-border" > 
              <div className="px-4 space-y-3"> 
                <Link to="/login" className="flex items-center justify-center space-x-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors w-full" > 
                  <span>SIGN IN</span> 
                </Link> 
                <button onClick={handleGetStarted} className="flex items-center justify-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors w-full" > 
                  <span>GET STARTED</span> 
                </button> 
              </div> 
            </motion.div> 
          )} 
        </div> 
      </nav> 

      {/* Hero Section with Background Image */} 
      <section className="relative min-h-screen flex items-center justify-center"> 
        {/* Background Image - Your firefighter image */} 
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(https://www.dropbox.com/scl/fi/0f28s61p14kc7keewisnw/0_1-1.png?rlkey=0f9niuk8fv5nj8n8alw89fcdz&st=wq45p7nb&raw=1)'}} /> 
        {/* 50% Dark Overlay */} 
        <div className="absolute inset-0 bg-black/50" /> 

        {/* Hero Content */} 
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20"> 
          <div className="text-center lg:text-left lg:max-w-2xl"> 
            <motion.h1 initial={{opacity: 0,y: 20}} animate={{opacity: 1,y: 0}} className="text-4xl md:text-6xl lg:text-7xl font-inter-tight font-bold mb-6 text-white leading-tight drop-shadow-2xl" > 
              Fire Department Equipment <br /> 
              <span className="text-fire-red drop-shadow-2xl">Inventory Made Simple</span> 
            </motion.h1> 

            <motion.p initial={{opacity: 0,y: 20}} animate={{opacity: 1,y: 0}} transition={{delay: 0.1}} className="text-xl md:text-2xl font-inter text-white mb-8 max-w-2xl leading-relaxed drop-shadow-xl" > 
              Replace paper logs and spreadsheets with a professional digital inventory system. Track equipment,schedule inspections,and manage your gear across multiple stations. 
            </motion.p> 

            <motion.div initial={{opacity: 0,y: 20}} animate={{opacity: 1,y: 0}} transition={{delay: 0.2}} className="flex flex-col sm:flex-row justify-center lg:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8" > 
              <button onClick={handleGetStarted} className="flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-6 py-3 rounded-lg text-base font-roboto-mono font-medium transition-colors shadow-2xl" > 
                <span>GET STARTED FREE</span> 
                <SafeIcon icon={FiArrowRight} className="w-4 h-4" /> 
              </button> 
              <button onClick={scrollToPricing} className="flex items-center space-x-2 border-2 border-white/90 hover:border-white hover:bg-white/10 text-white px-6 py-3 rounded-lg text-base font-roboto-mono font-medium transition-all backdrop-blur-sm shadow-xl" > 
                <span>VIEW PLANS</span> 
                <SafeIcon icon={FiArrowRight} className="w-4 h-4" /> 
              </button> 
            </motion.div> 

            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.3}} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-6 text-sm font-roboto-mono text-white drop-shadow-lg" > 
              <span className="flex items-center space-x-1"> 
                <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" /> 
                <span>FREE PLAN AVAILABLE</span> 
              </span> 
              <span className="flex items-center space-x-1"> 
                <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" /> 
                <span>NO CREDIT CARD REQUIRED</span> 
              </span> 
              <span className="flex items-center space-x-1"> 
                <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" /> 
                <span>UPGRADE ANYTIME</span> 
              </span> 
            </motion.div> 
          </div> 
        </div> 
      </section> 

      {/* Features Section */} 
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-mission-bg-secondary/50"> 
        <div className="max-w-7xl mx-auto"> 
          <div className="text-center mb-16"> 
            <h2 className="text-3xl md:text-4xl font-inter-tight font-bold mb-4 text-mission-text-primary"> 
              Everything Your Department Needs 
            </h2> 
            <p className="text-xl font-inter text-mission-text-secondary max-w-3xl mx-auto"> 
              A complete equipment management system designed specifically for fire departments. 
            </p> 
          </div> 

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> 
            {features.map((feature,index)=> ( 
              <motion.div key={index} initial={{opacity: 0,y: 20}} whileInView={{opacity: 1,y: 0}} transition={{delay: index * 0.1}} viewport={{once: true}} className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6 hover:border-mission-border-light transition-colors" > 
                <div className="flex items-center justify-center w-12 h-12 bg-fire-red rounded-lg mb-4 mission-glow-red"> 
                  <SafeIcon icon={feature.icon} className="w-6 h-6 text-white" /> 
                </div> 
                <h3 className="text-xl font-inter-tight font-semibold mb-3 text-mission-text-primary"> 
                  {feature.title} 
                </h3> 
                <p className="font-inter text-mission-text-secondary mb-4"> 
                  {feature.description} 
                </p> 
                <ul className="space-y-2"> 
                  {feature.benefits.map((benefit,i)=> ( 
                    <li key={i} className="flex items-center space-x-2"> 
                      <SafeIcon icon={FiCheck} className="w-4 h-4 text-mission-accent-green flex-shrink-0" /> 
                      <span className="text-sm font-inter text-mission-text-muted">{benefit}</span> 
                    </li> 
                  ))} 
                </ul> 
              </motion.div> 
            ))} 
          </div> 
        </div> 
      </section> 

      {/* Problem/Solution Section - NEW TWO CARD LAYOUT */} 
      <section className="py-20 px-4 sm:px-6 lg:px-8"> 
        <div className="max-w-7xl mx-auto"> 
          <div className="text-center mb-16"> 
            <h2 className="text-3xl md:text-4xl font-inter-tight font-bold mb-4 text-mission-text-primary"> 
              Stop Losing Track of <span className="text-fire-red">Critical Equipment</span> 
            </h2> 
            <p className="text-xl font-inter text-mission-text-secondary max-w-3xl mx-auto"> 
              Transform your equipment management from chaos to control 
            </p> 
          </div> 

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> 
            {/* Without Fire Gear Tracker Card */} 
            <motion.div initial={{opacity: 0,x: -20}} whileInView={{opacity: 1,x: 0}} transition={{delay: 0.1}} viewport={{once: true}} className="bg-red-950/20 border border-red-800/30 rounded-lg p-8" > 
              <div className="flex items-center space-x-3 mb-6"> 
                <div className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-lg"> 
                  <SafeIcon icon={FiX} className="w-6 h-6 text-white" /> 
                </div> 
                <h3 className="text-2xl font-inter-tight font-bold text-red-400"> 
                  Without Fire Gear Tracker 
                </h3> 
              </div> 

              <div className="space-y-6"> 
                <div className="flex items-start space-x-4"> 
                  <SafeIcon icon={FiX} className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" /> 
                  <div> 
                    <h4 className="font-inter font-semibold text-red-300 mb-2">Paper logs get lost or damaged</h4> 
                    <p className="font-inter text-red-200 text-sm">Equipment records disappear when you need them most. Critical information lost forever.</p> 
                  </div> 
                </div> 

                <div className="flex items-start space-x-4"> 
                  <SafeIcon icon={FiX} className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" /> 
                  <div> 
                    <h4 className="font-inter font-semibold text-red-300 mb-2">Missed inspections</h4> 
                    <p className="font-inter text-red-200 text-sm">Manual tracking leads to forgotten maintenance schedules. Compliance violations and safety risks.</p> 
                  </div> 
                </div> 

                <div className="flex items-start space-x-4"> 
                  <SafeIcon icon={FiX} className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" /> 
                  <div> 
                    <h4 className="font-inter font-semibold text-red-300 mb-2">Spreadsheets break and data is lost</h4> 
                    <p className="font-inter text-red-200 text-sm">Years of equipment history gone in an instant. No backup,no recovery.</p> 
                  </div> 
                </div> 

                <div className="flex items-start space-x-4"> 
                  <SafeIcon icon={FiX} className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" /> 
                  <div> 
                    <h4 className="font-inter font-semibold text-red-300 mb-2">Wasted time searching for information</h4> 
                    <p className="font-inter text-red-200 text-sm">Hours spent hunting through filing cabinets and outdated systems during emergencies.</p> 
                  </div> 
                </div> 
              </div> 
            </motion.div> 

            {/* With Fire Gear Tracker Card */} 
            <motion.div initial={{opacity: 0,x: 20}} whileInView={{opacity: 1,x: 0}} transition={{delay: 0.2}} viewport={{once: true}} className="bg-green-950/20 border border-green-800/30 rounded-lg p-8 mission-glow-green" > 
              <div className="flex items-center space-x-3 mb-6"> 
                <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg"> 
                  <SafeIcon icon={FiCheck} className="w-6 h-6 text-white" /> 
                </div> 
                <h3 className="text-2xl font-inter-tight font-bold text-green-400"> 
                  With Fire Gear Tracker 
                </h3> 
              </div> 

              <div className="space-y-6"> 
                <div className="flex items-start space-x-4"> 
                  <SafeIcon icon={FiCheck} className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" /> 
                  <div> 
                    <h4 className="font-inter font-semibold text-green-300 mb-2">100% cloud-based,always accessible</h4> 
                    <p className="font-inter text-green-200 text-sm">Secure cloud database accessible from any device. Your data is always available when you need it.</p> 
                  </div> 
                </div> 

                <div className="flex items-start space-x-4"> 
                  <SafeIcon icon={FiCheck} className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" /> 
                  <div> 
                    <h4 className="font-inter font-semibold text-green-300 mb-2">Automated inspection tracking</h4> 
                    <p className="font-inter text-green-200 text-sm">Never miss another inspection with smart notifications. NFPA compliance made simple.</p> 
                  </div> 
                </div> 

                <div className="flex items-start space-x-4"> 
                  <SafeIcon icon={FiCheck} className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" /> 
                  <div> 
                    <h4 className="font-inter font-semibold text-green-300 mb-2">Automatic cloud backup</h4> 
                    <p className="font-inter text-green-200 text-sm">Your data is safe with enterprise-grade backups. Real-time sync across all devices.</p> 
                  </div> 
                </div> 

                <div className="flex items-start space-x-4"> 
                  <SafeIcon icon={FiCheck} className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" /> 
                  <div> 
                    <h4 className="font-inter font-semibold text-green-300 mb-2">Instant access to all information</h4> 
                    <p className="font-inter text-green-200 text-sm">Find any equipment record in seconds. Complete history and status at your fingertips.</p> 
                  </div> 
                </div> 
              </div> 
            </motion.div> 
          </div> 

          {/* Call to Action */} 
          <motion.div initial={{opacity: 0,y: 20}} whileInView={{opacity: 1,y: 0}} transition={{delay: 0.3}} viewport={{once: true}} className="text-center mt-12" > 
            <button onClick={handleGetStarted} className="inline-flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-8 py-4 rounded-lg text-lg font-roboto-mono font-medium transition-colors shadow-xl" > 
              <span>Start Your Free Account</span> 
              <SafeIcon icon={FiArrowRight} className="w-5 h-5" /> 
            </button> 
            <p className="text-sm font-roboto-mono text-mission-text-muted mt-3"> 
              No credit card required • Set up in under 5 minutes 
            </p> 
          </motion.div> 
        </div> 
      </section> 

      {/* Testimonials */} 
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-mission-bg-secondary/50"> 
        <div className="max-w-7xl mx-auto"> 
          <div className="text-center mb-16"> 
            <h2 className="text-3xl md:text-4xl font-inter-tight font-bold mb-4 text-mission-text-primary"> 
              Built for Fire Departments 
            </h2> 
            <p className="text-xl font-inter text-mission-text-secondary mb-8"> 
              See what fire departments are saying about Fire Gear Tracker 
            </p> 
          </div> 

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> 
            {testimonials.map((testimonial,index)=> ( 
              <motion.div key={index} initial={{opacity: 0,y: 20}} whileInView={{opacity: 1,y: 0}} transition={{delay: index * 0.1}} viewport={{once: true}} className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6" > 
                <div className="flex items-center mb-4"> 
                  {[...Array(testimonial.rating)].map((_,i)=> ( 
                    <SafeIcon key={i} icon={FiStar} className="w-5 h-5 text-yellow-400 fill-current" /> 
                  ))} 
                </div> 
                <p className="font-inter text-mission-text-secondary mb-6 italic">"{testimonial.content}"</p> 
                <div className="border-t border-mission-border pt-4"> 
                  <div className="font-inter font-medium text-mission-text-primary">{testimonial.name}</div> 
                  <div className="font-inter text-mission-text-muted text-sm">{testimonial.department}</div> 
                  <div className="font-roboto-mono text-mission-text-muted text-xs">{testimonial.location}</div> 
                  <div className="flex justify-between mt-2 text-xs"> 
                    <span className="text-mission-accent-blue font-roboto-mono">{testimonial.equipment}</span> 
                    <span className="text-mission-accent-green font-roboto-mono">{testimonial.savings}</span> 
                  </div> 
                </div> 
              </motion.div> 
            ))} 
          </div> 
        </div> 
      </section> 

      {/* Pricing */} 
      <section id="pricing-section" className="py-20 px-4 sm:px-6 lg:px-8"> 
        <div className="max-w-7xl mx-auto"> 
          <div className="text-center mb-16"> 
            <h2 className="text-3xl md:text-4xl font-inter-tight font-bold mb-4 text-mission-text-primary"> 
              Choose Your Plan 
            </h2> 
            <p className="text-xl font-inter text-mission-text-secondary mb-8"> 
              Professional equipment management for departments of all sizes 
            </p> 

            {/* Functionality Notice */} 
            <div className="bg-mission-bg-secondary/50 border border-mission-border rounded-lg p-4 mb-8 max-w-4xl mx-auto"> 
              <div className="flex items-center justify-center space-x-2 mb-2"> 
                <SafeIcon icon={FiDatabase} className="w-5 h-5 text-mission-accent-blue" /> 
                <span className="font-inter-tight font-semibold text-mission-text-primary">All Plans Include the Same Features</span> 
              </div> 
              <p className="text-sm font-inter text-mission-text-muted"> 
                Every plan includes the complete Fire Gear Tracker system with cloud storage,real-time sync,NFPA templates,inspection scheduling,equipment history,and all core features. The only difference is capacity limits. 
              </p> 
            </div> 

            {/* Billing Toggle */} 
            <div className="flex items-center justify-center space-x-4 mb-8"> 
              <span className={`font-roboto-mono text-xs ${billingCycle==='monthly' ? 'text-mission-text-primary' : 'text-mission-text-muted'}`}> 
                MONTHLY 
              </span> 
              <button onClick={()=> setBillingCycle(billingCycle==='monthly' ? 'yearly' : 'monthly')} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${billingCycle==='yearly' ? 'bg-fire-red' : 'bg-mission-border'}`} > 
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingCycle==='yearly' ? 'translate-x-6' : 'translate-x-1'}`} /> 
              </button> 
              <span className={`font-roboto-mono text-xs ${billingCycle==='yearly' ? 'text-mission-text-primary' : 'text-mission-text-muted'}`}> 
                YEARLY 
              </span> 
              <span className="text-mission-accent-green text-xs font-roboto-mono font-medium">SAVE UP TO 17%</span> 
            </div> 
          </div> 

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> 
            {plans.map((plan,index)=> ( 
              <motion.div key={index} initial={{opacity: 0,y: 20}} whileInView={{opacity: 1,y: 0}} transition={{delay: index * 0.1}} viewport={{once: true}} className={`relative bg-mission-bg-secondary border rounded-lg p-8 ${plan.popular ? 'border-fire-red ring-2 ring-fire-red/20 mission-glow-red' : 'border-mission-border hover:border-mission-border-light'} transition-colors`} > 
                {plan.popular && ( 
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2"> 
                    <span className="bg-fire-red text-white px-3 py-1 rounded-full text-xs font-roboto-mono font-medium"> 
                      MOST POPULAR 
                    </span> 
                  </div> 
                )} 

                <div className="text-center mb-8"> 
                  <h3 className="text-2xl font-inter-tight font-bold mb-2 text-mission-text-primary"> 
                    {plan.name} 
                  </h3> 
                  <p className="font-inter text-mission-text-muted mb-4">{plan.description}</p> 
                  <div className="mb-4"> 
                    <span className="text-4xl font-inter-tight font-bold text-mission-text-primary"> 
                      {getPrice(plan)} 
                    </span> 
                    {plan.monthlyPrice > 0 && ( 
                      <span className="font-roboto-mono text-mission-text-muted">{getPeriod(plan)}</span> 
                    )} 
                  </div> 
                  {billingCycle==='yearly' && getSavings(plan) && ( 
                    <p className="text-mission-accent-green text-xs font-roboto-mono font-medium">{getSavings(plan)}</p> 
                  )} 
                </div> 

                <div className="space-y-6 mb-8"> 
                  <div className="text-center p-4 bg-mission-bg-tertiary rounded-lg"> 
                    <div className="text-lg font-inter-tight font-bold text-mission-text-primary mb-1"> 
                      {plan.limits.stations === Infinity ? 'Unlimited' : plan.limits.stations} Stations
                    </div> 
                    <div className="text-lg font-inter-tight font-bold text-mission-text-primary"> 
                      {plan.limits.equipment === Infinity ? 'Unlimited' : plan.limits.equipment} Equipment
                    </div>
                    <div className="text-lg font-inter-tight font-bold text-mission-text-primary"> 
                      {plan.limits.users === Infinity ? 'Unlimited' : plan.limits.users} Users
                    </div> 
                  </div> 

                  <div> 
                    <h4 className="text-xs font-roboto-mono font-medium text-mission-text-secondary mb-3 uppercase"> 
                      {plan.monthlyPrice===0 ? 'Free plan includes:' : 'Everything in Free,plus:'} 
                    </h4> 
                    <ul className="space-y-2"> 
                      {plan.features.map((feature,i)=> ( 
                        <li key={i} className="flex items-center space-x-2"> 
                          <SafeIcon icon={FiCheck} className="w-4 h-4 text-mission-accent-green flex-shrink-0" /> 
                          <span className="text-sm font-inter text-mission-text-muted">{feature}</span> 
                        </li> 
                      ))} 
                    </ul> 
                  </div> 
                </div> 

                <button onClick={()=> handlePlanClick(plan)} className={`block w-full text-center px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors ${plan.popular ? 'bg-fire-red hover:bg-fire-red-dark text-white' : plan.monthlyPrice===0 ? 'bg-mission-bg-tertiary hover:bg-mission-border text-mission-text-primary' : 'bg-fire-red hover:bg-fire-red-dark text-white'}`} > 
                  {plan.cta.toUpperCase()} 
                </button> 
                {plan.monthlyPrice > 0 && ( 
                  <p className="text-xs text-mission-text-muted text-center mt-3 font-roboto-mono"> 
                    CANCEL ANYTIME 
                  </p> 
                )} 
              </motion.div> 
            ))} 
          </div> 

          <div className="text-center mt-12"> 
            <p className="font-roboto-mono text-mission-text-muted mb-4 text-xs"> 
              FREE PLAN AVAILABLE FOREVER • NO SETUP FEES 
            </p> 
            <p className="text-sm font-inter text-mission-text-muted"> 
              Need help choosing? <Link to="/contact-sales" className="text-fire-red hover:text-fire-red-light">Contact our team</Link> 
            </p> 
          </div> 
        </div> 
      </section> 

      {/* CTA Section */} 
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-fire-red"> 
        <div className="max-w-4xl mx-auto text-center"> 
          <h2 className="text-3xl md:text-4xl font-inter-tight font-bold mb-4 text-white"> 
            Ready to Organize Your Equipment? 
          </h2> 
          <p className="text-xl font-inter text-red-100 mb-8"> 
            Start with any plan today and bring your equipment management into the digital age. 
          </p> 
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6"> 
            <button onClick={handleGetStarted} className="inline-flex items-center space-x-1 bg-white hover:bg-gray-100 text-fire-red px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors" > 
              <span>GET STARTED</span> 
              <SafeIcon icon={FiArrowRight} className="w-3 h-3" /> 
            </button> 
            <button onClick={scrollToPricing} className="inline-flex items-center space-x-1 border-2 border-white hover:bg-white hover:text-fire-red text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors" > 
              <span>VIEW ALL PLANS</span> 
              <SafeIcon icon={FiArrowRight} className="w-3 h-3" /> 
            </button> 
          </div> 
          <p className="font-roboto-mono text-red-100 text-xs"> 
            FREE PLAN AVAILABLE • NO CREDIT CARD REQUIRED • UPGRADE OR DOWNGRADE ANYTIME 
          </p> 
        </div> 
      </section> 

      {/* Footer */} 
      <footer className="bg-mission-bg-primary border-t border-mission-border py-12 px-4 sm:px-6 lg:px-8"> 
        <div className="max-w-7xl mx-auto"> 
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8"> 
            <div className="col-span-1 md:col-span-2"> 
              <div className="flex items-center space-x-3 mb-4"> 
                <div className="flex items-center justify-center w-10 h-10 bg-fire-red rounded-lg mission-glow-red"> 
                  <SafeIcon icon="ShieldCheck" className="w-6 h-6 text-white" /> 
                </div> 
                <span className="text-xl font-inter-tight font-bold text-mission-text-primary">Fire Gear Tracker</span> 
              </div> 
              <p className="font-inter text-mission-text-muted mb-4 max-w-md"> 
                Digital equipment inventory system built specifically for fire departments. Keep track of your gear,schedule inspections,and maintain compliance. 
              </p> 
              <p className="font-roboto-mono text-mission-text-muted text-xs"> 
                © 2024 FIRE GEAR TRACKER. ALL RIGHTS RESERVED. 
              </p> 
            </div> 
            <div> 
              <h4 className="font-roboto-mono font-medium text-mission-text-primary mb-4 text-xs uppercase">Product</h4> 
              <ul className="space-y-2 font-inter text-mission-text-muted"> 
                <li><Link to="/login" className="hover:text-mission-text-primary transition-colors">Login</Link></li> 
                <li><Link to="/signup" className="hover:text-mission-text-primary transition-colors">Get Started</Link></li> 
                <li><button onClick={scrollToPricing} className="hover:text-mission-text-primary transition-colors text-left">Pricing</button></li> 
              </ul> 
            </div> 
            <div> 
              <h4 className="font-roboto-mono font-medium text-mission-text-primary mb-4 text-xs uppercase">Support</h4> 
              <ul className="space-y-2 font-inter text-mission-text-muted"> 
                <li><Link to="/documentation" className="hover:text-mission-text-primary transition-colors">Documentation</Link></li> 
                <li><Link to="/contact-sales" className="hover:text-mission-text-primary transition-colors">Contact Sales</Link></li> 
              </ul> 
            </div> 
          </div> 
        </div> 
      </footer> 
    </div> 
  ) 
} 

export default LandingPage