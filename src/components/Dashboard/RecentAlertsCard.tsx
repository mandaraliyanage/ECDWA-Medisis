import React from 'react';
import { getTimeAgo } from '../../utils/dateUtils';
import { getSeverityBadgeClass } from '../../utils/helpers';

const RecentAlertsCard = ({ alerts, maxDisplay = 5, onViewAll }) => {
  const criticalAlerts = alerts
    .filter(alert => alert.severity_level === 'high')
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    .slice(0, maxDisplay);

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-exclamation-triangle text-danger me-2" aria-hidden="true"></i>
          Recent Critical Alerts
        </h5>
        <div>
          <span className="badge bg-danger me-2">{criticalAlerts.length}</span>
          {onViewAll && (
            <button className="btn btn-sm btn-outline-primary" onClick={onViewAll}>
              View All
            </button>
          )}
        </div>
      </div>
      
      <div className="card-body">
        {criticalAlerts.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table table-hover table-sm">
                <thead>
                  <tr>
                    <th scope="col">Patient</th>
                    <th scope="col">Issue</th>
                    <th scope="col">Time</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalAlerts.map(alert => (
                    <tr key={alert.alert_id}>
                      <td>
                        <div>
                          <strong>{alert.patient_name}</strong>
                          <br />
                          <small className="text-muted">{alert.patient_id}</small>
                        </div>
                      </td>
                      <td>
                        <small>{alert.issue_detected}</small>
                      </td>
                      <td>
                        <small>{getTimeAgo(alert.datetime)}</small>
                      </td>
                      <td>
                        <span className={alert.resolved ? 'badge bg-success' : 'badge bg-danger'}>
                          <i className={`fas ${alert.resolved ? 'fa-check' : 'fa-exclamation'} me-1`} aria-hidden="true"></i>
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {alerts.filter(a => a.severity_level === 'high').length > maxDisplay && (
              <div className="text-center mt-3">
                <small className="text-muted">
                  Showing {maxDisplay} of {alerts.filter(a => a.severity_level === 'high').length} critical alerts
                </small>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted py-4">
            <i className="fas fa-shield-check fa-3x mb-3 text-success" aria-hidden="true"></i>
            <h6>All Clear!</h6>
            <p className="mb-0">No critical alerts found. All patients are stable.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentAlertsCard;