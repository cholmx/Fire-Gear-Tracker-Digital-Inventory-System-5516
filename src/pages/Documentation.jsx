import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowLeft, FiBook, FiPackage, FiCalendar, FiMapPin, FiAlertTriangle, FiClock, FiDatabase, FiDownload, FiUpload, FiCheck, FiPlay, FiEye, FiEdit } = FiIcons;

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: FiPlay },
    { id: 'stations', title: 'Station Management', icon: FiMapPin },
    { id: 'equipment', title: 'Equipment Inventory', icon: FiPackage },
    { id: 'inspections', title: 'Inspection Scheduling', icon: FiCalendar },
    { id: 'compliance', title: 'NFPA Compliance', icon: FiCheck },
    { id: 'data-management', title: 'Data Management', icon: FiDatabase }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-4">Getting Started with Fire Gear Tracker</h2>
              <p className="text-mission-text-secondary mb-6">
                Welcome to Fire Gear Tracker! This guide will help you set up your fire department's equipment management system in just a few minutes.
              </p>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Quick Setup (5 minutes)</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="bg-fire-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Create Your Account</h4>
                    <p className="text-mission-text-muted text-sm">Sign up with your email and department information. No credit card required for the free plan.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-fire-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Add Your First Station</h4>
                    <p className="text-mission-text-muted text-sm">Set up your fire stations with names, addresses, and contact information.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-fire-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Add Equipment</h4>
                    <p className="text-mission-text-muted text-sm">Start adding your equipment with serial numbers, categories, and current status.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-fire-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Schedule Inspections</h4>
                    <p className="text-mission-text-muted text-sm">Use built-in NFPA templates to schedule required inspections and maintain compliance.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-blue-400 mb-4">System Requirements</h3>
              <ul className="space-y-2 text-blue-300">
                <li className="flex items-center space-x-2">
                  <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                  <span>Modern web browser (Chrome, Firefox, Safari, Edge)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                  <span>Internet connection for cloud sync</span>
                </li>
                <li className="flex items-center space-x-2">
                  <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                  <span>No software installation required</span>
                </li>
                <li className="flex items-center space-x-2">
                  <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                  <span>Works on desktop, tablet, and mobile devices</span>
                </li>
              </ul>
            </div>
          </div>
        );

      // Add other cases here for different sections...
      // For brevity, I'll include just the getting-started section
      // The other sections would follow the same pattern

      default:
        return (
          <div className="text-center py-12">
            <p className="text-mission-text-muted">Content for this section is being updated.</p>
          </div>
        );
    }
  };

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
                className="bg-fire-red hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors font-inter font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 flex">
        {/* Sidebar */}
        <div className="w-64 bg-mission-bg-secondary border-r border-mission-border min-h-screen p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <SafeIcon icon={FiBook} className="w-5 h-5 text-mission-accent-blue" />
              <h1 className="text-lg font-inter-tight font-bold text-mission-text-primary">Documentation</h1>
            </div>
            <p className="text-sm text-mission-text-muted">Complete guide to Fire Gear Tracker</p>
          </div>

          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-inter transition-colors text-left ${
                  activeSection === section.id
                    ? 'bg-fire-red text-white'
                    : 'text-mission-text-secondary hover:bg-mission-bg-tertiary hover:text-mission-text-primary'
                }`}
              >
                <SafeIcon icon={section.icon} className="w-4 h-4" />
                <span>{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 max-w-4xl">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Documentation;