// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://yu62iq5yx0.execute-api.eu-north-1.amazonaws.com/prod';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
    timeout: 10000, // 10 second timeout
    ...options,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorText
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      // Handle AWS API Gateway response format where actual data is in body string
      if (data.body && typeof data.body === 'string') {
        try {
          return JSON.parse(data.body);
        } catch (e) {
          return data;
        }
      }
      return data;
    }
    
    return await response.text();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      `Network error: ${error.message}`,
      0,
      error
    );
  }
};

// Exported API functions
export const getPatients = async () => {
  const response = await apiRequest('/patients');
  return response.patients || [];
};

export const getPatientById = (patientId) => {
  return apiRequest(`/patients/${patientId}`);
};

export const getAlerts = async () => {
  const response = await apiRequest('/alerts');
  return response.alerts || [];
};

export const getAlertsByPatient = (patientId) => {
  return apiRequest(`/alerts/patient/${patientId}`);
};

export const getDashboardStats = async () => {
  const response = await apiRequest('/dashboard/stats');
  return response.stats || {};
};

export const sendTelemetryData = (data) => {
  return apiRequest('/telemetry', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const createPatient = (data) => {
  return apiRequest('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updatePatient = (patientId, data) => {
  return apiRequest(`/patients/${patientId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deletePatient = (patientId) => {
  return apiRequest(`/patients/${patientId}`, {
    method: 'DELETE',
  });
};

export const sendTelemetry = (data) => {
  return apiRequest('/telemetry', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const markAlertResolved = (alertId) => {
  return apiRequest(`/alerts/${alertId}/resolve`, {
    method: 'POST',
  });
};

export const getPatientTelemetryHistory = (patientId, days = 7) => {
  return apiRequest(`/telemetry/patient/${patientId}?days=${days}`);
};

export default {
  getPatients,
  getPatientById,
  getAlerts,
  getAlertsByPatient,
  getDashboardStats,
  sendTelemetry,
  sendTelemetryData,
  createPatient,
  updatePatient,
  deletePatient,
  markAlertResolved,
  getPatientTelemetryHistory
};