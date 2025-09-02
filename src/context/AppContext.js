import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPatients, getAlerts, getDashboardStats } from '../services/api';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const useApp = useAppContext;

export const AppProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching data...');
      
      const patientsData = await getPatients();
      console.log('Patients data:', patientsData);
      setPatients(patientsData);
      
      try {
        const alertsData = await getAlerts();
        console.log('Alerts data:', alertsData);
        setAlerts(alertsData);
      } catch (alertError) {
        console.warn('Failed to fetch alerts:', alertError);
        setAlerts([]);
      }
      
      try {
        const statsData = await getDashboardStats();
        console.log('Stats data:', statsData);
        setStats(statsData);
      } catch (statsError) {
        console.warn('Failed to fetch stats, calculating from patients:', statsError);
        // Calculate stats from patients data as fallback
        const totalPatients = patientsData.length;
        const activePatients = patientsData.filter(p => p.connection_status === 'Online').length;
        const criticalAlertsToday = patientsData.filter(p => 
          p.heart_rate < 50 || p.heart_rate > 120 || p.oxygen_level < 90
        ).length;
        
        setStats({
          total_patients: totalPatients,
          active_patients: activePatients,
          critical_alerts_today: criticalAlertsToday,
          unresolved_alerts: criticalAlertsToday,
          avg_heart_rate_today: Math.round(patientsData.reduce((sum, p) => sum + (p.heart_rate || 0), 0) / totalPatients),
          avg_oxygen_level_today: Math.round(patientsData.reduce((sum, p) => sum + (p.oxygen_level || 0), 0) / totalPatients),
          total_alerts_today: criticalAlertsToday
        });
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const value = {
    patients,
    alerts,
    stats,
    loading,
    error,
    clearError,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;