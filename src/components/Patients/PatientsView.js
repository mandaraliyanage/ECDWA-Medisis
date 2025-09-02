import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import PatientForm from './PatientForm';
import { createPatient, updatePatient, deletePatient } from '../../services/api';

const PatientsView = ({ patients }) => {
  const { loading, refreshData } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleAddPatient = () => {
    setEditingPatient(null);
    setShowForm(true);
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDeletePatient = (patient) => {
    setDeleteConfirm(patient);
  };

  const confirmDelete = async () => {
    try {
      await deletePatient(deleteConfirm.patient_id);
      setDeleteConfirm(null);
      refreshData();
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Error deleting patient: ${error.message}`);
    }
  };

  const handleSavePatient = async (patientData) => {
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.patient_id, patientData);
      } else {
        await createPatient(patientData);
      }
      setShowForm(false);
      setEditingPatient(null);
      refreshData();
    } catch (error) {
      throw error;
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  if (loading) {
    return (
      <div className="patients-view">
        <h2>Patients</h2>
        <div className="patients-content">
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patients-view">
      <div className="patients-header">
        <h2>Patients ({patients?.length || 0})</h2>
        <button onClick={handleAddPatient} className="add-patient-btn">
          + Add New Patient
        </button>
      </div>
      
      <div className="patients-content">
        {!patients || patients.length === 0 ? (
          <div className="no-patients">
            <p>No patients found.</p>
            <button onClick={handleAddPatient} className="add-first-patient-btn">
              Add Your First Patient
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Medical Conditions</th>
                  <th>Heart Rate</th>
                  <th>Oxygen Level</th>
                  <th>Last Reading</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient.patient_id} className={patient.connection_status === 'Offline' ? 'patient-offline' : ''}>
                    <td>{patient.patient_id}</td>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.medical_conditions}</td>
                    <td className={patient.heart_rate > 100 ? 'critical' : patient.heart_rate < 60 ? 'warning' : 'normal'}>
                      {patient.heart_rate || '--'} {patient.heart_rate ? 'bpm' : ''}
                    </td>
                    <td className={patient.oxygen_level < 90 ? 'critical' : patient.oxygen_level < 95 ? 'warning' : 'normal'}>
                      {patient.oxygen_level || '--'}{patient.oxygen_level ? '%' : ''}
                    </td>
                    <td>{patient.last_reading ? new Date(patient.last_reading).toLocaleString() : 'No data'}</td>
                    <td>
                      <span className={`status-badge ${patient.connection_status.toLowerCase()}`}>
                        {patient.connection_status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEditPatient(patient)}
                          className="edit-btn"
                          title="Edit Patient"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeletePatient(patient)}
                          className="delete-btn"
                          title="Delete Patient"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Form Modal */}
      {showForm && (
        <PatientForm
          patient={editingPatient}
          onSave={handleSavePatient}
          onCancel={handleCancelForm}
          isEditing={!!editingPatient}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete patient <strong>{deleteConfirm.name}</strong> ({deleteConfirm.patient_id})?
            </p>
            <p className="warning-text">
              This will also delete all associated telemetry data and alerts.
            </p>
            <div className="confirm-actions">
              <button onClick={() => setDeleteConfirm(null)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmDelete} className="confirm-delete-btn">
                Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsView;