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
        age: patient.age.toString(),
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
      <div className="patient-form-modal">
        <div className="form-header">
          <h3>{isEditing ? 'Edit Patient' : 'Add New Patient'}</h3>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit} className="patient-form">
          {!isEditing && (
            <div className="form-group">
              <label htmlFor="patient_id">Patient ID *</label>
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
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
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
              <label htmlFor="age">Age *</label>
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
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
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
            <div className="form-error">
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

export default PatientForm;