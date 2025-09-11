import React from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import LoadingScreen from './LoadingScreen'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiAlertTriangle, FiRefreshCw } = FiIcons

const DataLoadingWrapper = ({ children, requiresData = false }) => {
  const { loading, error, refreshData } = useData()
  const { user, department, loading: authLoading } = useAuth()

  // Show loading screen while auth is loading
  if (authLoading) {
    return <LoadingScreen message="Authenticating..." />
  }

  // Show loading screen while data is loading
  if (loading) {
    return <LoadingScreen message="Loading your data..." />
  }

  // Show error state if there's an error and we require data
  if (error && requiresData) {
    return (
      <div className="min-h-screen bg-mission-bg-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-mission-bg-secondary border border-mission-border rounded-lg p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-600 rounded-lg mx-auto mb-6">
            <SafeIcon icon={FiAlertTriangle} className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-4">
            Data Loading Error
          </h2>
          
          <p className="text-mission-text-secondary mb-6">
            We couldn't load your data. This might be a temporary connection issue.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={refreshData}
              className="w-full flex items-center justify-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-4 py-3 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
              <span>Retry Loading Data</span>
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center space-x-2 border border-mission-border hover:bg-mission-bg-primary text-mission-text-primary px-4 py-3 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-6 text-left">
              <summary className="text-mission-text-muted cursor-pointer">
                Error Details
              </summary>
              <pre className="mt-2 p-2 bg-mission-bg-primary rounded text-xs text-mission-text-muted overflow-auto">
                {error.message || error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  // Show no access message if user doesn't have department
  if (user && !department) {
    return (
      <div className="min-h-screen bg-mission-bg-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-mission-bg-secondary border border-mission-border rounded-lg p-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-yellow-600 rounded-lg mx-auto mb-6">
            <SafeIcon icon={FiAlertTriangle} className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-4">
            Setup Required
          </h2>
          
          <p className="text-mission-text-secondary mb-6">
            Your account needs to be set up. Please complete the signup process.
          </p>
          
          <button
            onClick={() => window.location.href = '/signup'}
            className="w-full bg-fire-red hover:bg-fire-red-dark text-white px-4 py-3 rounded-lg transition-colors"
          >
            Complete Setup
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default DataLoadingWrapper