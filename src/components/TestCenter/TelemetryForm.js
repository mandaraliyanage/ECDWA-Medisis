import React, { useState } from 'react';
import { sendTelemetryData } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const TelemetryForm = () => {
  const [formData, setFormData] = useState({
    patient_id: '',
    heart_rate: '',
    oxygen_level: '',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const { refreshData, patients } = useAppContext();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      console.log('Sending telemetry data:', {
        patient_id: formData.patient_id,
        heart_rate: parseInt(formData.heart_rate),
        oxygen_level: parseInt(formData.oxygen_level)
      });

      const response = await sendTelemetryData({
        patient_id: formData.patient_id,
        heart_rate: parseInt(formData.heart_rate),
        oxygen_level: parseInt(formData.oxygen_level)
      });

      console.log('Telemetry response:', response);

      setMessage({
        type: 'success',
        text: response.alert_triggered 
          ? `Data sent successfully! Alert triggered: ${response.issue}`
          : 'Telemetry data sent successfully!'
      });
      
      // Reset form
      setFormData({
        patient_id: '',
        heart_rate: '',
        oxygen_level: '',
        status: 'active'
      });

      // Refresh dashboard data
      setTimeout(() => {
        refreshData();
      }, 1000);

    } catch (error) {
      console.error('Telemetry error:', error);
      setMessage({
        type: 'error',
        text: `Error: ${error.message}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="telemetry-form-container">
      <h3>Send Live Telemetry Data</h3>
      <p className="form-description">
        Simulate sending health data from wearable devices. Critical values will trigger email alerts.
      </p>

      <form onSubmit={handleSubmit} className="telemetry-form">
        <div className="form-group">
          <label htmlFor="patient_id">Patient ID</label>
          <select
            id="patient_id"
            name="patient_id"
            value={formData.patient_id}
            onChange={handleChange}
            required
            className="form-control"
          >
            <option value="">Select Patient</option>
            {patients && patients.length > 0 ? (
              patients.map(patient => (
                <option key={patient.patient_id} value={patient.patient_id}>
                  {patient.patient_id} - {patient.name}
                </option>
              ))
            ) : (
              <option disabled>No patients available</option>
            )}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="heart_rate">Heart Rate (bpm)</label>
            <input
              type="number"
              id="heart_rate"
              name="heart_rate"
              value={formData.heart_rate}
              onChange={handleChange}
              min="30"
              max="200"
              required
              className="form-control"
              placeholder="e.g., 75"
            />
            <small className="form-text">Normal: 60-100 bpm</small>
          </div>

          <div className="form-group">
            <label htmlFor="oxygen_level">Oxygen Level (%)</label>
            <input
              type="number"
              id="oxygen_level"
              name="oxygen_level"
              value={formData.oxygen_level}
              onChange={handleChange}
              min="70"
              max="100"
              required
              className="form-control"
              placeholder="e.g., 98"
            />
            <small className="form-text">Normal: 95-100%</small>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Device Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-control"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="alert-triggers-info">
          <h4>Alert Triggers:</h4>
          <ul>
            <li><strong>High Priority:</strong> Heart Rate &lt;50 or &gt;120 bpm</li>
            <li><strong>High Priority:</strong> Oxygen Level &lt;90%</li>
            <li><strong>Medium Priority:</strong> Oxygen Level 90-94%</li>
          </ul>
        </div>

        {message && (
          <div className={`form-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={submitting}
        >
          {submitting ? 'Sending...' : 'Send Telemetry Data'}
        </button>
      </form>
    </div>
  );
};

export default TelemetryForm;