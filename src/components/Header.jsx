import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import SafeIcon from '../common/SafeIcon'
import DatabaseStatus from './DatabaseStatus'
import * as FiIcons from 'react-icons/fi'

const { FiMenu, FiUser, FiSettings, FiLogOut, FiMoreHorizontal } = FiIcons

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      setDropdownOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-mission-bg-secondary/95 backdrop-blur-sm border-b border-mission-border px-4 py-3 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-mission-bg-tertiary transition-colors"
          >
            <SafeIcon icon={FiMenu} className="w-5 h-5 text-mission-text-secondary" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-fire-red rounded-md mission-glow-red">
              <SafeIcon icon="ShieldCheck" className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-base font-inter-tight font-bold text-mission-text-primary">
              Fire Gear Tracker
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Database Status */}
          <div className="hidden sm:flex items-center">
            <DatabaseStatus />
          </div>

          {/* System Status */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="status-dot status-success w-2 h-2 bg-mission-accent-green rounded-full" />
            <span className="text-sm font-roboto-mono text-mission-text-muted">
              SYSTEM ONLINE
            </span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-mission-bg-tertiary transition-colors"
            >
              <div className="flex items-center justify-center w-7 h-7 bg-mission-bg-tertiary rounded-md">
                <SafeIcon icon={FiUser} className="w-4 h-4 text-mission-text-secondary" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-inter font-medium text-mission-text-primary">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.name}
                </div>
              </div>
              <SafeIcon icon={FiMoreHorizontal} className="w-4 h-4 text-mission-text-muted" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-mission-bg-tertiary border border-mission-border rounded-md shadow-xl py-1">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-mission-border">
                  <div className="text-sm font-inter font-medium text-mission-text-primary">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.name}
                  </div>
                  <div className="text-xs text-mission-text-muted">
                    {user?.email}
                  </div>
                  {user?.department && (
                    <div className="text-xs text-mission-text-muted mt-1">
                      {user.department}
                    </div>
                  )}
                </div>

                {/* Database Status in Mobile */}
                <div className="sm:hidden px-4 py-3 border-b border-mission-border">
                  <div className="text-xs font-roboto-mono text-mission-text-muted mb-2 uppercase">
                    Database Status
                  </div>
                  <DatabaseStatus />
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-mission-bg-primary transition-colors"
                >
                  <SafeIcon icon={FiSettings} className="w-4 h-4 text-mission-text-muted" />
                  <span className="font-inter text-mission-text-secondary">Settings</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:bg-mission-bg-primary transition-colors text-red-400"
                >
                  <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                  <span className="font-inter">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header