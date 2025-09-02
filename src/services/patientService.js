import apiRequest from './api';

export const getPatients = () => {
  return apiRequest('/patients');
};

export const getPatientById = (patientId) => {
  return apiRequest(`/patients/${patientId}`);
};

export const updatePatient = (patientId, data) => {
  return apiRequest(`/patients/${patientId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};