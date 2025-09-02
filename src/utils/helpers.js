import { ALERT_SEVERITY, PATIENT_STATUS, VITAL_RANGES } from './constants';

export const getStatusBadgeClass = (status) => {
  const classes = {
    [PATIENT_STATUS.ONLINE]: 'badge bg-success',
    [PATIENT_STATUS.RECENT]: 'badge bg-warning text-dark',
    [PATIENT_STATUS.OFFLINE]: 'badge bg-danger',
  };
  return classes[status] || 'badge bg-secondary';
};

export const getSeverityBadgeClass = (severity) => {
  const classes = {
    [ALERT_SEVERITY.HIGH]: 'badge bg-danger',
    [ALERT_SEVERITY.MEDIUM]: 'badge bg-warning text-dark',
    [ALERT_SEVERITY.LOW]: 'badge bg-info',
  };
  return classes[severity] || 'badge bg-secondary';
};

export const getVitalStatusBadge = (type, value) => {
  if (!value) return 'badge bg-secondary';
  
  if (type === 'heart_rate') {
    const { CRITICAL_LOW, CRITICAL_HIGH, NORMAL_MIN, NORMAL_MAX } = VITAL_RANGES.HEART_RATE;
    
    if (value < CRITICAL_LOW || value > CRITICAL_HIGH) {
      return 'badge bg-danger';
    }
    if (value < NORMAL_MIN || value > NORMAL_MAX) {
      return 'badge bg-warning text-dark';
    }
    return 'badge bg-success';
  }
  
  if (type === 'oxygen') {
    const { CRITICAL, WARNING } = VITAL_RANGES.OXYGEN_LEVEL;
    
    if (value < CRITICAL) return 'badge bg-danger';
    if (value < WARNING) return 'badge bg-warning text-dark';
    return 'badge bg-success';
  }
  
  return 'badge bg-secondary';
};

export const getVitalStatusText = (type, value) => {
  if (!value) return 'No Data';
  
  if (type === 'heart_rate') {
    const { CRITICAL_LOW, CRITICAL_HIGH, NORMAL_MIN, NORMAL_MAX } = VITAL_RANGES.HEART_RATE;
    
    if (value < CRITICAL_LOW) return 'Critically Low';
    if (value > CRITICAL_HIGH) return 'Critically High';
    if (value < NORMAL_MIN) return 'Low';
    if (value > NORMAL_MAX) return 'High';
    return 'Normal';
  }
  
  if (type === 'oxygen') {
    const { CRITICAL, WARNING } = VITAL_RANGES.OXYGEN_LEVEL;
    
    if (value < CRITICAL) return 'Critical';
    if (value < WARNING) return 'Low';
    return 'Normal';
  }
  
  return 'Unknown';
};

export const generateRandomTelemetry = (patientId) => {
  const scenarios = [
    // Normal scenarios (70% probability)
    { heart_rate: randomBetween(65, 95), oxygen_level: randomBetween(96, 100), weight: 0.7 },
    
    // Warning scenarios (20% probability)
    { heart_rate: randomBetween(100, 115), oxygen_level: randomBetween(92, 95), weight: 0.2 },
    
    // Critical scenarios (10% probability)
    { heart_rate: randomBetween(35, 49), oxygen_level: randomBetween(85, 89), weight: 0.1 }
  ];
  
  const random = Math.random();
  let cumulativeWeight = 0;
  let selectedScenario = scenarios[0];
  
  for (const scenario of scenarios) {
    cumulativeWeight += scenario.weight;
    if (random <= cumulativeWeight) {
      selectedScenario = scenario;
      break;
    }
  }
  
  return {
    patient_id: patientId,
    heart_rate: selectedScenario.heart_rate,
    oxygen_level: selectedScenario.oxygen_level,
  };
};

export const generateCriticalTelemetry = (patientId) => {
  const criticalScenarios = [
    { heart_rate: randomBetween(30, 45), oxygen_level: randomBetween(96, 100) }, // Low HR
    { heart_rate: randomBetween(125, 150), oxygen_level: randomBetween(94, 98) }, // High HR
    { heart_rate: randomBetween(70, 85), oxygen_level: randomBetween(80, 89) }, // Low O2
    { heart_rate: randomBetween(40, 48), oxygen_level: randomBetween(85, 90) }  // Both critical
  ];
  
  const scenario = criticalScenarios[Math.floor(Math.random() * criticalScenarios.length)];
  
  return {
    patient_id: patientId,
    ...scenario
  };
};

export const validateTelemetryData = (data) => {
  const errors = [];
  
  if (!data.patient_id) {
    errors.push('Patient ID is required');
  }
  
  if (data.heart_rate !== undefined) {
    const hr = parseInt(data.heart_rate);
    const { ABSOLUTE_MIN, ABSOLUTE_MAX } = VITAL_RANGES.HEART_RATE;
    
    if (isNaN(hr) || hr < ABSOLUTE_MIN || hr > ABSOLUTE_MAX) {
      errors.push(`Heart rate must be between ${ABSOLUTE_MIN} and ${ABSOLUTE_MAX} BPM`);
    }
  }
  
  if (data.oxygen_level !== undefined) {
    const o2 = parseInt(data.oxygen_level);
    const { ABSOLUTE_MIN, ABSOLUTE_MAX } = VITAL_RANGES.OXYGEN_LEVEL;
    
    if (isNaN(o2) || o2 < ABSOLUTE_MIN || o2 > ABSOLUTE_MAX) {
      errors.push(`Oxygen level must be between ${ABSOLUTE_MIN}% and ${ABSOLUTE_MAX}%`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatNumber = (number, decimals = 0) => {
  if (typeof number !== 'number') return 'N/A';
  return number.toFixed(decimals);
};

export const calculatePercentage = (value, max, min = 0) => {
  if (typeof value !== 'number' || typeof max !== 'number') return 0;
  return Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Helper function for random number generation
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
  getStatusBadgeClass,
  getSeverityBadgeClass,
  getVitalStatusBadge,
  getVitalStatusText,
  generateRandomTelemetry,
  generateCriticalTelemetry,
  validateTelemetryData,
  formatNumber,
  calculatePercentage,
  debounce,
  throttle
};