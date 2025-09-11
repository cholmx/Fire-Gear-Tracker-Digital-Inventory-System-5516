import React, { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } = FiIcons

const Login = () => {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to="/app" />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await login(email, password)
      if (result.success) {
        navigate('/app')
      } else {
        setError(result.error?.message || 'Invalid email or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-mission-bg-primary font-inter flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-mission-bg-secondary border border-mission-border rounded-lg shadow-xl p-8">
          {/* Back to home button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-mission-text-muted hover:text-mission-text-primary transition-colors mb-6 font-inter"
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
            <span>Back to home</span>
          </button>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-fire-red rounded-lg mx-auto mb-4">
              <SafeIcon icon="ShieldCheck" className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-inter-tight font-bold text-mission-text-primary">Fire Gear Tracker</h1>
            <p className="text-mission-text-muted mt-2 font-inter">Sign in to manage your equipment</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mission-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
                  placeholder="your.email@department.gov"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mission-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
                  placeholder="Your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mission-text-muted hover:text-mission-text-secondary"
                >
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-3 font-inter">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-fire-red hover:bg-fire-red-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-inter font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-mission-text-muted text-sm font-inter mb-3">
              Don't have an account?{' '}
              <Link to="/signup" className="text-fire-red hover:text-fire-red-light font-medium">
                Sign up
              </Link>
            </p>
            
            <div className="text-xs text-mission-text-muted">
              <Link to="/reset-password" className="hover:text-mission-text-secondary">
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login