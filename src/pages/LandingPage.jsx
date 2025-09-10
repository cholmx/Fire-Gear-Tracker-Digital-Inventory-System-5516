import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {FiShield,FiCheck,FiArrowRight,FiStar,FiUsers,FiMenu,FiX,FiPackage,FiCalendar,FiMapPin,FiAlertTriangle,FiZap,FiDatabase,FiClock}=FiIcons;

const LandingPage=()=> {
  const [mobileMenuOpen,setMobileMenuOpen]=useState(false);
  const [billingCycle,setBillingCycle]=useState('monthly');// 'monthly' or 'yearly'

  const features=[
    {icon: FiPackage,title: 'Equipment Inventory Management',description: 'Complete digital inventory system with serial numbers,manufacturer details,and status tracking. Organize equipment by categories and stations.',benefits: ['Digital serial number tracking','Equipment history logs','Status management','Category organization']},
    {icon: FiCalendar,title: 'Inspection Scheduling',description: 'Schedule inspections for individual equipment or entire categories. Track due dates and completion status with built-in NFPA templates.',benefits: ['Individual & category inspections','NFPA compliance templates','Due date tracking','Inspection history']},
    {icon: FiMapPin,title: 'Multi-Station Management',description: 'Manage equipment across multiple fire stations with centralized oversight and station-specific views.',benefits: ['Multiple station support','Station-specific filtering','Centralized dashboard','Equipment location tracking']},
    {icon: FiAlertTriangle,title: 'Status Tracking',description: 'Track equipment status from in-service to out-of-service,repairs,and training use with detailed notes and history.',benefits: ['Multiple status options','Status change history','Required documentation','Equipment lifecycle tracking']},
    {icon: FiClock,title: 'Equipment History',description: 'Comprehensive audit trail of all equipment changes,status updates,and maintenance activities with timestamps.',benefits: ['Complete change history','User activity tracking','Detailed audit trail','Historical reporting']},
    {icon: FiDatabase,title: 'Cloud Database & Sync',description: 'All plans include secure cloud storage with PostgreSQL database,real-time sync across devices,and automatic backups.',benefits: ['Cloud-based storage','Real-time synchronization','Automatic backups','Multi-device access']}
  ];

  const testimonials=[
    {name: 'Fire Chief Johnson',department: 'Metro Fire Department',location: 'Sample City,State',content: 'Fire Gear Tracker has streamlined our equipment management process. The inspection scheduling helps us stay compliant and the equipment history is invaluable.',rating: 5,equipment: '250+ items tracked',savings: 'Improved organization'},
    {name: 'Captain Rodriguez',department: 'Valley Fire District',location: 'Sample Valley,State',content: 'Finally,a system that makes sense for fire departments. Easy to use and the equipment status tracking keeps us organized across all our stations.',rating: 5,equipment: '180+ items tracked',savings: 'Better compliance tracking'},
    {name: 'Lieutenant Williams',department: 'Riverside Fire Dept',location: 'Sample City,State',content: 'The digital inventory system is exactly what we needed. No more lost paperwork and we can access our equipment data from anywhere.',rating: 5,equipment: '320+ items tracked',savings: 'Paperless operations'}
  ];

  const plans=[
    {name: 'Free',monthlyPrice: 0,yearlyPrice: 0,description: 'Perfect for small departments getting started',stations: '1 Station',equipment: '50 Equipment Items',cta: 'Start Free',popular: false,features: [
      'Equipment tracking & inventory',
      'Inspection scheduling',
      'Equipment history',
      'Cloud storage & sync',
      'NFPA compliance templates'
    ]},
    {name: 'Professional',monthlyPrice: 14,yearlyPrice: 140,description: 'Ideal for growing departments',stations: '3 Stations',equipment: '300 Equipment Items',cta: 'Start Free Trial',popular: true,features: [
      'Everything in Free plan',
      'Multi-station management',
      'Advanced reporting',
      'Real-time sync',
      'Email support'
    ]},
    {name: 'Unlimited',monthlyPrice: 28,yearlyPrice: 280,description: 'For large departments and districts',stations: 'Unlimited Stations',equipment: 'Unlimited Equipment',cta: 'Contact Sales',popular: false,features: [
      'Everything in Professional plan',
      'Unlimited stations & equipment',
      'Advanced analytics',
      'Email support'
    ]}
  ];

  const getPrice=(plan)=> {
    if (plan.monthlyPrice===0) return 'Free';
    return billingCycle==='monthly' ? `$${plan.monthlyPrice}` : `$${plan.yearlyPrice}`;
  };

  const getPeriod=(plan)=> {
    if (plan.monthlyPrice===0) return '';
    return billingCycle==='monthly' ? '/month' : '/year';
  };

  const getSavings=(plan)=> {
    if (plan.monthlyPrice===0) return '';
    const monthlyCost=plan.monthlyPrice * 12;
    const savings=monthlyCost - plan.yearlyPrice;
    return savings > 0 ? `Save $${savings}/year` : '';
  };

  const scrollToPricing=()=> {
    const pricingSection=document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({behavior: 'smooth'});
    }
  };

  return (
    <div className="min-h-screen bg-mission-bg-primary text-mission-text-primary font-inter">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-mission-bg-primary/95 backdrop-blur-sm border-b border-mission-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-fire-red rounded-lg">
                <SafeIcon icon={FiShield} className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-inter-tight font-bold text-mission-text-primary">Fire Gear Tracker</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/login" className="font-inter text-mission-text-secondary hover:text-mission-text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/login" className="bg-fire-red hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors font-inter font-medium">
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={()=> setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-mission-bg-tertiary transition-colors"
            >
              <SafeIcon icon={mobileMenuOpen ? FiX : FiMenu} className="w-6 h-6 text-mission-text-primary" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div
              initial={{opacity: 0,y: -20}}
              animate={{opacity: 1,y: 0}}
              exit={{opacity: 0,y: -20}}
              className="md:hidden py-4 space-y-4"
            >
              <Link to="/login" className="block font-inter text-mission-text-secondary hover:text-mission-text-primary transition-colors">Sign In</Link>
              <Link to="/login" className="block bg-fire-red hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors text-center font-inter font-medium">
                Get Started
              </Link>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1
              initial={{opacity: 0,y: 20}}
              animate={{opacity: 1,y: 0}}
              className="text-4xl md:text-6xl font-inter-tight font-bold mb-6 text-mission-text-primary"
            >
              Fire Department Equipment <br />
              <span className="text-fire-red">Inventory Made Simple</span>
            </motion.h1>

            <motion.p
              initial={{opacity: 0,y: 20}}
              animate={{opacity: 1,y: 0}}
              transition={{delay: 0.1}}
              className="text-xl font-inter text-mission-text-secondary mb-8 max-w-3xl mx-auto"
            >
              Replace paper logs and spreadsheets with a professional digital inventory system. Track equipment,schedule inspections,and manage your gear across multiple stations.
            </motion.p>

            <motion.div
              initial={{opacity: 0,y: 20}}
              animate={{opacity: 1,y: 0}}
              transition={{delay: 0.2}}
              className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link to="/login" className="flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-6 py-3 rounded-lg font-inter font-medium transition-colors">
                <span>Start Free</span>
                <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
              </Link>
              <div className="flex items-center space-x-2 text-mission-text-muted">
                <SafeIcon icon={FiUsers} className="w-5 h-5" />
                <span className="text-sm">Used by fire departments nationwide</span>
              </div>
            </motion.div>

            <motion.p
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{delay: 0.3}}
              className="text-sm font-inter text-mission-text-muted mt-6"
            >
              Free forever • No credit card required • Setup in under 10 minutes
            </motion.p>
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
              <motion.div
                key={index}
                initial={{opacity: 0,y: 20}}
                whileInView={{opacity: 1,y: 0}}
                transition={{delay: index * 0.1}}
                viewport={{once: true}}
                className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6 hover:border-mission-border-light transition-colors"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-fire-red rounded-lg mb-4">
                  <SafeIcon icon={feature.icon} className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-inter-tight font-semibold mb-3 text-mission-text-primary">{feature.title}</h3>
                <p className="font-inter text-mission-text-secondary mb-4">{feature.description}</p>
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

      {/* Problem/Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-inter-tight font-bold mb-6 text-mission-text-primary">
                Stop Losing Track of <span className="text-fire-red">Critical Equipment</span>
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiX} className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-inter font-medium text-mission-text-primary">Paper logs get lost or damaged</h4>
                    <p className="font-inter text-mission-text-muted">Equipment records disappear when you need them most</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiX} className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-inter font-medium text-mission-text-primary">Missed inspections</h4>
                    <p className="font-inter text-mission-text-muted">Manual tracking leads to forgotten maintenance schedules</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiX} className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-inter font-medium text-mission-text-primary">Spreadsheets break and data is lost</h4>
                    <p className="font-inter text-mission-text-muted">Years of equipment history gone in an instant</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-inter-tight font-bold mb-6 text-fire-red">
                With Fire Gear Tracker:
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiCheck} className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-inter font-medium text-mission-text-primary">100% cloud-based,always accessible</h4>
                    <p className="font-inter text-mission-text-muted">Secure cloud database accessible from any device</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiCheck} className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-inter font-medium text-mission-text-primary">Automated inspection tracking</h4>
                    <p className="font-inter text-mission-text-muted">Never miss another inspection with smart notifications</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiCheck} className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-inter font-medium text-mission-text-primary">Automatic cloud backup</h4>
                    <p className="font-inter text-mission-text-muted">Your data is safe and always available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              <motion.div
                key={index}
                initial={{opacity: 0,y: 20}}
                whileInView={{opacity: 1,y: 0}}
                transition={{delay: index * 0.1}}
                viewport={{once: true}}
                className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_,i)=> (
                    <SafeIcon key={i} icon={FiStar} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="font-inter text-mission-text-secondary mb-6 italic">"{testimonial.content}"</p>
                <div className="border-t border-mission-border pt-4">
                  <div className="font-inter font-medium text-mission-text-primary">{testimonial.name}</div>
                  <div className="font-inter text-mission-text-muted text-sm">{testimonial.department}</div>
                  <div className="font-inter text-mission-text-muted text-xs">{testimonial.location}</div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-mission-accent-blue">{testimonial.equipment}</span>
                    <span className="text-mission-accent-green">{testimonial.savings}</span>
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

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`font-inter ${billingCycle==='monthly' ? 'text-mission-text-primary' : 'text-mission-text-muted'}`}>
                Monthly
              </span>
              <button
                onClick={()=> setBillingCycle(billingCycle==='monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${billingCycle==='yearly' ? 'bg-fire-red' : 'bg-mission-border'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${billingCycle==='yearly' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`font-inter ${billingCycle==='yearly' ? 'text-mission-text-primary' : 'text-mission-text-muted'}`}>
                Yearly
              </span>
              <span className="text-mission-accent-green text-sm font-inter font-medium">Save up to 17%</span>
            </div>

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan,index)=> (
              <motion.div
                key={index}
                initial={{opacity: 0,y: 20}}
                whileInView={{opacity: 1,y: 0}}
                transition={{delay: index * 0.1}}
                viewport={{once: true}}
                className={`relative bg-mission-bg-secondary border rounded-lg p-8 ${plan.popular ? 'border-fire-red ring-2 ring-fire-red/20' : 'border-mission-border hover:border-mission-border-light'} transition-colors`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-fire-red text-white px-4 py-1 rounded-full text-sm font-inter font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-inter-tight font-bold mb-2 text-mission-text-primary">{plan.name}</h3>
                  <p className="font-inter text-mission-text-muted mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-inter-tight font-bold text-mission-text-primary">{getPrice(plan)}</span>
                    {plan.monthlyPrice > 0 && (
                      <span className="font-inter text-mission-text-muted">{getPeriod(plan)}</span>
                    )}
                  </div>
                  {billingCycle==='yearly' && getSavings(plan) && (
                    <p className="text-mission-accent-green text-sm font-inter font-medium">{getSavings(plan)}</p>
                  )}
                </div>

                <div className="space-y-6 mb-8">
                  <div className="text-center p-4 bg-mission-bg-tertiary rounded-lg">
                    <div className="text-lg font-inter-tight font-bold text-mission-text-primary mb-1">
                      {plan.stations}
                    </div>
                    <div className="text-lg font-inter-tight font-bold text-mission-text-primary">
                      {plan.equipment}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-inter font-medium text-mission-text-secondary mb-3">
                      All plans include:
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

                <Link
                  to={plan.cta==='Contact Sales' ? '/contact-sales' : '/login'}
                  className={`block w-full text-center px-4 py-3 rounded-lg font-inter font-medium transition-colors ${plan.popular ? 'bg-fire-red hover:bg-fire-red-dark text-white' : 'bg-mission-bg-tertiary hover:bg-mission-border text-mission-text-primary'}`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="font-inter text-mission-text-muted mb-4">
              Free plan forever • Paid plans include 14-day free trial • Cancel anytime
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
            Start free today and bring your equipment management into the digital age.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <Link to="/login" className="inline-flex items-center space-x-2 bg-white hover:bg-gray-100 text-fire-red px-6 py-3 rounded-lg font-inter font-medium transition-colors">
              <span>Start Free</span>
              <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
            </Link>
            <div className="flex items-center space-x-2 text-red-100">
              <SafeIcon icon={FiZap} className="w-5 h-5" />
              <span>Setup takes less than 10 minutes</span>
            </div>
          </div>
          <p className="font-inter text-red-100 text-sm">
            Free forever • No credit card required • Upgrade anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-mission-bg-primary border-t border-mission-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-fire-red rounded-lg">
                  <SafeIcon icon={FiShield} className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-inter-tight font-bold text-mission-text-primary">Fire Gear Tracker</span>
              </div>
              <p className="font-inter text-mission-text-muted mb-4 max-w-md">
                Digital equipment inventory system built specifically for fire departments. Keep track of your gear,schedule inspections,and maintain compliance.
              </p>
              <p className="font-inter text-mission-text-muted text-sm">
                © 2024 Fire Gear Tracker. All rights reserved.
              </p>
            </div>

            <div>
              <h4 className="font-inter font-medium text-mission-text-primary mb-4">Product</h4>
              <ul className="space-y-2 font-inter text-mission-text-muted">
                <li><Link to="/login" className="hover:text-mission-text-primary transition-colors">Login</Link></li>
                <li><Link to="/login" className="hover:text-mission-text-primary transition-colors">Free Trial</Link></li>
                <li><button onClick={scrollToPricing} className="hover:text-mission-text-primary transition-colors text-left">Pricing</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-inter font-medium text-mission-text-primary mb-4">Support</h4>
              <ul className="space-y-2 font-inter text-mission-text-muted">
                <li><Link to="/documentation" className="hover:text-mission-text-primary transition-colors">Documentation</Link></li>
                <li><Link to="/contact-sales" className="hover:text-mission-text-primary transition-colors">Contact Sales</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;