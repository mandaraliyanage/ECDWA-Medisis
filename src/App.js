import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Header from './components/Common/Header';
import Navigation from './components/Common/Navigation';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorAlert from './components/Common/ErrorAlert';
import DashboardView from './components/Dashboard/DashboardView';
import { useAppContext } from './context/AppContext';
import './App.css';

// Lazy views
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
    // bring user to top for a cleaner context switch
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
  };

  const HomeHero = () => (
    <section className="home-hero">
      <div className="hh-top">
        <div className="hh-logo" aria-hidden>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path d="M3 12h3l2-4 4 8 2-4h5" stroke="#07111f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2>Welcome to MediSys</h2>
          <p className="hh-sub">Monitor patients, triage alerts, and test telemetry in one modern workspace.</p>
        </div>
      </div>
      <div className="hh-actions">
        <button className="hh-btn primary" onClick={() => handleNavigate('dashboard')}>Open Dashboard</button>
        <button className="hh-btn" onClick={() => handleNavigate('patients')}>View Patients</button>
        <button className="hh-btn" onClick={() => handleNavigate('alerts')}>Go to Alerts</button>
        <button className="hh-btn" onClick={() => handleNavigate('test')}>Test Center</button>
      </div>

      <div className="hh-stats">
        <div className="hh-card">
          <div className="hh-card-top">
            <span className="hh-pill">Total Patients</span>
          </div>
          <div className="hh-value">{patients?.length || 0}</div>
        </div>
        <div className="hh-card">
          <div className="hh-card-top">
            <span className="hh-pill">Active Today</span>
          </div>
          <div className="hh-value">
            {patients?.filter(p => p.connection_status === 'Online').length || 0}
          </div>
        </div>
        <div className="hh-card">
          <div className="hh-card-top">
            <span className="hh-pill">Unresolved Alerts</span>
          </div>
          <div className="hh-value">
            {alerts?.filter(a => !a.resolved).length || 0}
          </div>
        </div>
      </div>
    </section>
  );

  const renderContent = () => {
    // initial fetch loading state
    if (loading && patients.length === 0 && alerts.length === 0 && Object.keys(stats).length === 0) {
      return (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        {activeTab === 'home' && <HomeHero />}

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
      <style>{styles}</style>
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
          <div className="ft-shell">
            <div className="ft-left">
              <div className="ft-logo" aria-hidden>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path d="M3 12h3l2-4 4 8 2-4h5" stroke="#07111f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h6>🏥 MediSys Diagnostics Ltd.</h6>
                <p>Real-time Patient Monitoring Dashboard</p>
              </div>
            </div>

            <nav className="ft-nav" aria-label="Footer">
              <button onClick={() => handleNavigate('home')}>Home</button>
              <button onClick={() => handleNavigate('dashboard')}>Dashboard</button>
              <button onClick={() => handleNavigate('patients')}>Patients</button>
              <button onClick={() => handleNavigate('alerts')}>Alerts</button>
              <button onClick={() => handleNavigate('test')}>Test Center</button>
            </nav>

            <div className="ft-right">
              <span className="status-dot" /> 
              <span className="system-status">System Online</span>
              <button className="to-top" onClick={() => { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {} }}>
                Back to top
              </button>
            </div>
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

const styles = `
  :root{
    --app-bg: #0b1220;
    --panel: #101a2e;
    --ink1: #dbe8ff;
    --ink2: #9fb3d6;
    --line: rgba(255,255,255,0.10);
    --brand: #20d5a4;
    --brand2: #2bd3e7;
    --shadow: 0 14px 34px rgba(0,0,0,0.35);
  }

  .app{
    background:
      radial-gradient(1200px 800px at 12% -12%, rgba(43,211,231,0.12), transparent 55%),
      radial-gradient(900px 700px at 88% -18%, rgba(32,213,164,0.10), transparent 55%),
      linear-gradient(180deg, var(--app-bg) 0%, #0a0f1a 100%);
    min-height: 100vh; color: var(--ink1);
  }

  .main-content{
    padding-bottom: 32px;
  }

  .content-area{
    max-width: 1280px; margin: 0 auto; padding: 18px 22px 24px;
  }

  /* Home hero */
  .home-hero{
    background:
      radial-gradient(700px 420px at -10% 0%, rgba(43,211,231,0.10), transparent 65%),
      radial-gradient(700px 420px at 110% 0%, rgba(34,199,178,0.08), transparent 65%),
      linear-gradient(180deg, #0f1628 0%, #0b1324 100%);
    border: 1px solid var(--line);
    border-radius: 16px;
    box-shadow: var(--shadow);
    padding: 18px;
  }
  .hh-top{ display:flex; gap:12px; align-items:center; }
  .hh-logo{
    width: 40px; height: 40px; border-radius: 12px; display:grid; place-items:center;
    background: linear-gradient(135deg, var(--brand), var(--brand2));
    box-shadow: var(--shadow);
  }
  .hh-top h2{ margin:0; font-weight: 900; letter-spacing:.2px; }
  .hh-sub{ color: var(--ink2); margin: 4px 0 0; }

  .hh-actions{ display:flex; gap:10px; flex-wrap:wrap; margin-top: 12px; }
  .hh-btn{
    background: rgba(15,22,38,0.65); color: var(--ink1);
    border: 1px solid var(--line); border-radius: 12px; padding: 10px 14px;
    cursor: pointer; transition: transform .12s ease, border-color .12s ease, background .2s ease;
  }
  .hh-btn:hover{ transform: translateY(-1px); border-color: rgba(43,211,231,0.35); background: rgba(20,30,52,0.7); }
  .hh-btn.primary{
    background: linear-gradient(135deg, var(--brand), var(--brand2));
    color: #07111f; border: none; font-weight: 900;
  }

  .hh-stats{
    margin-top: 14px;
    display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0,1fr));
  }
  @media (max-width: 900px){ .hh-stats{ grid-template-columns: 1fr; } }
  .hh-card{
    background: linear-gradient(180deg, rgba(16,26,46,0.92), rgba(15,22,38,0.92));
    border: 1px solid var(--line); border-radius: 14px; padding: 14px; box-shadow: var(--shadow);
  }
  .hh-card-top{ display:flex; justify-content: space-between; align-items:center; margin-bottom: 6px; }
  .hh-pill{
    font-size: .78rem; padding: 6px 10px; border-radius: 999px;
    background: rgba(32,213,164,0.12); border: 1px solid rgba(32,213,164,0.3);
    color: var(--ink1);
  }
  .hh-value{ font-size: 1.9rem; font-weight: 900; letter-spacing: .3px; }

  /* Footer */
  .footer{
    margin-top: 22px;
    border-top: 1px solid var(--line);
    background:
      radial-gradient(800px 500px at -10% -40%, rgba(43,211,231,0.08), transparent 60%),
      radial-gradient(800px 500px at 110% -40%, rgba(32,213,164,0.06), transparent 60%),
      linear-gradient(180deg, rgba(11,18,32,0.92) 0%, rgba(10,15,26,0.88) 100%);
    backdrop-filter: blur(8px);
  }
  .ft-shell{
    max-width: 1280px; margin: 0 auto; padding: 16px 22px;
    display: grid; grid-template-columns: 1.2fr 1fr auto; gap: 14px; align-items: center;
  }
  @media (max-width: 900px){
    .ft-shell{ grid-template-columns: 1fr; text-align: center; gap: 10px; }
  }
  .ft-left{ display:flex; gap:10px; align-items:center; }
  .ft-logo{
    width: 30px; height: 30px; border-radius: 8px; display:grid; place-items:center;
    background: linear-gradient(135deg, var(--brand), var(--brand2));
    box-shadow: var(--shadow);
  }
  .footer h6{ margin:0; font-weight: 800; }
  .footer p{ margin:0; color: var(--ink2); }

  .ft-nav{ display:flex; gap:10px; justify-content:center; flex-wrap: wrap; }
  .ft-nav button{
    background: rgba(15,22,38,0.55); color: var(--ink1);
    border: 1px solid var(--line); border-radius: 10px; padding: 8px 12px; cursor: pointer;
  }
  .ft-nav button:hover{ border-color: rgba(43,211,231,0.35); }

  .ft-right{ display:flex; gap:10px; align-items:center; justify-content:flex-end; }
  @media (max-width: 900px){ .ft-right{ justify-content:center; } }
  .status-dot{ width:8px; height:8px; border-radius: 50%; background: #6ee7b7; display:inline-block; }
  .system-status{ color: var(--ink1); font-weight: 700; }
  .to-top{
    background: transparent; color: var(--ink1);
    border: 1px solid var(--line); border-radius: 10px; padding: 8px 12px; cursor: pointer;
  }
  .to-top:hover{ border-color: rgba(43,211,231,0.35); }

  /* Loading container */
  .loading-container{ display:grid; place-items:center; padding: 40px 0; }
`;

export default App;
