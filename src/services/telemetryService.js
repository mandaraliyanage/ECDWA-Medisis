import apiRequest from './api';

export const sendTelemetryData = (data) => {
  return apiRequest('/telemetry', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getDashboardStats = () => {
  return apiRequest('/dashboard/stats');
};

export const getPatientTelemetryHistory = (patientId, days = 7) => {
  return apiRequest(`/telemetry/patient/${patientId}?days=${days}`);
};