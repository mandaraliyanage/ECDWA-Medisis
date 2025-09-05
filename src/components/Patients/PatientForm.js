import React, { useState, useEffect } from 'react';

const PatientForm = ({ patient, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    name: '',
    age: '',
    gender: '',
    medical_conditions: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patient && isEditing) {
      setFormData({
        patient_id: patient.patient_id,
        name: patient.name,
        age: patient?.age?.toString() || '',
        gender: patient.gender,
        medical_conditions: patient.medical_conditions || ''
      });
    }
  }, [patient, isEditing]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onSave({
        ...formData,
        age: parseInt(formData.age)
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="patient-form-overlay">
      <style>{styles}</style>
      <div className="patient-form-modal" role="dialog" aria-modal="true">
        <div className="form-header">
          <div className="form-title">
            <span className="form-title-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M10 3h4v4h4v4h-4v4h-4v-4H6V7h4V3Z" fill="#07111f"/>
              </svg>
            </span>
            <h3>{isEditing ? 'Edit Patient' : 'Add New Patient'}</h3>
          </div>
          <button onClick={onCancel} className="close-btn" aria-label="Close">×</button>
        </div>

        {/* Scrollable form body; footer is sticky so the submit is always visible */}
        <form onSubmit={handleSubmit} className="patient-form">
          {!isEditing && (
            <div className="form-group">
              <label htmlFor="patient_id">
                Patient ID <span className="req">*</span>
              </label>
              <input
                type="text"
                id="patient_id"
                name="patient_id"
                value={formData.patient_id}
                onChange={handleChange}
                required
                className="form-control"
                placeholder="e.g., P006"
                pattern="P[0-9]{3,}"
                title="Patient ID must start with 'P' followed by numbers"
                autoFocus
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">
              Full Name <span className="req">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="e.g., John Smith"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">
                Age <span className="req">*</span>
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="1"
                max="120"
                className="form-control"
                placeholder="e.g., 45"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">
                Gender <span className="req">*</span>
              </label>
              <div className="select-wrap">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="form-control select"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <span className="select-caret" aria-hidden>▾</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="medical_conditions">Medical Conditions</label>
            <textarea
              id="medical_conditions"
              name="medical_conditions"
              value={formData.medical_conditions}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g., Hypertension, Diabetes"
              rows="3"
            />
            <small className="form-text">Separate multiple conditions with commas</small>
          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel}
              className="cancel-btn"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (isEditing ? 'Update Patient' : 'Add Patient')}
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
    --ink1: #eef6ff;         /* lighter header text for dark backgrounds */
    --ink2: #a7b8d6;
    --line: rgba(255,255,255,0.10);
    --brand: #22c7b2;
    --brand2: #2bd3e7;
    --warn: #ffd166;
    --crit: #ff6b6b;
    --shadow: 0 12px 36px rgba(0,0,0,0.35);
  }

  /* Overlay now scrolls if content is taller than viewport */
  .patient-form-overlay{
    position: fixed; inset: 0;
    display: flex; align-items: center; justify-content: center;
    overflow: auto;
    background: rgba(2,8,19,0.65);
    backdrop-filter: blur(4px);
    z-index: 1000;
    padding: 18px;
  }

  /* Modal uses column layout so header/top & footer stick while body scrolls */
  .patient-form-modal{
    width: min(720px, 96vw);
    max-height: 92vh;
    display: flex; flex-direction: column;
    background: linear-gradient(180deg, rgba(17,26,47,0.98), rgba(15,22,38,0.98));
    border: 1px solid var(--line);
    border-radius: 16px; color: var(--ink1);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  /* Lighter, sticky header */
  .form-header{
    position: sticky; top: 0; z-index: 2;
    display:flex; align-items:center; justify-content:space-between; gap:10px;
    padding: 14px 16px;
    background:
      radial-gradient(600px 420px at -10% 0%, rgba(43,211,231,0.14), transparent 65%),
      radial-gradient(600px 420px at 110% 0%, rgba(34,199,178,0.12), transparent 65%),
      linear-gradient(180deg, #727988ff 0%, #c4c6caff 100%);
    border-bottom: 1px solid var(--line);
    color: var(--ink1);
  }
  .form-title{ display:flex; align-items:center; gap:10px; }
  .form-title h3{ margin:0; font-weight:900; letter-spacing:.2px; }
  .form-title-icon{
    width: 32px; height: 32px; border-radius: 8px; display:grid; place-items:center;
    background: linear-gradient(135deg, var(--brand), var(--brand2));
    box-shadow: var(--shadow);
  }

  .close-btn{
    background: transparent; border: 1px solid var(--line); color: var(--ink1);
    width: 34px; height: 34px; border-radius: 10px; cursor: pointer;
  }
  .close-btn:hover{ border-color: rgba(43,211,231,0.55); }

  /* Scrollable body */
  .patient-form{
    flex: 1 1 auto;
    overflow: auto;
    padding: 16px;
    display:grid; gap: 12px;
  }

  .form-row{
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }
  @media (max-width: 640px){ .form-row{ grid-template-columns: 1fr; } }

  .form-group{ display:grid; gap: 6px; }
  .form-group label{
    color: var(--ink1); font-weight: 800; font-size: .95rem;
  }
  .req{ color: var(--warn); }

  .form-control{
    background: #0f1a2e; color: var(--ink1);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; padding: 10px 12px; outline: none;
  }
  .form-control::placeholder{ color: #c8d8f4; }
  .form-control:focus{
    border-color: rgba(43,211,231,0.55);
    box-shadow: 0 0 0 3px rgba(43,211,231,0.20);
  }

  .select-wrap{ position: relative; }
  .select{ -webkit-appearance:none; appearance:none; padding-right: 34px; }
  .select-caret{
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    color: rgba(43,211,231,0.95); pointer-events: none; font-size: 12px;
  }
  .select option, .select optgroup{
    background:#0f1a2e; color:#eef6ff;
  }

  .form-text{ color: var(--ink2); }

  .form-error{
    background: rgba(255,107,107,0.12);
    border: 1px solid rgba(255,107,107,0.35);
    color: #ffd1d1; padding: 10px 12px; border-radius: 12px;
  }

  /* Sticky footer so buttons never disappear */
  .form-actions{
    position: sticky; bottom: 0; z-index: 2;
    display:flex; justify-content:flex-end; gap: 10px; margin-top: 6px;
    padding: 12px 0 4px;
    background: linear-gradient(180deg, rgba(17,26,47,0.85), rgba(15,22,38,0.98));
    border-top: 1px solid var(--line);
    backdrop-filter: blur(2px);
  }
  .cancel-btn{
    background: transparent; border: 1px solid var(--line); color: var(--ink1);
    padding: 10px 12px; border-radius: 12px; cursor: pointer;
  }
  .save-btn{
    background: linear-gradient(135deg, var(--brand), var(--brand2));
    border: none; color: #07111f; font-weight: 900;
    padding: 10px 14px; border-radius: 12px; cursor: pointer;
  }
  .cancel-btn:disabled, .save-btn:disabled{ opacity:.7; cursor: not-allowed; }
`;

export default PatientForm;
