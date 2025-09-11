import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useDatabase } from '../contexts/DatabaseContext'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiCreditCard, FiDownload, FiUpload, FiTrash2, FiCheck, FiDatabase } = FiIcons

const Settings = () => {
  const { user } = useAuth()
  const { query } = useDatabase()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'database', name: 'Database', icon: FiDatabase },
    { id: 'subscription', name: 'Subscription', icon: FiCreditCard },
    { id: 'data', name: 'Data Management', icon: FiDownload },
  ]

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
      yearlyPrice: '$120/year (same price)',
      features: ['3 Stations', '300 Equipment pieces', 'Priority support', 'Advanced reporting'],
      current: user?.plan === 'Professional'
    },
    {
      name: 'Unlimited',
      price: '$24',
      period: '/month',
      yearlyPrice: '$240/year (same price)',
      features: ['Unlimited Stations', 'Unlimited Equipment', 'Premium support', 'Custom integrations'],
      current: user?.plan === 'Unlimited'
    }
  ]

  const handleExportData = async () => {
    try {
      const [stations, equipment, inspections, vendors] = await Promise.all([
        query('stations'),
        query('equipment'),
        query('inspections'),
        query('vendors')
      ])

      const data = {
        stations,
        equipment,
        inspections,
        vendors,
        exported_at: new Date().toISOString(),
        database_source: 'supabase'
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fire-gear-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Error exporting data. Please try again.')
    }
  }

  return (
    <div className="space-y-6 font-inter p-6">
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
                Connected to Supabase database. Profile information is managed through authentication.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            <h2 className="text-lg font-inter-tight font-semibold text-mission-text-primary">Database Connection</h2>
            
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <SafeIcon icon={FiDatabase} className="w-6 h-6 text-green-400" />
                <h3 className="text-green-400 font-medium">Supabase Connected</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-green-300">
                  <strong>Database:</strong> PostgreSQL on Supabase
                </p>
                <p className="text-green-300">
                  <strong>Project:</strong> xibhmevisztsdlpueutj.supabase.co
                </p>
                <p className="text-green-300">
                  <strong>Status:</strong> Connected and operational
                </p>
                <p className="text-green-300">
                  <strong>Features:</strong> Real-time sync, automatic backups, multi-user support
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-mission-bg-tertiary rounded-lg p-4">
                <h4 className="font-medium text-mission-text-primary mb-2">Real-time Sync</h4>
                <p className="text-sm text-mission-text-muted">
                  Changes are synchronized across all devices in real-time using Supabase's real-time engine.
                </p>
              </div>
              <div className="bg-mission-bg-tertiary rounded-lg p-4">
                <h4 className="font-medium text-mission-text-primary mb-2">Automatic Backups</h4>
                <p className="text-sm text-mission-text-muted">
                  Your data is automatically backed up by Supabase with point-in-time recovery available.
                </p>
              </div>
              <div className="bg-mission-bg-tertiary rounded-lg p-4">
                <h4 className="font-medium text-mission-text-primary mb-2">Cloud Storage</h4>
                <p className="text-sm text-mission-text-muted">
                  All data is stored securely in the cloud with enterprise-grade security and encryption.
                </p>
              </div>
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
                Subscription management is handled through Supabase. Contact support for billing inquiries.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <h2 className="text-lg font-inter-tight font-semibold text-mission-text-primary">Data Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-mission-bg-tertiary rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                    <SafeIcon icon={FiDownload} className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-inter font-medium text-mission-text-primary">Export Data</h3>
                </div>
                <p className="font-inter text-mission-text-muted text-sm mb-4">
                  Download all your data from the Supabase database as a JSON file for backup or migration purposes.
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
                    <SafeIcon icon={FiDatabase} className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-inter font-medium text-mission-text-primary">Database Info</h3>
                </div>
                <p className="font-inter text-mission-text-muted text-sm mb-4">
                  Your data is stored securely in Supabase with automatic backups and real-time synchronization.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-mission-text-secondary">
                    <strong>Database:</strong> PostgreSQL
                  </p>
                  <p className="text-mission-text-secondary">
                    <strong>Backups:</strong> Automatic daily backups
                  </p>
                  <p className="text-mission-text-secondary">
                    <strong>Sync:</strong> Real-time across devices
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <h4 className="text-blue-400 font-inter font-medium mb-2">Supabase Database</h4>
              <p className="text-blue-300 text-sm font-inter">
                Your data is stored in a secure PostgreSQL database hosted by Supabase. All data is automatically backed up 
                and synchronized in real-time across all your devices. You can export your data at any time for backup purposes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings