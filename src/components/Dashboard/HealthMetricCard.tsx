import React from 'react';
import { calculatePercentage } from '../../utils/helpers';

const HealthMetricCard = ({ 
  title, 
  value, 
  unit, 
  icon, 
  maxValue,
  normalRange,
  color = 'primary',
  showProgress = true
}) => {
  const percentage = showProgress ? calculatePercentage(value, maxValue) : 0;
  const formattedValue = typeof value === 'number' ? value.toFixed(1) : 0;

  return (
    <div className="col-md-6 mb-3">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <div className={`me-3 text-${color}`}>
              <i className={`${icon} fa-2x`} aria-hidden="true"></i>
            </div>
            <div className="flex-grow-1">
              <h5 className="card-title mb-1">{title}</h5>
              <div className="d-flex align-items-baseline">
                <h3 className={`text-${color} mb-0 me-2`}>
                  {formattedValue}
                </h3>
                <span className="text-muted">{unit}</span>
              </div>
            </div>
          </div>
          
          {showProgress && (
            <div className="mb-2">
              <div className="progress" style={{height: '8px'}}>
                <div 
                  className={`progress-bar bg-${color}`} 
                  role="progressbar" 
                  style={{width: `${percentage}%`}}
                  aria-valuenow={percentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          )}
          
          <small className="text-muted">
            {normalRange || (title.includes('Heart') ? 'Normal: 60-120 BPM' : 'Normal: 95-100%')}
          </small>
        </div>
      </div>
    </div>
  );
};

export default HealthMetricCard;