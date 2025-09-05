import React from 'react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveTab && setActiveTab(tabName);
  };

  const tabs = [
    { key: 'home', label: 'Home' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'patients', label: 'Patients' },
    { key: 'alerts', label: 'Alerts' },
    { key: 'test', label: 'Diagnostics Hub' },
  ];

  return (
    <nav className="health-nav" aria-label="Primary">
      <style>{`
        .health-nav {
          position: sticky; top: 56px; z-index: 40;
          background:
            radial-gradient(600px 260px at 0% -60%, rgba(43,211,231,0.10), transparent 60%),
            radial-gradient(600px 260px at 100% -60%, rgba(32,213,164,0.08), transparent 60%),
            linear-gradient(180deg, rgba(11,18,32,0.92) 0%, rgba(10,15,26,0.88) 100%);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(207,227,255,0.10);
        }
        .hn-shell { max-width: 1200px; margin: 0 auto; padding: 12px 24px; }

        /* Flexible, airy layout with row & column gaps */
        .hn {
          display: flex; flex-wrap: wrap;
          gap: 14px 16px;              /* row gap | column gap */
          list-style: none; padding: 0; margin: 0;
          align-items: stretch;
        }
        .hn li { margin: 0; flex: 0 0 auto; }

        .hn a {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 14px; text-decoration: none;
          color: var(--ink-1, #cfe3ff);
          border: 1px solid rgba(207,227,255,0.12);
          background: rgba(15,22,38,0.55);
          line-height: 1.15; font-weight: 600; letter-spacing: .2px;
          white-space: nowrap;          /* keep each tab on one line */
          user-select: none;
          min-height: 42px;             /* consistent height */
          transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .2s ease;
        }
        .hn a:hover {
          transform: translateY(-1px);
          border-color: rgba(43,211,231,0.35);
          box-shadow: 0 10px 30px rgba(0,0,0,0.35);
          background: rgba(20,30,52,0.65);
        }
        .hn a.active {
          background: linear-gradient(135deg, rgba(32,213,164,0.22), rgba(43,211,231,0.20));
          border-color: rgba(43,211,231,0.45);
        }
        .hn a:focus-visible {
          outline: 0;
          box-shadow: 0 0 0 3px rgba(43,211,231,0.25);
          border-color: rgba(43,211,231,0.55);
        }

        .tag {
          margin-left: 8px;
          font-size: 0.72rem; padding: 4px 10px; border-radius: 999px;
          border: 1px solid rgba(43,211,231,0.35);
          background: rgba(32,213,164,0.12);
          color: var(--ink-1, #cfe3ff);
        }

        .icon {
          width: 18px; height: 18px; display: inline-grid; place-items: center;
          flex: 0 0 18px;
        }
        .icon svg { width: 18px; height: 18px; display: block; }
      `}</style>

      <div className="hn-shell">
        <ul className="hn" role="tablist">
          {tabs.map(t => (
            <li key={t.key} role="presentation">
              <a
                href="#"
                role="tab"
                aria-selected={activeTab === t.key}
                className={activeTab === t.key ? 'active' : ''}
                onClick={(e) => handleTabClick(e, t.key)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTabClick(e, t.key); }}
              >
                <span className="icon" aria-hidden>
                  {t.key === 'home' && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" stroke="rgba(43,211,231,0.9)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {t.key === 'dashboard' && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M3 13h8V3H3v10Zm10 8h8V3h-8v18ZM3 21h8v-6H3v6Z" stroke="rgba(43,211,231,0.9)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {t.key === 'patients' && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5Z" stroke="rgba(32,213,164,0.9)" strokeWidth="1.7"/>
                    </svg>
                  )}
                  {t.key === 'alerts' && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm8-6V11a8 8 0 1 0-16 0v5l-2 2v1h20v-1Z" stroke="rgba(255,209,102,0.95)" strokeWidth="1.7"/>
                    </svg>
                  )}
                  {t.key === 'test' && (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16v4H4V4Zm0 6h16v4H4v-4Zm0 6h16v4H4v-4Z" stroke="rgba(207,227,255,0.85)" strokeWidth="1.7"/>
                    </svg>
                  )}
                </span>
                {t.label}
                {activeTab === t.key && <span className="tag">active</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
