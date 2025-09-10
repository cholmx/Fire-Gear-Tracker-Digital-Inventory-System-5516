import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {FiShield,FiArrowLeft,FiMail,FiPhone,FiMapPin,FiUsers,FiPackage,FiCheck,FiSend} = FiIcons;

const ContactSales = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phone: '',
    stations: '',
    equipment: '',
    currentSystem: '',
    message: '',
    timeline: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send the form data to your backend
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-mission-bg-primary font-inter flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-mission-bg-secondary border border-mission-border rounded-lg p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-lg mx-auto mb-6">
            <SafeIcon icon={FiCheck} className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-4">
            Thank You!
          </h2>
          <p className="text-mission-text-secondary mb-6">
            We've received your message and will contact you within 1 business day to discuss your fire department's needs.
          </p>
          <Link to="/" className="inline-flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-6 py-3 rounded-lg transition-colors font-inter font-medium">
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mission-bg-primary font-inter">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-mission-bg-primary/95 backdrop-blur-sm border-b border-mission-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-fire-red rounded-lg">
                <SafeIcon icon={FiShield} className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-inter-tight font-bold text-mission-text-primary">Fire Gear Tracker</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 text-mission-text-muted hover:text-mission-text-primary transition-colors">
                <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              <Link to="/login" className="bg-fire-red hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors font-inter font-medium">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-inter-tight font-bold text-mission-text-primary mb-4">
              Contact Our Sales Team
            </h1>
            <p className="text-xl text-mission-text-secondary max-w-3xl mx-auto">
              Ready to upgrade your fire department's equipment management? Let's discuss how Fire Gear Tracker can meet your specific needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-8">
              <h2 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-6">
                Tell Us About Your Department
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                      placeholder="your.email@department.gov"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                    Fire Department Name *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    placeholder="e.g., Metro Fire Department"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                      Number of Stations
                    </label>
                    <select
                      name="stations"
                      value={formData.stations}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    >
                      <option value="">Select stations</option>
                      <option value="1">1 Station</option>
                      <option value="2-3">2-3 Stations</option>
                      <option value="4-10">4-10 Stations</option>
                      <option value="11-25">11-25 Stations</option>
                      <option value="25+">25+ Stations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                      Estimated Equipment Items
                    </label>
                    <select
                      name="equipment"
                      value={formData.equipment}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    >
                      <option value="">Select range</option>
                      <option value="1-50">1-50 Items</option>
                      <option value="51-300">51-300 Items</option>
                      <option value="301-1000">301-1,000 Items</option>
                      <option value="1000+">1,000+ Items</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                    Current System
                  </label>
                  <select
                    name="currentSystem"
                    value={formData.currentSystem}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                  >
                    <option value="">How do you currently track equipment?</option>
                    <option value="paper">Paper logs</option>
                    <option value="spreadsheets">Excel/Google Sheets</option>
                    <option value="other-software">Other software</option>
                    <option value="none">No formal system</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                    Implementation Timeline
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                  >
                    <option value="">When would you like to start?</option>
                    <option value="immediately">Immediately</option>
                    <option value="1-3-months">Within 1-3 months</option>
                    <option value="3-6-months">3-6 months</option>
                    <option value="6-12-months">6-12 months</option>
                    <option value="evaluating">Just evaluating options</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                    Additional Information
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    placeholder="Tell us about your specific needs, challenges, or questions..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-6 py-3 rounded-lg transition-colors font-inter font-medium"
                >
                  <SafeIcon icon={FiSend} className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>

            {/* Contact Information & Benefits */}
            <div className="space-y-8">
              {/* Contact Info */}
              <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
                <h3 className="text-lg font-inter-tight font-bold text-mission-text-primary mb-4">
                  Get In Touch
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiMail} className="w-5 h-5 text-mission-accent-blue" />
                    <div>
                      <p className="text-mission-text-primary font-medium">Email</p>
                      <p className="text-mission-text-muted text-sm">sales@firegeartracker.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={FiPhone} className="w-5 h-5 text-mission-accent-green" />
                    <div>
                      <p className="text-mission-text-primary font-medium">Phone</p>
                      <p className="text-mission-text-muted text-sm">1-800-FIRE-GEAR (1-800-347-3432)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <SafeIcon icon={FiMapPin} className="w-5 h-5 text-mission-accent-orange mt-0.5" />
                    <div>
                      <p className="text-mission-text-primary font-medium">Response Time</p>
                      <p className="text-mission-text-muted text-sm">We respond to all inquiries within 1 business day</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What to Expect */}
              <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
                <h3 className="text-lg font-inter-tight font-bold text-mission-text-primary mb-4">
                  What Happens Next?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="bg-fire-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                    <div>
                      <h4 className="font-medium text-mission-text-primary">Initial Consultation</h4>
                      <p className="text-mission-text-muted text-sm">We'll discuss your department's specific needs and current challenges.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-fire-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                    <div>
                      <h4 className="font-medium text-mission-text-primary">Custom Demo</h4>
                      <p className="text-mission-text-muted text-sm">See Fire Gear Tracker in action with examples from your type of department.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="bg-fire-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">3</span>
                    <div>
                      <h4 className="font-medium text-mission-text-primary">Implementation Plan</h4>
                      <p className="text-mission-text-muted text-sm">We'll create a tailored plan for migrating your data and training your team.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Why Fire Departments Choose Us */}
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-6">
                <h3 className="text-lg font-inter-tight font-bold text-green-400 mb-4">
                  Why Fire Departments Choose Us
                </h3>
                <ul className="space-y-2 text-green-300">
                  <li className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                    <span>Built specifically for fire departments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                    <span>NFPA compliance built-in</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                    <span>No long-term contracts required</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                    <span>Free data migration assistance</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                    <span>Dedicated support from fire service professionals</span>
                  </li>
                </ul>
              </div>

              {/* Trusted by Fire Departments */}
              <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
                <h3 className="text-lg font-inter-tight font-bold text-mission-text-primary mb-4">
                  Trusted by Fire Departments Nationwide
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-inter-tight font-bold text-fire-red">500+</div>
                    <div className="text-sm text-mission-text-muted">Departments</div>
                  </div>
                  <div>
                    <div className="text-2xl font-inter-tight font-bold text-fire-red">50,000+</div>
                    <div className="text-sm text-mission-text-muted">Equipment Items</div>
                  </div>
                  <div>
                    <div className="text-2xl font-inter-tight font-bold text-fire-red">1,200+</div>
                    <div className="text-sm text-mission-text-muted">Fire Stations</div>
                  </div>
                  <div>
                    <div className="text-2xl font-inter-tight font-bold text-fire-red">99.9%</div>
                    <div className="text-sm text-mission-text-muted">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSales;