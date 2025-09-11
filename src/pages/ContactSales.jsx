import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiCheck, FiSend } = FiIcons;

const ContactSales = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
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
            We've received your message and will get back to you within 1 business day.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-6 py-3 rounded-lg transition-colors font-inter font-medium"
          >
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
                <SafeIcon icon="ShieldCheck" className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-inter-tight font-bold text-mission-text-primary">Fire Gear Tracker</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-mission-text-muted hover:text-mission-text-primary transition-colors"
              >
                <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
              <Link
                to="/login"
                className="flex items-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors"
              >
                <span>SIGN IN</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-inter-tight font-bold text-mission-text-primary mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-mission-text-secondary">
              Have questions about Fire Gear Tracker? We're here to help.
            </p>
          </div>

          {/* Contact Form */}
          <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-8">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                    Department/Organization
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                    placeholder="e.g., Metro Fire Department"
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
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                  Inquiry Type
                </label>
                <select
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                >
                  <option value="general">General Question</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="demo">Request Demo</option>
                  <option value="pricing">Pricing Information</option>
                  <option value="feature">Feature Request</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                  placeholder="Brief description of your inquiry"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                  placeholder="Please provide details about your question or request..."
                  required
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

            <div className="mt-6 text-center">
              <p className="text-sm font-inter text-mission-text-muted">
                We typically respond within 1 business day
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSales;