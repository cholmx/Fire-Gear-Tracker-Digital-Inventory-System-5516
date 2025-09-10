import React, { useState } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import SafeIcon from '../common/SafeIcon';
import Modal from './Modal';
import * as FiIcons from 'react-icons/fi';

const { FiDatabase, FiSettings, FiPlay, FiServer, FiCode } = FiIcons;

const DatabaseSetup = () => {
  const { isConnected, initializeDatabase } = useDatabase();
  const [showSetup, setShowSetup] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);

  const handleSetup = async () => {
    setSetupLoading(true);
    try {
      const success = await initializeDatabase();
      if (success) {
        setShowSetup(false);
        alert('Supabase database initialized successfully!');
      } else {
        alert('Failed to initialize database. Please connect your Supabase project in the Quest environment first.');
      }
    } catch (error) {
      alert('Setup failed: ' + error.message);
    } finally {
      setSetupLoading(false);
    }
  };

  if (isConnected) {
    return null; // Don't show setup if already connected
  }

  return (
    <>
      <button
        onClick={() => setShowSetup(true)}
        className="flex items-center space-x-2 bg-mission-accent-blue hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors"
      >
        <SafeIcon icon={FiDatabase} className="w-4 h-4" />
        <span className="text-sm font-inter">Setup Database</span>
      </button>

      <Modal
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
        title="Supabase Database Setup"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-mission-bg-tertiary rounded-lg p-4">
            <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-2">
              Supabase Integration
            </h3>
            <p className="text-mission-text-secondary mb-4">
              Your Fire Gear Tracker is configured to connect to Supabase for secure, scalable database management.
            </p>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="bg-fire-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p className="font-medium text-mission-text-primary">Connect Supabase Project</p>
                  <p className="text-mission-text-muted">Link your Supabase project to enable database functionality</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="bg-fire-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <p className="font-medium text-mission-text-primary">Initialize Database Schema</p>
                  <p className="text-mission-text-muted">Create tables for stations, equipment, and inspections</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="bg-fire-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <p className="font-medium text-mission-text-primary">Configure Security</p>
                  <p className="text-mission-text-muted">Set up Row Level Security (RLS) policies for data protection</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="bg-fire-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                <div>
                  <p className="font-medium text-mission-text-primary">Real-time Sync</p>
                  <p className="text-mission-text-muted">Enable real-time updates across all devices and users</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <SafeIcon icon={FiServer} className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-medium">Supabase Benefits</h4>
                <ul className="text-blue-300 text-sm mt-1 space-y-1">
                  <li>• Real-time database with PostgreSQL</li>
                  <li>• Built-in authentication and authorization</li>
                  <li>• Automatic API generation</li>
                  <li>• Row Level Security (RLS)</li>
                  <li>• Edge functions and storage</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-mission-bg-tertiary rounded-lg p-4">
            <h4 className="text-mission-text-primary font-medium mb-2 flex items-center">
              <SafeIcon icon={FiCode} className="w-4 h-4 mr-2" />
              Database Schema Preview
            </h4>
            <div className="text-xs font-mono bg-mission-bg-primary p-3 rounded overflow-x-auto">
              <div className="text-green-400">-- Fire Gear Tracker Tables</div>
              <div className="text-mission-text-muted">stations_fd2024 (id, name, address, phone)</div>
              <div className="text-mission-text-muted">equipment_fd2024 (id, name, serial_number, category, status)</div>
              <div className="text-mission-text-muted">inspections_fd2024 (id, name, due_date, status)</div>
              <br />
              <div className="text-green-400">-- Security & Performance</div>
              <div className="text-mission-text-muted">✓ Row Level Security enabled</div>
              <div className="text-mission-text-muted">✓ Optimized indexes</div>
              <div className="text-mission-text-muted">✓ Foreign key constraints</div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <SafeIcon icon={FiSettings} className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-medium">Setup Requirements</h4>
                <p className="text-yellow-300 text-sm mt-1">
                  This is a demo version. To enable Supabase functionality, you need to connect your Supabase project 
                  in the Quest environment. The app will continue to work with local storage for demonstration purposes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowSetup(false)}
              className="px-4 py-2 text-mission-text-muted hover:text-mission-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSetup}
              disabled={setupLoading}
              className="flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={FiPlay} className="w-4 h-4" />
              <span>{setupLoading ? 'Initializing...' : 'Initialize Database'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DatabaseSetup;