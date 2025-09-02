import React from 'react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
    { id: 'patients', label: 'Patients', icon: 'fa-users' },
    { id: 'alerts', label: 'Alerts', icon: 'fa-bell' },
    { id: 'test', label: 'Test Center', icon: 'fa-vial' }
  ];

  return (
    <nav className="mb-4">
      <ul className="nav nav-tabs">
        {navItems.map(item => (
          <li key={item.id} className="nav-item">
            <button 
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              type="button"
            >
              <i className={`fas ${item.icon} me-1`} aria-hidden="true"></i>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;