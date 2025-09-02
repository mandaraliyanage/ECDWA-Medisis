import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  subtitle,
  trend,
  onClick,
  className = ''
}) => {
  const cardClasses = `card bg-${color} text-white h-100 ${onClick ? 'cursor-pointer' : ''} ${className}`;

  const handleClick = () => {
    if (onClick) onClick();
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val || 0;
  };

  return (
    <div className="col-lg-3 col-md-6 mb-3">
      <div 
        className={cardClasses}
        onClick={handleClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="me-3">
              <i className={`${icon} fa-2x opacity-75`} aria-hidden="true"></i>
            </div>
            <div className="flex-grow-1">
              <h6 className="card-title mb-1 opacity-75">{title}</h6>
              <h2 className="mb-1">{formatValue(value)}</h2>
              {subtitle && (
                <small className="opacity-75 d-block">{subtitle}</small>
              )}
              {trend && (
                <small className="opacity-75 d-block">
                  <i className={`fas ${trend > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} me-1`}></i>
                  {Math.abs(trend)}% from yesterday
                </small>
              )}
            </div>
          </div>
        </div>
        {onClick && (
          <div className="card-footer bg-transparent border-0 py-2">
            <small className="opacity-75">
              <i className="fas fa-arrow-right me-1"></i>
              View Details
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;