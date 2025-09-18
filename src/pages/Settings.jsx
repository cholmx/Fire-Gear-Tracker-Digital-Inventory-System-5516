import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useDatabase } from '../contexts/DatabaseContext'
import { stripeService, STRIPE_PLANS } from '../lib/stripe'
import SubscriptionManager from '../components/SubscriptionManager'
import useSubscription from '../hooks/useSubscription'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUser, FiCreditCard, FiDownload, FiUpload, FiTrash2, FiCheck, FiDatabase } = FiIcons

const Settings = () => {
  const { user } = useAuth()
  const { query } = useDatabase()
  const subscription = useSubscription()
  const [activeTab, setActiveTab] = useState('profile')
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FiUser },
    { id: 'database', name: 'Database', icon: FiDatabase },
    { id: 'subscription', name: 'Subscription', icon: FiCreditCard },
    { id: 'data', name: 'Data Management', icon: FiDownload },
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

  const handleManageBilling = async () => {
    setShowSubscriptionModal(true)
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
            {/* Current Plan Overview */}
            <div className="bg-mission-bg-tertiary rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-inter-tight font-bold text-mission-text-primary">
                    {subscription.currentPlan.name} Plan
                  </h3>
                  <p className="text-mission-text-secondary">
                    {subscription.currentPlan.monthlyPrice === 0 
                      ? 'Free forever' 
                      : `${stripeService.formatPrice(subscription.currentPlan.monthlyPrice)}/month`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-xs font-roboto-mono font-medium ${
                    subscription.isSubscriptionActive 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {subscription.isSubscriptionActive ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                  {subscription.daysUntilTrialEnd !== null && (
                    <p className="text-xs text-mission-text-muted mt-1">
                      Trial ends in {subscription.daysUntilTrialEnd} days
                    </p>
                  )}
                </div>
              </div>

              {/* Usage Overview */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {Object.entries(subscription.usage).map(([resource, count]) => {
                  const limit = subscription.limits[resource]
                  const percentage = limit === Infinity ? 0 : (count / limit) * 100
                  
                  return (
                    <div key={resource} className="text-center">
                      <div className="text-lg font-roboto-mono font-bold text-mission-text-primary">
                        {count}
                        {limit !== Infinity && (
                          <span className="text-mission-text-muted">/{limit}</span>
                        )}
                      </div>
                      <div className="text-xs text-mission-text-muted capitalize">
                        {resource}
                      </div>
                      {limit !== Infinity && (
                        <div className="mt-1 w-full bg-mission-bg-primary rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full ${
                              percentage >= 90 ? 'bg-red-600' : 
                              percentage >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {subscription.canUpgrade && (
                <button
                  onClick={handleManageBilling}
                  className="w-full bg-fire-red hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors font-inter font-medium"
                >
                  Upgrade Plan
                </button>
              )}
            </div>

            {/* Usage Warnings */}
            {subscription.getUsageWarnings().length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-inter-tight font-medium text-mission-text-primary">
                  Usage Alerts
                </h3>
                {subscription.getUsageWarnings().map((warning) => (
                  <div 
                    key={warning.resource}
                    className={`p-4 rounded-lg border ${
                      warning.severity === 'critical' 
                        ? 'bg-red-950/20 border-red-800' 
                        : 'bg-yellow-900/20 border-yellow-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-medium ${
                          warning.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {warning.resource.charAt(0).toUpperCase() + warning.resource.slice(1)} Limit
                        </h4>
                        <p className={`text-sm ${
                          warning.severity === 'critical' ? 'text-red-300' : 'text-yellow-300'
                        }`}>
                          Using {warning.count} of {warning.limit} ({warning.percentage}%)
                        </p>
                      </div>
                      {subscription.canUpgrade && (
                        <button
                          onClick={handleManageBilling}
                          className="text-xs bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1 rounded transition-colors"
                        >
                          Upgrade
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Billing Management */}
            <div className="bg-mission-bg-tertiary rounded-lg p-4">
              <h3 className="text-base font-inter-tight font-medium text-mission-text-primary mb-3">
                Billing Management
              </h3>
              <p className="text-mission-text-muted text-sm mb-4">
                Manage your subscription, view invoices, and update payment methods through Stripe's secure billing portal.
              </p>
              <button
                onClick={handleManageBilling}
                className="flex items-center space-x-2 bg-mission-accent-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiCreditCard} className="w-4 h-4" />
                <span>Manage Subscription</span>
              </button>
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

      <SubscriptionManager 
        showUpgradeModal={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  )
}

export default Settings