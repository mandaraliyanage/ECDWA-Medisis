export const ALERT_SEVERITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const PATIENT_STATUS = {
  ONLINE: 'Online',
  RECENT: 'Recent',
  OFFLINE: 'Offline',
};

export const CONNECTION_STATUS = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};

export const VITAL_RANGES = {
  HEART_RATE: {
    CRITICAL_LOW: 50,
    CRITICAL_HIGH: 120,
    NORMAL_MIN: 60,
    NORMAL_MAX: 100,
    ABSOLUTE_MIN: 30,
    ABSOLUTE_MAX: 200
  },
  OXYGEN_LEVEL: {
    CRITICAL: 90,
    WARNING: 95,
    NORMAL: 95,
    ABSOLUTE_MIN: 70,
    ABSOLUTE_MAX: 100
  },
};

export const REFRESH_INTERVALS = {
  FAST: 10000,    // 10 seconds
  NORMAL: 30000,  // 30 seconds
  SLOW: 60000     // 1 minute
};

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000,
  MAX_ALERTS_DISPLAY: 50,
  MAX_PATIENTS_PER_PAGE: 20
};

export const API_ENDPOINTS = {
  PATIENTS: '/patients',
  ALERTS: '/alerts',
  TELEMETRY: '/telemetry',
  DASHBOARD_STATS: '/dashboard/stats'
};

export const THEMES = {
  PRIMARY: '#0d6efd',
  SUCCESS: '#198754',
  DANGER: '#dc3545',
  WARNING: '#ffc107',
  INFO: '#0dcaf0',
  LIGHT: '#f8f9fa',
  DARK: '#212529'
};

export default {
  ALERT_SEVERITY,
  PATIENT_STATUS,
  CONNECTION_STATUS,
  VITAL_RANGES,
  REFRESH_INTERVALS,
  UI_CONSTANTS,
  API_ENDPOINTS,
  THEMES
};