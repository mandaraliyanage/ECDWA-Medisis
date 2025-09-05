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

  const applyPreset = (hr, spo2) => {
    setFormData((f) => ({ ...f, heart_rate: String(hr), oxygen_level: String(spo2) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await sendTelemetryData({
        patient_id: formData.patient_id,
        heart_rate: parseInt(formData.heart_rate),
        oxygen_level: parseInt(formData.oxygen_level)
      });

      setMessage({
        type: 'success',
        text: response?.alert_triggered
          ? `Data sent. Alert triggered: ${response.issue}`
          : 'Telemetry data sent successfully.'
      });

      // Reset form
      setFormData({
        patient_id: '',
        heart_rate: '',
        oxygen_level: '',
        status: 'active'
      });

      // Refresh dashboard data shortly after
      setTimeout(() => {
        refreshData();
      }, 600);
    } catch (error) {
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
      <style>{styles}</style>

      <div className="tf-card">
        <div className="tf-head">
          <div className="tf-title">
            <span className="tf-title-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M3 12h3l2-4 4 8 2-4h5" stroke="#07111f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div>
              <h3>Send Live Telemetry Data</h3>
              <p className="tf-sub">Simulate wearable health data. Critical values automatically trigger email alerts.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="telemetry-form">
          {/* Patient picker */}
          <div className="tf-group">
            <label htmlFor="patient_id">Patient <span className="req">*</span></label>
            <div className="tf-select-wrap">
              <select
                id="patient_id"
                name="patient_id"
                value={formData.patient_id}
                onChange={handleChange}
                required
                className="tf-control tf-select"
                aria-label="Select a patient"
              >
                <option value="">Select Patient</option>
                {patients && patients.length > 0 ? (
                  patients.map((patient) => (
                    <option key={patient.patient_id} value={patient.patient_id}>
                      {patient.patient_id} — {patient.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No patients available</option>
                )}
              </select>
              <span className="tf-caret" aria-hidden>▾</span>
            </div>
          </div>

          {/* Vital inputs */}
          <div className="tf-grid">
            <div className="tf-group">
              <label htmlFor="heart_rate">Heart Rate (bpm) <span className="req">*</span></label>
              <input
                type="number"
                id="heart_rate"
                name="heart_rate"
                value={formData.heart_rate}
                onChange={handleChange}
                min="30"
                max="200"
                required
                className="tf-control"
                placeholder="e.g., 75"
                aria-describedby="hr-hint"
              />
              <small id="hr-hint" className="tf-hint">Normal 60–100 bpm</small>
            </div>

            <div className="tf-group">
              <label htmlFor="oxygen_level">Oxygen Level (%) <span className="req">*</span></label>
              <input
                type="number"
                id="oxygen_level"
                name="oxygen_level"
                value={formData.oxygen_level}
                onChange={handleChange}
                min="70"
                max="100"
                required
                className="tf-control"
                placeholder="e.g., 98"
                aria-describedby="spo2-hint"
              />
              <small id="spo2-hint" className="tf-hint">Normal 95–100%</small>
            </div>
          </div>

          {/* Quick presets */}
          <div className="tf-presets">
            <span className="tf-presets-label">Quick presets:</span>
            <button type="button" className="tf-chip ok" onClick={() => applyPreset(75, 98)}>Normal</button>
            <button type="button" className="tf-chip warn" onClick={() => applyPreset(55, 93)}>Borderline</button>
            <button type="button" className="tf-chip crit" onClick={() => applyPreset(130, 88)}>Tachy · Low SpO₂</button>
            <button type="button" className="tf-chip crit" onClick={() => applyPreset(45, 97)}>Bradycardia</button>
          </div>

          {/* Device status */}
          <div className="tf-group tf-status-row">
            <label htmlFor="status">Device Status</label>
            <div className="tf-select-wrap">
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="tf-control tf-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <span className="tf-caret" aria-hidden>▾</span>
            </div>
            <span className={`tf-badge ${formData.status}`}>
              <span className={`tf-dot ${formData.status}`} />
              {formData.status}
            </span>
          </div>

          {/* Alert triggers info */}
          <div className="tf-info">
            <div className="tf-info-head">
              <span className="tf-info-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path d="M12 3l9 18H3L12 3Z" stroke="rgba(255,209,102,0.95)" strokeWidth="1.6"/>
                </svg>
              </span>
              <h4>Alert Triggers</h4>
            </div>
            <ul className="tf-list">
              <li><strong>High Priority:</strong> HR &lt; 50 or &gt; 120 bpm</li>
              <li><strong>High Priority:</strong> SpO₂ &lt; 90%</li>
              <li><strong>Medium Priority:</strong> SpO₂ 90–94%</li>
            </ul>
          </div>

          {/* Message */}
          {message && (
            <div className={`tf-message ${message.type}`} role="status">
              <span className="tf-message-icon" aria-hidden>
                {message.type === 'success' ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="rgba(110,231,183,0.95)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <path d="M12 9v4M12 17h.01M12 3a9 9 0 110 18 9 9 0 010-18z" stroke="rgba(255,107,107,0.95)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              {message.text}
            </div>
          )}

          {/* Submit */}
          <div className="tf-actions">
            <button
              type="submit"
              className="tf-submit"
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send Telemetry Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = `
  :root{
    --bg: #0e1423;
    --panel: #111a2f;
    --ink1: #e7f0ff;
    --ink2: #a7b8d6;
    --line: rgba(255,255,255,0.10);
    --brand: #22c7b2;
    --brand2: #2bd3e7;
    --ok: #6ee7b7;
    --warn: #ffd166;
    --crit: #ff6b6b;
    --shadow: 0 12px 36px rgba(0,0,0,0.35);
  }

 .telemetry-form-container{
  color: #2bd3e7;
}


  .tf-card{
    background: rgba(13,20,36,0.98);
    border: 1px solid var(--line);
    border-radius: 16px;
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .tf-head{
    padding: 16px 18px;
    background:
      radial-gradient(700px 420px at -10% 0%, rgba(43,211,231,0.10), transparent 65%),
      radial-gradient(700px 420px at 110% 0%, rgba(34,199,178,0.08), transparent 65%),
      linear-gradient(180deg, #0f172a 0%, #0b1324 100%);
    border-bottom: 1px solid var(--line);
  }

  .tf-title{ display:flex; gap:12px; align-items:flex-start; }
  .tf-title h3{ margin:0; font-weight:900; letter-spacing:.2px; color: #eef6ff; }
  .tf-sub{ margin: 4px 0 0; color: var(--ink2); }
  .tf-title-icon{
    width: 36px; height: 36px; border-radius: 10px; display:grid; place-items:center;
    background: linear-gradient(135deg, var(--brand), var(--brand2));
    box-shadow: var(--shadow);
  }

  .telemetry-form{
    display: grid; gap: 14px; padding: 16px;
  }

  .tf-group{ display:grid; gap:6px; }
  .tf-group label{ font-weight:800; color: #eef6ff; }
  .req{ color: var(--warn); }

  .tf-grid{
    display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0,1fr));
  }
  @media (max-width: 640px){ .tf-grid{ grid-template-columns: 1fr; } }

  .tf-control{
    background: #0f1a2e; color: var(--ink1);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; padding: 10px 12px; outline: none;
  }
  .tf-control::placeholder{ color: #c7d6f0; }
  .tf-control:focus{
    border-color: rgba(43,211,231,0.55);
    box-shadow: 0 0 0 3px rgba(43,211,231,0.20);
  }

  .tf-select-wrap{ position: relative; }
  .tf-select{ -webkit-appearance:none; appearance:none; padding-right: 34px; }
  .tf-caret{
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    color: rgba(43,211,231,0.95); pointer-events: none; font-size: 12px;
  }
  /* ensure dropdown menu items are readable across browsers */
  .tf-select option, .tf-select optgroup{
    background:#0f1a2e; color:#eef6ff;
  }

  .tf-hint{ color: var(--ink2); }

  .tf-presets{
    display:flex; flex-wrap:wrap; gap:8px; align-items:center;
    padding-top: 2px;
  }
  .tf-presets-label{ color: var(--ink2); margin-right: 4px; }
  .tf-chip{
    border: 1px solid var(--line); background: rgba(15,22,38,0.6);
    padding: 6px 10px; border-radius: 999px; cursor: pointer; color: var(--ink1);
  }
  .tf-chip.ok{ border-color: rgba(110,231,183,0.35); background: rgba(110,231,183,0.10); }
  .tf-chip.warn{ border-color: rgba(255,209,102,0.35); background: rgba(255,209,102,0.10); }
  .tf-chip.crit{ border-color: rgba(255,107,107,0.35); background: rgba(255,107,107,0.10); }

  .tf-status-row{
    display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: end;
  }
  @media (max-width: 520px){ .tf-status-row{ grid-template-columns: 1fr; } }

  .tf-badge{
    display:inline-flex; align-items:center; gap:8px;
    padding:6px 10px; border-radius:999px; font-size:.9rem;
    border:1px solid var(--line); background: rgba(13,20,36,0.6); color: var(--ink1);
  }
  .tf-dot{ width:8px; height:8px; border-radius:50%; display:inline-block; }
  .tf-badge.active{ border-color: rgba(110,231,183,0.35); background: rgba(110,231,183,0.08); }
  .tf-dot.active{ background: var(--ok); }
  .tf-badge.inactive{ border-color: rgba(255,209,102,0.35); background: rgba(255,209,102,0.08); }
  .tf-dot.inactive{ background: var(--warn); }
  .tf-badge.maintenance{ border-color: rgba(43,211,231,0.35); background: rgba(43,211,231,0.08); }
  .tf-dot.maintenance{ background: #2bd3e7; }

  .tf-info{
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(16,26,46,0.6);
    border-radius: 12px; padding: 12px;
  }
  .tf-info-head{ display:flex; align-items:center; gap:8px; margin-bottom:6px; }
  .tf-info h4{ margin:0; font-size: .98rem; font-weight: 800; color: #eef6ff; }
  .tf-info-icon{
    width: 28px; height: 28px; border-radius: 8px; display:grid; place-items:center;
    background: rgba(255,209,102,0.12); border: 1px solid rgba(255,209,102,0.35);
  }
  .tf-list{ margin: 0; padding-left: 18px; color: var(--ink1); }
  .tf-list li{ margin: 4px 0; }

  .tf-message{
    display:flex; align-items:center; gap:8px;
    padding: 10px 12px; border-radius: 12px; border: 1px solid;
  }
  .tf-message.success{
    background: rgba(110,231,183,0.10);
    border-color: rgba(110,231,183,0.35);
    color: #d7ffe9;
  }
  .tf-message.error{
    background: rgba(255,107,107,0.10);
    border-color: rgba(255,107,107,0.35);
    color: #ffd1d1;
  }
  .tf-message-icon{ display:inline-grid; place-items:center; width:18px; height:18px; }

  .tf-actions{
    display:flex; justify-content:flex-end; margin-top: 4px;
  }
  .tf-submit{
    background: linear-gradient(135deg, var(--brand), var(--brand2));
    border: none; color: #07111f; font-weight: 900;
    padding: 10px 14px; border-radius: 12px; cursor: pointer;
  }
  .tf-submit:disabled{ opacity:.7; cursor: not-allowed; }
`;

export default TelemetryForm;
