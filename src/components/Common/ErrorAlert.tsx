import React from 'react';

const ErrorAlert = ({ 
  error, 
  onRetry, 
  onDismiss,
  variant = 'danger',
  title = 'Error',
  dismissible = true,
  className = ''
}) => {
  return (
    <div className={`alert alert-${variant} d-flex align-items-center ${dismissible ? 'alert-dismissible' : ''} ${className}`} role="alert">
      <i className="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>
      
      <div className="flex-grow-1">
        <strong>{title}:</strong> {error}
      </div>
      
      <div className="d-flex gap-2">
        {onRetry && (
          <button 
            className={`btn btn-outline-${variant} btn-sm`} 
            onClick={onRetry}
            type="button"
          >
            <i className="fas fa-redo me-1" aria-hidden="true"></i>
            Retry
          </button>
        )}
        
        {dismissible && onDismiss && (
          <button 
            type="button" 
            className="btn-close" 
            onClick={onDismiss}
            aria-label="Close"
          ></button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;