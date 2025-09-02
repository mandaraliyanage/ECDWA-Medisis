export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};

export const getTimeAgo = (dateString) => {
  if (!dateString) return 'Never';
  
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    
    if (diffMs < 0) return 'In the future';
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    
    if (diffSeconds < 30) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return 'Unknown';
  }
};

export const isWithinLast = (dateString, minutes) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = diffMs / (1000 * 60);
    
    return diffMinutes <= minutes;
  } catch (error) {
    console.error('Error checking date range:', error);
    return false;
  }
};

export const getConnectionStatus = (lastReading) => {
  if (!lastReading) return 'Offline';
  
  if (isWithinLast(lastReading, 5)) return 'Online';
  if (isWithinLast(lastReading, 30)) return 'Recent';
  
  return 'Offline';
};

export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0s';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

export const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

export const addHours = (date, hours) => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export default {
  formatDateTime,
  formatDate,
  formatTime,
  getTimeAgo,
  isWithinLast,
  getConnectionStatus,
  formatDuration,
  getCurrentTimestamp,
  addMinutes,
  addHours,
  addDays
};