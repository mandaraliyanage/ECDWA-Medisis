import React from 'react';
import { useAppContext } from '../../context/AppContext';

const AlertsView = ({ alerts }) => {
  const { loading, refreshData } = useAppContext();

  if (loading) {
    return (
      <div className="alerts-view">
        <h2>Alerts</h2>
        <div className="alerts-content">
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  const criticalAlerts = alerts?.filter(alert => alert.severity_level === 'high') || [];
  const unresolvedAlerts = alerts?.filter(alert => !alert.resolved) || [];

  return (
    <div className="alerts-view">
      <div className="alerts-header">
        <h2>Alerts ({alerts?.length || 0})</h2>
        <button onClick={refreshData} className="refresh-btn">
          Refresh
        </button>
      </div>
      
      <div className="alerts-summary">
        <div className="alert-stat">
          <span className="stat-label">Critical:</span>
          <span className="stat-value critical">{criticalAlerts.length}</span>
        </div>
        <div className="alert-stat">
          <span className="stat-label">Unresolved:</span>
          <span className="stat-value warning">{unresolvedAlerts.length}</span>
        </div>
        <div className="alert-stat">
          <span className="stat-label">Total Today:</span>
          <span className="stat-value">{alerts?.length || 0}</span>
        </div>
      </div>

      <div className="alerts-content">
        {!alerts || alerts.length === 0 ? (
          <div className="no-alerts">
            <p>No alerts at this time.</p>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.map(alert => (
              <div 
                key={alert.alert_id} 
                className={`alert-item ${alert.severity_level} ${alert.resolved ? 'resolved' : 'unresolved'}`}
              >
                <div className="alert-header">
                  <div className="alert-info">
                    <span className="patient-id">{alert.patient_id}</span>
                    <span className="patient-name">{alert.patient_name}</span>
                    <span className={`severity-badge ${alert.severity_level}`}>
                      {alert.severity_level}
                    </span>
                  </div>
                  <div className="alert-time">
                    {new Date(alert.datetime).toLocaleString()}
                  </div>
                </div>
                <div className="alert-body">
                  <div className="issue-detected">{alert.issue_detected}</div>
                  {alert.message && (
                    <div className="alert-message">{alert.message}</div>
                  )}
                </div>
                <div className="alert-status">
                  {alert.resolved ? (
                    <span className="status-resolved">✓ Resolved</span>
                  ) : (
                    <span className="status-unresolved">⚠ Unresolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsView;