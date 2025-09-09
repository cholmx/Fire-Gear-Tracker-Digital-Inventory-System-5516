import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiPackage, FiCheckSquare, FiMapPin, FiSettings, FiX } = FiIcons;

const navigation = [
  { name: 'Dashboard', href: '/app', icon: FiHome },
  { name: 'Equipment', href: '/app/equipment', icon: FiPackage },
  { name: 'Inspections', href: '/app/inspections', icon: FiCheckSquare },
  { name: 'Stations', href: '/app/stations', icon: FiMapPin },
  { name: 'Settings', href: '/app/settings', icon: FiSettings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href) => {
    navigate(href);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          w-60 bg-mission-bg-secondary border-r border-mission-border
          transform transition-transform duration-300 ease-in-out flex-shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto
        `}
      >
        <div className="p-4 h-full">
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-md hover:bg-mission-bg-primary transition-colors lg:hidden"
          >
            <SafeIcon icon={FiX} className="w-4 h-4 text-mission-text-muted" />
          </button>

          {/* Navigation */}
          <nav className="space-y-2 mt-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-inter font-medium transition-all duration-200 text-left
                    ${
                      isActive
                        ? 'bg-fire-red text-white mission-glow-red'
                        : 'bg-transparent text-mission-text-secondary hover:bg-fire-red hover:text-white'
                    }
                  `}
                >
                  <SafeIcon icon={item.icon} className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;