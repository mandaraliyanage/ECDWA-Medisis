import React from 'react';

const ErrorAlert = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="error-alert">
      <div className="error-content">
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="close-button">
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;