import apiRequest from './api';

export const getAlerts = () => {
  return apiRequest('/alerts');
};

export const markAlertResolved = (alertId) => {
  return apiRequest(`/alerts/${alertId}/resolve`, {
    method: 'POST',
  });
};

export const getAlertsByPatient = (patientId) => {
  return apiRequest(`/alerts/patient/${patientId}`);
};