import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiShield, FiCheck, FiArrowRight, FiPlay, FiStar, FiUsers, FiTrendingUp, FiClock, FiAlertTriangle, FiMenu, FiX, FiPackage, FiCalendar, FiMapPin, FiBarChart3 } = FiIcons;

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: FiPackage,
      title: 'Equipment Inventory',
      description: 'Track all your equipment with detailed records, serial numbers, and maintenance history.'
    },
    {
      icon: FiCalendar,
      title: 'Inspection Scheduling',
      description: 'Automated NFPA compliance tracking with smart alerts for upcoming and overdue inspections.'
    },
    {
      icon: FiMapPin,
      title: 'Multi-Station Management',
      description: 'Manage equipment across multiple stations with centralized oversight and reporting.'
    },
    {
      icon: FiBarChart3,
      title: 'Advanced Analytics',
      description: 'Gain insights into equipment utilization, maintenance costs, and compliance status.'
    },
    {
      icon: FiAlertTriangle,
      title: 'Smart Alerts',
      description: 'Real-time notifications for critical issues, overdue inspections, and maintenance needs.'
    },
    {
      icon: FiUsers,
      title: 'Team Collaboration',
      description: 'Enable your entire department to access and update equipment information seamlessly.'
    }
  ];

  const testimonials = [
    {
      name: 'Chief Mike Rodriguez',
      department: 'Metro Fire Department',
      content: 'Fire Gear Tracker transformed our equipment management. We reduced compliance violations by 95% and saved countless hours on paperwork.',
      rating: 5
    },
    {
      name: 'Captain Sarah Johnson',
      department: 'Valley Fire District',
      content: 'The inspection tracking feature alone has saved us from multiple OSHA violations. Worth every penny.',
      rating: 5
    },
    {
      name: 'Lieutenant Tom Chen',
      department: 'Riverside Fire Dept',
      content: 'Finally, a system built by firefighters for firefighters. Easy to use and incredibly powerful.',
      rating: 5
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Perfect for small departments',
      features: [
        '1 Station',
        'Up to 100 equipment items',
        'Basic inspection tracking',
        'Email support',
        'Mobile access'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: '$149',
      period: '/month',
      description: 'Most popular for growing departments',
      features: [
        '5 Stations',
        'Up to 500 equipment items',
        'Advanced analytics',
        'Priority support',
        'Custom reports',
        'API access'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large departments and districts',
      features: [
        'Unlimited stations',
        'Unlimited equipment',
        'White-label solution',
        'Dedicated support',
        'Custom integrations',
        'On-premise deployment'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Equipment Items Tracked' },
    { number: '500+', label: 'Fire Departments' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '24/7', label: 'Support Available' }
  ];

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
              <a href="#features" className="font-inter text-mission-text-secondary hover:text-mission-text-primary transition-colors">Features</a>
              <a href="#pricing" className="font-inter text-mission-text-secondary hover:text-mission-text-primary transition-colors">Pricing</a>
              <a href="#testimonials" className="font-inter text-mission-text-secondary hover:text-mission-text-primary transition-colors">Reviews</a>
              <Link to="/login" className="font-inter text-mission-text-secondary hover:text-mission-text-primary transition-colors">
                Sign In
              </Link>
              <Link
                to="/login"
                className="bg-fire-red hover:bg-fire-red-dark text-white px-6 py-2 rounded-lg transition-colors font-inter font-medium"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-mission-bg-tertiary transition-colors"
            >
              <SafeIcon icon={mobileMenuOpen ? FiX : FiMenu} className="w-6 h-6 text-mission-text-primary" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden py-4 space-y-4"
            >
              <a href="#features" className="block font-inter text-mission-text-secondary hover:text-mission-text-primary transition-colors">Features</a>
              <a href="#pricing" className="block font-inter text-mission-text-secondary hover:text-mission-text-primary transition-colors">Pricing</a>
              <a href="#testimonials" className="block font-inter text-mission-text-secondary hover:text-mission-text-primary transition-colors">Reviews</a>
              <Link to="/login" className="block font-inter text-mission-text-secondary hover:text-mission-text-primary transition-colors">Sign In</Link>
              <Link
                to="/login"
                className="block bg-fire-red hover:bg-fire-red-dark text-white px-6 py-2 rounded-lg transition-colors text-center font-inter font-medium"
              >
                Start Free Trial
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-inter-tight font-bold mb-6 text-mission-text-primary"
            >
              Fire Department Equipment <br />
              <span className="text-fire-red">Management Made Simple</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-inter text-mission-text-secondary mb-8 max-w-3xl mx-auto"
            >
              Replace paper logs and spreadsheets with a professional digital solution. Ensure NFPA compliance, track inspections, and manage your entire equipment inventory from one platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-8 py-4 rounded-lg text-lg font-inter font-medium transition-colors"
              >
                <span>Start Free Trial</span>
                <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
              </Link>
              <button className="flex items-center space-x-2 font-inter text-mission-text-secondary hover:text-mission-text-primary transition-colors">
                <div className="flex items-center justify-center w-12 h-12 bg-mission-bg-tertiary rounded-full hover:bg-mission-bg-secondary transition-colors">
                  <SafeIcon icon={FiPlay} className="w-5 h-5 ml-1" />
                </div>
                <span>Watch Demo</span>
              </button>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-inter text-mission-text-muted mt-6"
            >
              14-day free trial • No credit card required • Setup in under 10 minutes
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-inter-tight font-bold text-fire-red mb-2">
                  {stat.number}
                </div>
                <div className="font-inter text-mission-text-muted">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-mission-bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-inter-tight font-bold mb-4 text-mission-text-primary">
              Everything Your Department Needs
            </h2>
            <p className="text-xl font-inter text-mission-text-secondary max-w-3xl mx-auto">
              Built specifically for fire departments by firefighters who understand your unique challenges and requirements.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6 hover:border-mission-border-light transition-colors"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-fire-red rounded-lg mb-4">
                  <SafeIcon icon={feature.icon} className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-inter-tight font-semibold mb-3 text-mission-text-primary">{feature.title}</h3>
                <p className="font-inter text-mission-text-secondary">{feature.description}</p>
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
                Stop Losing Sleep Over <span className="text-fire-red">Compliance Issues</span>
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiX} className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-inter font-medium text-mission-text-primary">Paper logs get lost or damaged</h4>
                    <p className="font-inter text-mission-text-muted">Critical inspection records disappear when you need them most</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiX} className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-inter font-medium text-mission-text-primary">Missed inspections cost thousands</h4>
                    <p className="font-inter text-mission-text-muted">OSHA violations and equipment failures due to poor tracking</p>
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
                    <h4 className="font-inter font-medium text-mission-text-primary">100% digital, always accessible</h4>
                    <p className="font-inter text-mission-text-muted">Cloud-based records available 24/7 from any device</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiCheck} className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-inter font-medium text-mission-text-primary">Automated compliance tracking</h4>
                    <p className="font-inter text-mission-text-muted">Never miss another inspection with smart alerts and reminders</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiCheck} className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-inter font-medium text-mission-text-primary">Secure, backed up data</h4>
                    <p className="font-inter text-mission-text-muted">Enterprise-grade security with automatic backups</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-mission-bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-inter-tight font-bold mb-4 text-mission-text-primary">
              Trusted by Fire Departments Nationwide
            </h2>
            <p className="text-xl font-inter text-mission-text-secondary">
              See what fire chiefs and officers are saying about Fire Gear Tracker
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <SafeIcon key={i} icon={FiStar} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="font-inter text-mission-text-secondary mb-6">"{testimonial.content}"</p>
                <div>
                  <div className="font-inter font-medium text-mission-text-primary">{testimonial.name}</div>
                  <div className="font-inter text-mission-text-muted text-sm">{testimonial.department}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-inter-tight font-bold mb-4 text-mission-text-primary">
              Choose Your Plan
            </h2>
            <p className="text-xl font-inter text-mission-text-secondary">
              Start with a 14-day free trial. No credit card required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-mission-bg-secondary border rounded-lg p-8 ${
                  plan.popular ? 'border-fire-red' : 'border-mission-border'
                }`}
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
                    <span className="text-4xl font-inter-tight font-bold text-mission-text-primary">{plan.price}</span>
                    <span className="font-inter text-mission-text-muted">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="font-inter text-mission-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className={`block w-full text-center px-6 py-3 rounded-lg font-inter font-medium transition-colors ${
                    plan.popular
                      ? 'bg-fire-red hover:bg-fire-red-dark text-white'
                      : 'bg-mission-bg-tertiary hover:bg-mission-bg-primary text-mission-text-primary'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="font-inter text-mission-text-muted mb-4">
              All plans include 14-day free trial • Cancel anytime • No setup fees
            </p>
            <p className="text-sm font-inter text-mission-text-muted">
              Need a custom solution?{' '}
              <a href="#contact" className="text-fire-red hover:underline">
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-fire-red">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-inter-tight font-bold mb-4 text-white">
            Ready to Modernize Your Equipment Management?
          </h2>
          <p className="text-xl font-inter text-red-100 mb-8">
            Join hundreds of fire departments already using Fire Gear Tracker to stay compliant and organized.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 bg-white hover:bg-gray-100 text-fire-red px-8 py-4 rounded-lg text-lg font-inter font-medium transition-colors"
          >
            <span>Start Your Free Trial</span>
            <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
          </Link>
          <p className="font-inter text-red-100 text-sm mt-4">
            No credit card required • Setup takes less than 10 minutes
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
                Professional equipment management software built specifically for fire departments. Ensure compliance, reduce paperwork, and keep your team safe.
              </p>
              <p className="font-inter text-mission-text-muted text-sm">
                © 2024 Fire Gear Tracker. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="font-inter font-medium text-mission-text-primary mb-4">Product</h4>
              <ul className="space-y-2 font-inter text-mission-text-muted">
                <li><a href="#features" className="hover:text-mission-text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-mission-text-primary transition-colors">Pricing</a></li>
                <li><Link to="/login" className="hover:text-mission-text-primary transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-inter font-medium text-mission-text-primary mb-4">Support</h4>
              <ul className="space-y-2 font-inter text-mission-text-muted">
                <li><a href="#contact" className="hover:text-mission-text-primary transition-colors">Contact</a></li>
                <li><a href="#help" className="hover:text-mission-text-primary transition-colors">Help Center</a></li>
                <li><a href="#privacy" className="hover:text-mission-text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;