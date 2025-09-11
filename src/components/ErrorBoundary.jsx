import React from 'react'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiAlertTriangle, FiRefreshCw, FiHome } = FiIcons

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error for debugging
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // Track error in analytics if available
    if (window.analytics) {
      window.analytics.trackError(error, {
        context: 'error_boundary',
        componentStack: errorInfo.componentStack,
        errorBoundary: this.props.name || 'unknown'
      })
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/app'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-mission-bg-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-mission-bg-secondary border border-mission-border rounded-lg p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-red-600 rounded-lg mx-auto mb-6">
              <SafeIcon icon={FiAlertTriangle} className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-inter-tight font-bold text-mission-text-primary mb-4">
              Something went wrong
            </h1>
            
            <p className="text-mission-text-secondary mb-6">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="text-left mb-6 bg-mission-bg-primary p-4 rounded border border-mission-border">
                <summary className="text-mission-text-primary font-medium cursor-pointer mb-2">
                  Error Details (Development Mode)
                </summary>
                <div className="text-xs font-mono text-mission-text-muted space-y-2">
                  <div>
                    <strong>Error:</strong> {this.state.error?.toString()}
                  </div>
                  <div>
                    <strong>Component:</strong> {this.props.name || 'Unknown'}
                  </div>
                  <div>
                    <strong>Retry Count:</strong> {this.state.retryCount}
                  </div>
                  {this.state.error?.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1 max-h-32 overflow-y-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-3">
              {this.state.retryCount < 3 && (
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              )}
              
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center space-x-2 border border-mission-border hover:bg-mission-bg-primary text-mission-text-primary px-4 py-3 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center space-x-2 border border-mission-border hover:bg-mission-bg-primary text-mission-text-primary px-4 py-3 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiHome} className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>
            </div>

            <p className="text-xs text-mission-text-muted mt-6">
              Error ID: {Date.now()}
              {this.state.retryCount > 0 && ` (Attempt ${this.state.retryCount + 1})`}
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary