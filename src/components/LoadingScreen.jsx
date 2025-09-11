import React from 'react'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiLoader } = FiIcons

const LoadingScreen = ({ message = 'Loading...', fullScreen = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`flex items-center justify-center bg-fire-red rounded-lg mission-glow-red ${sizeClasses[size]}`}>
        <SafeIcon icon="ShieldCheck" className="w-8 h-8 text-white" />
      </div>
      <div className="flex items-center space-x-3">
        <SafeIcon icon={FiLoader} className="w-6 h-6 text-fire-red animate-spin" />
        <span className="text-lg font-inter text-mission-text-primary">{message}</span>
      </div>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-fire-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-fire-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-fire-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-mission-bg-primary flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

export default LoadingScreen