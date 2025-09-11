import React from 'react'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiLoader } = FiIcons

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  showText = true,
  className = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl'
  }

  const spinner = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        <SafeIcon 
          icon={FiLoader} 
          className={`${sizeClasses[size]} text-fire-red animate-spin`} 
        />
        <div className="absolute inset-0 rounded-full border-2 border-fire-red/20 animate-pulse" />
      </div>
      {showText && (
        <p className={`${textSizeClasses[size]} font-inter text-mission-text-secondary animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-mission-bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-8">
          {spinner}
        </div>
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner