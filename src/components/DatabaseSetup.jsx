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
        alert('Database initialized successfully!');
      } else {
        alert('Failed to initialize database. Please check your backend connection.');
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
        title="PostgreSQL Database Setup"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-mission-bg-tertiary rounded-lg p-4">
            <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary mb-2">
              Direct PostgreSQL Connection
            </h3>
            <p className="text-mission-text-secondary mb-4">
              Your Fire Gear Tracker is configured to connect directly to your Neon PostgreSQL database.
            </p>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="bg-fire-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p className="font-medium text-mission-text-primary">Backend API Required</p>
                  <p className="text-mission-text-muted">Set up a Node.js/Express backend to handle database connections</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="bg-fire-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <p className="font-medium text-mission-text-primary">Database Connection</p>
                  <p className="text-mission-text-muted">Your Neon PostgreSQL connection string is configured</p>
                  <code className="block bg-mission-bg-primary p-2 rounded mt-2 text-xs font-mono break-all">
                    postgresql://neondb_owner:***@ep-holy-queen-adxl534v-pooler.c-2.us-east-1.aws.neon.tech/neondb
                  </code>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="bg-fire-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <p className="font-medium text-mission-text-primary">Database Schema</p>
                  <p className="text-mission-text-muted">Initialize tables for stations, equipment, and inspections</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <span className="bg-fire-red text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                <div>
                  <p className="font-medium text-mission-text-primary">Start Backend Server</p>
                  <p className="text-mission-text-muted">Run your backend API server to handle database operations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <SafeIcon icon={FiServer} className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-medium">Backend API Setup</h4>
                <p className="text-blue-300 text-sm mt-1">
                  Since browsers cannot directly connect to PostgreSQL, you'll need a backend API server.
                  The frontend is configured to communicate with your backend at the API endpoints.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-mission-bg-tertiary rounded-lg p-4">
            <h4 className="text-mission-text-primary font-medium mb-2 flex items-center">
              <SafeIcon icon={FiCode} className="w-4 h-4 mr-2" />
              Sample Backend Setup (Node.js/Express)
            </h4>
            <div className="text-xs font-mono bg-mission-bg-primary p-3 rounded overflow-x-auto">
              <div className="text-green-400">// Install dependencies</div>
              <div className="text-mission-text-muted">npm install express pg cors dotenv</div>
              <br />
              <div className="text-green-400">// Basic server setup</div>
              <div className="text-mission-text-muted">const express = require('express');</div>
              <div className="text-mission-text-muted">const { Pool } = require('pg');</div>
              <div className="text-mission-text-muted">const cors = require('cors');</div>
              <br />
              <div className="text-mission-text-muted">const pool = new Pool({</div>
              <div className="text-mission-text-muted ml-4">connectionString: 'your-neon-connection-string'</div>
              <div className="text-mission-text-muted">});</div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <SafeIcon icon={FiSettings} className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-medium">Current Status</h4>
                <p className="text-yellow-300 text-sm mt-1">
                  The application is currently using local storage as fallback.
                  Once your backend API is running, the database connection will be established automatically.
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
              <span>{setupLoading ? 'Connecting...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DatabaseSetup;