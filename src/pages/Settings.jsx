import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiCreditCard, FiDownload, FiUpload, FiTrash2, FiCheck } = FiIcons;

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'subscription', name: 'Subscription', icon: FiCreditCard },
    { id: 'data', name: 'Data Management', icon: FiDownload },
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: ['1 Station', '50 Equipment pieces', 'Basic support'],
      current: user?.plan === 'Free'
    },
    {
      name: 'Professional',
      price: '$12',
      period: '/month',
      yearlyPrice: '$120/year (save $24)',
      features: ['3 Stations', '300 Equipment pieces', 'Priority support', 'Advanced reporting'],
      current: user?.plan === 'Professional'
    },
    {
      name: 'Enterprise',
      price: '$24',
      period: '/month',
      yearlyPrice: '$240/year (save $48)',
      features: ['Unlimited Stations', 'Unlimited Equipment', 'Premium support', 'Custom integrations'],
      current: user?.plan === 'Enterprise'
    }
  ];

  const handleExportData = () => {
    // Mock export functionality
    const data = {
      stations: JSON.parse(localStorage.getItem('fire-gear-stations') || '[]'),
      equipment: JSON.parse(localStorage.getItem('fire-gear-equipment') || '[]'),
      inspections: JSON.parse(localStorage.getItem('fire-gear-inspections') || '[]')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fire-gear-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.stations) localStorage.setItem('fire-gear-stations', JSON.stringify(data.stations));
          if (data.equipment) localStorage.setItem('fire-gear-equipment', JSON.stringify(data.equipment));
          if (data.inspections) localStorage.setItem('fire-gear-inspections', JSON.stringify(data.inspections));
          alert('Data imported successfully! Please refresh the page.');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('fire-gear-stations');
      localStorage.removeItem('fire-gear-equipment');
      localStorage.removeItem('fire-gear-inspections');
      alert('All data cleared! Please refresh the page.');
    }
  };

  return (
    <div className="space-y-6 font-inter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-inter-tight font-bold text-mission-text-primary">Settings</h1>
        <p className="text-mission-text-muted mt-1 font-inter">Manage your account and application preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-mission-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-2 px-1 border-b-2 font-inter font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-fire-red text-fire-red'
                  : 'border-transparent text-mission-text-muted hover:text-mission-text-secondary hover:border-mission-border-light'
                }
              `}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-lg font-inter-tight font-semibold text-mission-text-primary">Profile Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={user?.department || ''}
                  className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                  Current Plan
                </label>
                <input
                  type="text"
                  value={user?.plan || ''}
                  className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
                  readOnly
                />
              </div>
            </div>
            
            <div className="pt-4">
              <p className="text-sm font-inter text-mission-text-muted">
                This is a demo application. Profile editing is not available in this version.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <h2 className="text-lg font-inter-tight font-semibold text-mission-text-primary">Subscription Plans</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`
                    relative border rounded-lg p-6 transition-colors
                    ${plan.current
                      ? 'border-fire-red bg-fire-red/10'
                      : 'border-mission-border hover:border-mission-border-light'
                    }
                  `}
                >
                  {plan.current && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-fire-red text-white px-3 py-1 rounded-full text-xs font-inter font-medium">
                        Current Plan
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl font-inter-tight font-bold text-mission-text-primary">{plan.price}</span>
                      <span className="font-inter text-mission-text-muted">{plan.period}</span>
                    </div>
                    {plan.yearlyPrice && (
                      <p className="text-sm font-inter text-mission-text-muted mt-1">{plan.yearlyPrice}</p>
                    )}
                  </div>
                  
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-400" />
                        <span className="font-inter text-mission-text-secondary text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    disabled={plan.current}
                    className={`
                      w-full mt-6 px-4 py-2 rounded-lg font-inter font-medium transition-colors
                      ${plan.current
                        ? 'bg-mission-bg-tertiary text-mission-text-muted cursor-not-allowed'
                        : 'bg-fire-red hover:bg-fire-red-dark text-white'
                      }
                    `}
                  >
                    {plan.current ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <p className="text-sm font-inter text-mission-text-muted">
                This is a demo application. Subscription management is not available in this version.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <h2 className="text-lg font-inter-tight font-semibold text-mission-text-primary">Data Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-mission-bg-tertiary rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                    <SafeIcon icon={FiDownload} className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-inter font-medium text-mission-text-primary">Export Data</h3>
                </div>
                <p className="font-inter text-mission-text-muted text-sm mb-4">
                  Download all your data as a JSON file for backup or migration purposes.
                </p>
                <button
                  onClick={handleExportData}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-inter"
                >
                  Export Data
                </button>
              </div>

              <div className="bg-mission-bg-tertiary rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-lg">
                    <SafeIcon icon={FiUpload} className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-inter font-medium text-mission-text-primary">Import Data</h3>
                </div>
                <p className="font-inter text-mission-text-muted text-sm mb-4">
                  Import data from a previously exported JSON file.
                </p>
                <label className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer inline-block text-center font-inter">
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="bg-mission-bg-tertiary rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg">
                    <SafeIcon icon={FiTrash2} className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-inter font-medium text-mission-text-primary">Clear Data</h3>
                </div>
                <p className="font-inter text-mission-text-muted text-sm mb-4">
                  Remove all stations, equipment, and inspection data. This action cannot be undone.
                </p>
                <button
                  onClick={handleClearData}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-inter"
                >
                  Clear All Data
                </button>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <h4 className="text-yellow-400 font-inter font-medium mb-2">Data Storage Notice</h4>
              <p className="text-yellow-300 text-sm font-inter">
                This demo application stores data locally in your browser. Data will be lost if you clear your browser data or use a different device. Use the export function to backup your data regularly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;