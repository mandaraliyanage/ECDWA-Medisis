import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('connecting');
      
      const [patientsRes, alertsRes, statsRes] = await Promise.all([
        api.getPatients(),
        api.getAlerts(),
        api.getDashboardStats()
      ]);

      setPatients(patientsRes.patients || []);
      setAlerts(alertsRes.alerts || []);
      setStats(statsRes.stats || {});
      setLastUpdated(new Date());
      setConnectionStatus('connected');
    } catch (err) {
      setError(err.message);
      setConnectionStatus('error');
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendTelemetry = async (data) => {
    try {
      const response = await api.sendTelemetry(data);
      // Refresh data after successful telemetry
      setTimeout(fetchAllData, 1000);
      return response;
    } catch (error) {
      console.error('Failed to send telemetry:', error);
      throw error;
    }
  };

  const refreshData = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-refresh data every 30 seconds when connected
  useEffect(() => {
    if (connectionStatus === 'connected') {
      const interval = setInterval(fetchAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [connectionStatus, fetchAllData]);

  const value = {
    // Data
    patients,
    alerts,
    stats,
    
    // UI State
    loading,
    error,
    lastUpdated,
    connectionStatus,
    
    // Actions
    fetchAllData,
    sendTelemetry,
    refreshData,
    clearError,
    setError
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;