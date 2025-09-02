import React from 'react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveTab(tabName);
  };

  return (
    <nav className="navigation">
      <ul>
        <li>
          <a 
            href="#" 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={(e) => handleTabClick(e, 'dashboard')}
          >
            Dashboard
          </a>
        </li>
        <li>
          <a 
            href="#" 
            className={activeTab === 'patients' ? 'active' : ''}
            onClick={(e) => handleTabClick(e, 'patients')}
          >
            Patients
          </a>
        </li>
        <li>
          <a 
            href="#" 
            className={activeTab === 'alerts' ? 'active' : ''}
            onClick={(e) => handleTabClick(e, 'alerts')}
          >
            Alerts
          </a>
        </li>
        <li>
          <a 
            href="#" 
            className={activeTab === 'test' ? 'active' : ''}
            onClick={(e) => handleTabClick(e, 'test')}
          >
            Test Center
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;