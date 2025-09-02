import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Common/Header';
import Navigation from './components/Common/Navigation';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorAlert from './components/Common/ErrorAlert';
import DashboardView from './components/Dashboard/DashboardView';
import { useAppContext } from './context/AppContext';
import './App.css';

// Import other views (you'll need to create these similar to the dashboard)
const PatientsView = React.lazy(() => import('./components/Patients/PatientsView'));
const AlertsView = React.lazy(() => import('./components/Alerts/AlertsView'));
const TestCenter = React.lazy(() => import('./components/TestCenter/TestCenter'));

const MainContent = () => {
  const { 
    patients, 
    alerts, 
    stats, 
    loading, 
    error, 
    clearError 
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleNavigate = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    // Show loading spinner only when initially loading data
    if (loading && patients.length === 0 && alerts.length === 0 && Object.keys(stats).length === 0) {
      return (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        {activeTab === 'dashboard' && (
          <DashboardView 
            stats={stats} 
            alerts={alerts} 
            patients={patients}
            onNavigate={handleNavigate}
          />
        )}
        
        {activeTab === 'patients' && (
          <PatientsView patients={patients} />
        )}
        
        {activeTab === 'alerts' && (
          <AlertsView alerts={alerts} />
        )}
        
        {activeTab === 'test' && (
          <TestCenter patients={patients} />
        )}
      </React.Suspense>
    );
  };

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        {/* Error Display */}
        {error && (
          <ErrorAlert 
            message={error} 
            onClose={clearError}
          />
        )}
        
        {/* Navigation */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main Content */}
        <div className="content-area">
          {renderContent()}
        </div>
        
        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <h6>🏥 MediSys Diagnostics Ltd.</h6>
            <p>
              Real-time Patient Monitoring Dashboard System
              <span> • </span>
              <span className="system-status">System Online</span>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;