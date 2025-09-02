import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  color = 'primary',
  className = '',
  inline = false 
}) => {
  const sizeClasses = {
    small: 'spinner-border-sm',
    medium: '',
    large: 'spinner-border-lg'
  };

  const containerClasses = inline 
    ? `d-inline-flex align-items-center ${className}`
    : `d-flex flex-column align-items-center justify-content-center p-4 ${className}`;

  return (
    <div className={containerClasses}>
      <div 
        className={`spinner-border text-${color} ${sizeClasses[size]}`} 
        role="status"
        aria-label="Loading"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && (
        <p className={`${inline ? 'ms-2 mb-0' : 'mt-2'} text-muted`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;