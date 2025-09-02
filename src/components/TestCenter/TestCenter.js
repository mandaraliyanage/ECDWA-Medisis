import React from 'react';
import TelemetryForm from './TelemetryForm';

const TestCenter = ({ patients }) => {
  return (
    <div className="test-center">
      <h2>Test Center</h2>
      <div className="test-center-content">
        <div className="test-description">
          <p>
            Use this form to simulate live telemetry data from wearable health devices. 
            Critical values will automatically trigger email alerts through AWS SNS.
          </p>
        </div>
        <TelemetryForm />
        
        <div className="current-patients">
          <h3>Current Patients</h3>
          <div className="patients-grid">
            {patients && patients.length > 0 ? (
              patients.map(patient => (
                <div key={patient.patient_id} className="patient-card">
                  <div className="patient-header">
                    <span className="patient-id">{patient.patient_id}</span>
                    <span className={`status-indicator ${patient.connection_status.toLowerCase()}`}>
                      {patient.connection_status}
                    </span>
                  </div>
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-vitals">
                    <div className="vital">
                      <span className="vital-label">HR:</span>
                      <span className={`vital-value ${
                        patient.heart_rate > 100 ? 'critical' : 
                        patient.heart_rate < 60 ? 'warning' : 'normal'
                      }`}>
                        {patient.heart_rate || '--'} bpm
                      </span>
                    </div>
                    <div className="vital">
                      <span className="vital-label">O2:</span>
                      <span className={`vital-value ${
                        patient.oxygen_level < 90 ? 'critical' : 
                        patient.oxygen_level < 95 ? 'warning' : 'normal'
                      }`}>
                        {patient.oxygen_level || '--'}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No patients available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCenter;