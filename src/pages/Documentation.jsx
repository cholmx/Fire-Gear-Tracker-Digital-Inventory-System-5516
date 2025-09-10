import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {FiShield,FiArrowLeft,FiBook,FiPackage,FiCalendar,FiMapPin,FiAlertTriangle,FiClock,FiDatabase,FiDownload,FiUpload,FiCheck,FiPlay,FiEye,FiEdit} = FiIcons;

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: FiPlay
    },
    {
      id: 'stations',
      title: 'Station Management',
      icon: FiMapPin
    },
    {
      id: 'equipment',
      title: 'Equipment Inventory',
      icon: FiPackage
    },
    {
      id: 'inspections',
      title: 'Inspection Scheduling',
      icon: FiCalendar
    },
    {
      id: 'compliance',
      title: 'NFPA Compliance',
      icon: FiCheck
    },
    {
      id: 'data-management',
      title: 'Data Management',
      icon: FiDatabase
    }
  ];

  const renderContent = () => {
    switch(activeSection) {
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

      case 'stations':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-4">Station Management</h2>
              <p className="text-mission-text-secondary mb-6">
                Manage your fire department's stations and locations. Stations are the foundation of your equipment organization.
              </p>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Adding a New Station</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="bg-mission-accent-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Navigate to Stations</h4>
                    <p className="text-mission-text-muted text-sm">Click "Stations" in the sidebar or from the dashboard quick actions.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-mission-accent-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Click "Add Station"</h4>
                    <p className="text-mission-text-muted text-sm">Use the red "ADD STATION" button in the top right corner.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-mission-accent-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Fill in Station Details</h4>
                    <ul className="text-mission-text-muted text-sm mt-1 space-y-1">
                      <li>• <strong>Name:</strong> Station 1, Headquarters, etc.</li>
                      <li>• <strong>Address:</strong> Full street address (optional)</li>
                      <li>• <strong>Phone:</strong> Station phone number (optional)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-yellow-400 mb-4">Station Best Practices</h3>
              <ul className="space-y-2 text-yellow-300">
                <li className="flex items-start space-x-2">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Use clear, consistent naming (e.g., "Station 1", "Station 2" rather than "Main" or "Downtown")</span>
                </li>
                <li className="flex items-start space-x-2">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Include full addresses for accurate location tracking</span>
                </li>
                <li className="flex items-start space-x-2">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Add phone numbers for contact during equipment transfers</span>
                </li>
              </ul>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Managing Existing Stations</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-mission-text-primary mb-2">Editing Stations</h4>
                  <p className="text-mission-text-muted text-sm">Click the edit icon on any station card to update name, address, or phone number.</p>
                </div>
                <div>
                  <h4 className="font-medium text-mission-text-primary mb-2">Deleting Stations</h4>
                  <p className="text-mission-text-muted text-sm">Deleting a station will also remove all equipment assigned to that station. You'll be warned before deletion.</p>
                </div>
                <div>
                  <h4 className="font-medium text-mission-text-primary mb-2">Equipment Count</h4>
                  <p className="text-mission-text-muted text-sm">Each station card shows how many equipment items are currently assigned to that location.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'equipment':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-4">Equipment Inventory</h2>
              <p className="text-mission-text-secondary mb-6">
                Track all your fire department equipment with detailed information, status updates, and complete history logs.
              </p>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Adding Equipment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-mission-text-primary mb-2">Required Information</h4>
                  <ul className="space-y-1 text-mission-text-muted text-sm">
                    <li>• Equipment Name</li>
                    <li>• Serial Number (must be unique)</li>
                    <li>• Category</li>
                    <li>• Station Assignment</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-mission-text-primary mb-2">Optional Information</h4>
                  <ul className="space-y-1 text-mission-text-muted text-sm">
                    <li>• Manufacturer</li>
                    <li>• Model Number</li>
                    <li>• Subcategory</li>
                    <li>• Notes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Equipment Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-mission-text-primary">Safety Equipment</h4>
                  <ul className="text-mission-text-muted text-sm space-y-1">
                    <li>• Breathing Equipment (SCBA, masks, cylinders)</li>
                    <li>• Personal Protective Equipment (turnout gear, helmets)</li>
                    <li>• Detection Equipment (gas meters, thermal cameras)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-mission-text-primary">Operational Equipment</h4>
                  <ul className="text-mission-text-muted text-sm space-y-1">
                    <li>• Fire Apparatus (engines, trucks, ambulances)</li>
                    <li>• Rescue Equipment (ladders, ropes, extrication tools)</li>
                    <li>• Hose and Water Supply (hoses, nozzles, pumps)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Equipment Status Management</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-green-600/20 border border-green-600/30 rounded p-3">
                    <h4 className="font-medium text-green-400 text-sm">In Service</h4>
                    <p className="text-green-300 text-xs">Ready for use</p>
                  </div>
                  <div className="bg-red-600/20 border border-red-600/30 rounded p-3">
                    <h4 className="font-medium text-red-400 text-sm">Out of Service</h4>
                    <p className="text-red-300 text-xs">Not available</p>
                  </div>
                  <div className="bg-yellow-600/20 border border-yellow-600/30 rounded p-3">
                    <h4 className="font-medium text-yellow-400 text-sm">Out for Repair</h4>
                    <p className="text-yellow-300 text-xs">Being serviced</p>
                  </div>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-800 rounded p-4">
                  <h4 className="font-medium text-yellow-400 mb-2">Status Change Requirements</h4>
                  <p className="text-yellow-300 text-sm">When changing equipment status from "In Service" to any other status, you must provide detailed notes explaining the reason for the change.</p>
                </div>
              </div>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Equipment Actions</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiEye} className="w-5 h-5 text-mission-accent-blue mt-0.5" />
                  <div>
                    <h4 className="font-medium text-mission-text-primary">View Details</h4>
                    <p className="text-mission-text-muted text-sm">See complete equipment information, history, and current status.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiEdit} className="w-5 h-5 text-mission-accent-green mt-0.5" />
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Edit Equipment</h4>
                    <p className="text-mission-text-muted text-sm">Update status, station assignment, and notes. Name and serial number cannot be changed.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiDownload} className="w-5 h-5 text-mission-accent-orange mt-0.5" />
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Print Details</h4>
                    <p className="text-mission-text-muted text-sm">Generate a printable report with equipment details and history.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'inspections':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-4">Inspection Scheduling</h2>
              <p className="text-mission-text-secondary mb-6">
                Schedule and track equipment inspections to maintain NFPA compliance and ensure equipment readiness.
              </p>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Types of Inspections</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-mission-bg-tertiary rounded p-4">
                  <h4 className="font-medium text-mission-accent-blue mb-2">Individual Equipment</h4>
                  <p className="text-mission-text-muted text-sm">Schedule inspections for specific equipment items. Perfect for unique or high-value equipment that requires individual tracking.</p>
                </div>
                <div className="bg-mission-bg-tertiary rounded p-4">
                  <h4 className="font-medium text-mission-accent-purple mb-2">Category Rules</h4>
                  <p className="text-mission-text-muted text-sm">Create inspection schedules that apply to all equipment in a category. Ideal for bulk inspections like annual SCBA testing.</p>
                </div>
              </div>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">NFPA Compliance Templates</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-mission-text-primary mb-2">Built-in Templates Include:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <ul className="space-y-1 text-mission-text-muted">
                      <li>• SCBA Annual Flow Test (NFPA 1852)</li>
                      <li>• Turnout Gear Advanced Inspection (NFPA 1851)</li>
                      <li>• Fire Hose Annual Pressure Test (NFPA 1962)</li>
                      <li>• Ground Ladder Annual Inspection (NFPA 1932)</li>
                    </ul>
                    <ul className="space-y-1 text-mission-text-muted">
                      <li>• Fire Apparatus Annual Pump Test (NFPA 1911)</li>
                      <li>• Air Cylinder 5-Year Hydrostatic Test</li>
                      <li>• Gas Meter Monthly Calibration</li>
                      <li>• Aerial Device Annual Inspection</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Inspection Status Alerts</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-red-600/20 border border-red-600/30 rounded">
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-mono">OVERDUE</span>
                  <span className="text-red-300 text-sm">Past due - immediate attention required</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-red-600/20 border border-red-600/30 rounded">
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-mono">1-3D</span>
                  <span className="text-red-300 text-sm">Critical - due within 1-3 days</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-yellow-600/20 border border-yellow-600/30 rounded">
                  <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-mono">4-7D</span>
                  <span className="text-yellow-300 text-sm">Warning - due within 4-7 days</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-green-600/20 border border-green-600/30 rounded">
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-mono">30+D</span>
                  <span className="text-green-300 text-sm">Upcoming - due in 30+ days</span>
                </div>
              </div>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Completing Inspections</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="bg-mission-accent-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Print Inspection Checklist</h4>
                    <p className="text-mission-text-muted text-sm">Generate a printable checklist with all equipment items and inspection requirements.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-mission-accent-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Perform Physical Inspection</h4>
                    <p className="text-mission-text-muted text-sm">Follow NFPA guidelines and document any issues or observations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-mission-accent-green text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Mark as Complete</h4>
                    <p className="text-mission-text-muted text-sm">Use the "Mark Complete" button to automatically schedule the next inspection.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-4">NFPA Compliance</h2>
              <p className="text-mission-text-secondary mb-6">
                Fire Gear Tracker helps you maintain compliance with National Fire Protection Association (NFPA) standards through automated scheduling and documentation.
              </p>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Supported NFPA Standards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-mission-accent-blue mb-3">Personal Protection</h4>
                  <ul className="space-y-2 text-mission-text-muted text-sm">
                    <li><strong>NFPA 1851:</strong> Structural firefighting protective ensembles</li>
                    <li><strong>NFPA 1852:</strong> Selection, care, and maintenance of SCBA</li>
                    <li><strong>OSHA 29 CFR 1910.134:</strong> Respiratory protection standards</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-mission-accent-blue mb-3">Equipment & Apparatus</h4>
                  <ul className="space-y-2 text-mission-text-muted text-sm">
                    <li><strong>NFPA 1911:</strong> Inspection, maintenance, testing of fire apparatus</li>
                    <li><strong>NFPA 1932:</strong> Use, maintenance, and service testing of ladders</li>
                    <li><strong>NFPA 1962:</strong> Inspection, care, and use of fire hose</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-800 rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-green-400 mb-4">Compliance Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ul className="space-y-2 text-green-300">
                  <li className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                    <span>Pre-built inspection templates for all major standards</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                    <span>Automatic scheduling based on NFPA intervals</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                    <span>Complete audit trail of all inspections</span>
                  </li>
                </ul>
                <ul className="space-y-2 text-green-300">
                  <li className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                    <span>Printable inspection checklists</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                    <span>Overdue inspection alerts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                    <span>Historical compliance reporting</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Inspection Intervals</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-mission-bg-tertiary">
                    <tr>
                      <th className="text-left p-3 text-mission-text-muted">Equipment Type</th>
                      <th className="text-left p-3 text-mission-text-muted">Standard</th>
                      <th className="text-left p-3 text-mission-text-muted">Interval</th>
                      <th className="text-left p-3 text-mission-text-muted">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mission-border">
                    <tr>
                      <td className="p-3 text-mission-text-secondary">SCBA Units</td>
                      <td className="p-3 text-mission-text-muted">NFPA 1852</td>
                      <td className="p-3 text-mission-text-muted">Annual</td>
                      <td className="p-3 text-mission-text-muted">Flow Test</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-mission-text-secondary">Turnout Gear</td>
                      <td className="p-3 text-mission-text-muted">NFPA 1851</td>
                      <td className="p-3 text-mission-text-muted">Annual</td>
                      <td className="p-3 text-mission-text-muted">Advanced Inspection</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-mission-text-secondary">Fire Hose</td>
                      <td className="p-3 text-mission-text-muted">NFPA 1962</td>
                      <td className="p-3 text-mission-text-muted">Annual</td>
                      <td className="p-3 text-mission-text-muted">Pressure Test</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-mission-text-secondary">Air Cylinders</td>
                      <td className="p-3 text-mission-text-muted">DOT/NFPA 1852</td>
                      <td className="p-3 text-mission-text-muted">5 Years</td>
                      <td className="p-3 text-mission-text-muted">Hydrostatic Test</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-yellow-400 mb-4">Compliance Best Practices</h3>
              <ul className="space-y-2 text-yellow-300">
                <li className="flex items-start space-x-2">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Schedule inspections before due dates to allow time for repairs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Document all inspection results, even if no issues are found</span>
                </li>
                <li className="flex items-start space-x-2">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Keep printed records as backup documentation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Train multiple personnel on inspection procedures</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'data-management':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-4">Data Management</h2>
              <p className="text-mission-text-secondary mb-6">
                Manage your data with backup, import/export capabilities, and cloud synchronization features.
              </p>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Cloud Storage & Sync</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiDatabase} className="w-5 h-5 text-mission-accent-blue mt-0.5" />
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Automatic Cloud Backup</h4>
                    <p className="text-mission-text-muted text-sm">All data is automatically saved to secure cloud storage with real-time synchronization across all devices.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiClock} className="w-5 h-5 text-mission-accent-green mt-0.5" />
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Real-time Updates</h4>
                    <p className="text-mission-text-muted text-sm">Changes made on any device are instantly reflected across all connected devices.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <SafeIcon icon={FiShield} className="w-5 h-5 text-mission-accent-orange mt-0.5" />
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Secure Storage</h4>
                    <p className="text-mission-text-muted text-sm">Data is encrypted in transit and at rest using enterprise-grade security protocols.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">Data Export & Import</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-mission-accent-blue mb-3">Export Options</h4>
                  <ul className="space-y-2 text-mission-text-muted text-sm">
                    <li className="flex items-center space-x-2">
                      <SafeIcon icon={FiDownload} className="w-4 h-4 text-mission-accent-blue" />
                      <span>Complete data backup (JSON format)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <SafeIcon icon={FiDownload} className="w-4 h-4 text-mission-accent-blue" />
                      <span>Equipment reports (PDF)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <SafeIcon icon={FiDownload} className="w-4 h-4 text-mission-accent-blue" />
                      <span>Inspection checklists (PDF)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-mission-accent-green mb-3">Import Options</h4>
                  <ul className="space-y-2 text-mission-text-muted text-sm">
                    <li className="flex items-center space-x-2">
                      <SafeIcon icon={FiUpload} className="w-4 h-4 text-mission-accent-green" />
                      <span>Restore from backup (JSON format)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <SafeIcon icon={FiUpload} className="w-4 h-4 text-mission-accent-green" />
                      <span>Bulk equipment import (CSV)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <SafeIcon icon={FiUpload} className="w-4 h-4 text-mission-accent-green" />
                      <span>Migration from other systems</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-4">How to Export Data</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="bg-mission-accent-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Navigate to Settings</h4>
                    <p className="text-mission-text-muted text-sm">Click "Settings" in the sidebar navigation.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-mission-accent-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Select Data Management Tab</h4>
                    <p className="text-mission-text-muted text-sm">Click on the "Data Management" tab in the settings page.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-mission-accent-blue text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <h4 className="font-medium text-mission-text-primary">Click Export Data</h4>
                    <p className="text-mission-text-muted text-sm">Choose "Export Data" to download a complete backup of all your information.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6">
              <h3 className="text-lg font-inter-tight font-semibold text-yellow-400 mb-4">Data Management Best Practices</h3>
              <ul className="space-y-2 text-yellow-300">
                <li className="flex items-start space-x-2">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Export data regularly as additional backup</span>
                </li>
                <li className="flex items-start space-x-2">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Store backup files in multiple secure locations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Test import functionality before relying on backups</span>
                </li>
                <li className="flex items-start space-x-2">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Coordinate data exports with your IT department</span>
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
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