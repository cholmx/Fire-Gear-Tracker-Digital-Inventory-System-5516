import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../lib/api';

const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to connect to the backend API
      await apiClient.checkDatabaseConnection();
      setIsConnected(true);
      console.log('Database connected successfully via API');
      
    } catch (err) {
      console.log('Database connection failed:', err.message);
      setIsConnected(false);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDatabase = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize database tables through API
      await apiClient.request('/setup/initialize', {
        method: 'POST'
      });
      
      setIsConnected(true);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isConnected,
    isLoading,
    error,
    checkConnection,
    initializeDatabase
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};