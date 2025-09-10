import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

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
      
      // Test Supabase connection
      const { data, error } = await supabase
        .from('stations_fd2024')
        .select('count', { count: 'exact', head: true });
      
      if (error && error.code === '42P01') {
        // Table doesn't exist yet - that's okay, we can still connect
        setIsConnected(true);
        console.log('Supabase connected - database needs initialization');
      } else if (error) {
        throw error;
      } else {
        setIsConnected(true);
        console.log('Supabase connected successfully');
      }
    } catch (err) {
      console.log('Supabase connection failed:', err.message);
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
      
      // This would typically run SQL to create tables
      // For now, we'll just mark as successful
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