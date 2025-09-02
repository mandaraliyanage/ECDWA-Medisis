import React from 'react';

const DashboardView = ({ stats, alerts, onNavigate, patients }) => {
  // Calculate stats from patients data as fallback
  const totalPatients = patients?.length || 0;
  const activePatients = patients?.filter(p => p.connection_status === 'Online').length || 0;
  const criticalAlertsToday = patients?.filter(p => 
    p.heart_rate < 50 || p.heart_rate > 120 || p.oxygen_level < 90
  ).length || 0;
  const unresolvedAlerts = alerts?.filter(alert => !alert.resolved).length || 0;
  
  const avgHeartRate = patients?.length > 0 
    ? Math.round(patients.reduce((sum, p) => sum + (p.heart_rate || 0), 0) / patients.length)
    : 0;
  const avgOxygenLevel = patients?.length > 0
    ? Math.round(patients.reduce((sum, p) => sum + (p.oxygen_level || 0), 0) / patients.length)
    : 0;

  return (
    <div className="dashboard-view">
      <h2>Dashboard</h2>
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card" onClick={() => onNavigate && onNavigate('patients')}>
            <h3>Total Patients</h3>
            <p>{stats?.total_patients || totalPatients}</p>
          </div>
          <div className="stat-card">
            <h3>Active Patients</h3>
            <p>{stats?.active_patients || activePatients}</p>
          </div>
          <div className="stat-card" onClick={() => onNavigate && onNavigate('alerts')}>
            <h3>Critical Alerts Today</h3>
            <p>{stats?.critical_alerts_today || criticalAlertsToday}</p>
          </div>
          <div className="stat-card">
            <h3>Unresolved Alerts</h3>
            <p>{stats?.unresolved_alerts || unresolvedAlerts}</p>
          </div>
        </div>
        
        <div className="additional-stats">
          <div className="stat-row">
            <div className="stat-item">
              <span className="stat-label">Avg Heart Rate Today:</span>
              <span className="stat-value">{stats?.avg_heart_rate_today || avgHeartRate} bpm</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Oxygen Level Today:</span>
              <span className="stat-value">{stats?.avg_oxygen_level_today || avgOxygenLevel}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Alerts Today:</span>
              <span className="stat-value">{stats?.total_alerts_today || alerts?.length || 0}</span>
            </div>
          </div>
        </div>
        
        {stats?.critical_alerts_today > 0 && (
          <div className="critical-alerts-section">
            <h3>⚠️ Critical Alerts Today</h3>
            <div className="alert-summary">
              <p>{stats.critical_alerts_today} critical alert(s) detected today</p>
              <button 
                className="view-alerts-btn"
                onClick={() => onNavigate && onNavigate('alerts')}
              >
                View All Alerts
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;