import React from 'react';
import { useApp } from '../../context/AppContext';

const Header = () => {
  const { loading, lastUpdated, refreshData, connectionStatus } = useApp();

  const getConnectionStatusBadge = () => {
    const statusMap = {
      connected: { class: 'bg-success', text: 'Connected', icon: 'fa-check-circle' },
      connecting: { class: 'bg-warning text-dark', text: 'Connecting', icon: 'fa-spinner fa-spin' },
      disconnected: { class: 'bg-secondary', text: 'Disconnected', icon: 'fa-times-circle' },
      error: { class: 'bg-danger', text: 'Connection Error', icon: 'fa-exclamation-triangle' }
    };

    const status = statusMap[connectionStatus] || statusMap.disconnected;

    return (
      <span className={`badge ${status.class} me-2`}>
        <i className={`fas ${status.icon} me-1`} aria-hidden="true"></i>
        {status.text}
      </span>
    );
  };

  return (
    <header className="bg-primary text-white shadow-sm">
      <div className="container-fluid">
        <div className="row align-items-center py-3">
          <div className="col">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <i className="fas fa-hospital fa-2x" aria-hidden="true"></i>
              </div>
              <div>
                <h1 className="h3 mb-0">MediSys Patient Monitoring</h1>
                <p className="mb-0 opacity-75 small">Real-time Health Monitoring Dashboard</p>
              </div>
            </div>
          </div>
          
          <div className="col-auto">
            <div className="d-flex align-items-center gap-3">
              {/* Connection Status */}
              {getConnectionStatusBadge()}
              
              {/* Last Updated */}
              {lastUpdated && (
                <small className="opacity-75">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </small>
              )}
              
              {/* Refresh Button */}
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={refreshData}
                disabled={loading}
                title="Refresh Data"
              >
                <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''} me-1`} aria-hidden="true"></i>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;