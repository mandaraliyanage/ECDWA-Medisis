import React, { useMemo, useState } from 'react';
import TelemetryForm from './TelemetryForm';

const TestCenter = ({ patients }) => {
  // UI state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | online | offline
  const [sortBy, setSortBy] = useState('last_reading');   // last_reading | patient_id | name
  const [sortDir, setSortDir] = useState('desc');         // asc | desc
  const [viewMode, setViewMode] = useState('cards');      // cards | list
  const [showBanner, setShowBanner] = useState(true);

  const prepared = Array.isArray(patients) ? patients : [];

  const isCritical = (p) =>
    (p?.heart_rate ?? 0) < 50 || (p?.heart_rate ?? 0) > 120 || (p?.oxygen_level ?? 100) < 90;

  // Stats
  const total = prepared.length;
  const onlineCount = prepared.filter((p) => (p.connection_status || '').toLowerCase() === 'online').length;
  const offlineCount = prepared.filter((p) => (p.connection_status || '').toLowerCase() === 'offline').length;
  const criticalCount = prepared.filter(isCritical).length;

  // Filter + sort
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let rows = prepared.filter((p) => {
      const statusOk =
        statusFilter === 'all' ||
        (statusFilter === 'online' && (p.connection_status || '').toLowerCase() === 'online') ||
        (statusFilter === 'offline' && (p.connection_status || '').toLowerCase() === 'offline');

      const textOk =
        q === '' ||
        [p.name, p.patient_id, p.medical_conditions, p.gender]
          .map((v) => (v || '').toString().toLowerCase())
          .some((s) => s.includes(q));

      return statusOk && textOk;
    });

    rows.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;

      if (sortBy === 'patient_id') {
        const av = (a.patient_id || '').toString();
        const bv = (b.patient_id || '').toString();
        return av.localeCompare(bv, undefined, { numeric: true }) * dir;
      }
      if (sortBy === 'name') {
        return ((a.name || '')).localeCompare((b.name || '')) * dir;
      }
      // default: last_reading
      const at = a.last_reading ? new Date(a.last_reading).getTime() : -Infinity;
      const bt = b.last_reading ? new Date(b.last_reading).getTime() : -Infinity;
      return (at - bt) * dir;
    });

    return rows;
  }, [prepared, search, statusFilter, sortBy, sortDir]);

  return (
    <div className="tc-view">
      <style>{styles}</style>

      {/* Header */}
      <div className="tc-header tc-tonal">
        <div className="tc-title-line">
          <div className="tc-title-left">
            <div className="tc-title-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M7 3h10l-4 7v8l-2 3v-11L7 3Z" stroke="#07111f" strokeWidth="1.6" />
              </svg>
            </div>
            <h2>Test Center <span className="tc-count">({total})</span></h2>
          </div>
          <div className="tc-header-stats">
            <span className="tc-chip ok" title="Online">{onlineCount} online</span>
            <span className="tc-chip warn" title="Offline">{offlineCount} offline</span>
            <span className="tc-chip crit" title="Potentially critical">{criticalCount} critical</span>
          </div>
        </div>
        <p className="tc-sub">
          Simulate live telemetry from wearable devices. Critical values trigger email alerts via AWS SNS (backend).
        </p>
      </div>

      {/* Banner */}
      {showBanner && (
        <div className="tc-banner">
          <div className="tc-banner-left">
            <div className="tc-banner-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M12 3l9 18H3L12 3Z" stroke="rgba(43,211,231,0.95)" strokeWidth="1.6" />
                <rect x="11" y="9" width="2" height="7" rx="1" fill="rgba(43,211,231,0.95)" />
              </svg>
            </div>
            <div className="tc-banner-text">
              <strong>Sandbox:</strong> Testing & training only—no PHI stored here.
            </div>
          </div>
          <button className="tc-banner-close" onClick={() => setShowBanner(false)} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Telemetry form */}
      <div className="tc-form-card">
        <div className="tc-form-head">
          <div className="tc-form-title">Send Live Telemetry Data</div>
          <div className="tc-form-sub">Simulate health data; alerts fire automatically on critical values.</div>
        </div>
        <div className="tc-card-inner">
          {/* Global form field theming (applies to inputs rendered by TelemetryForm) */}
          <TelemetryForm />
        </div>
      </div>

      {/* Patients + compact toolbar (search + 2 filters + view mode) */}
      <div className="tc-patients-wrap">
        <div className="tc-toolbar">
          <div className="tc-search-group">
            <span className="tc-input-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <circle cx="11" cy="11" r="6.5" stroke="rgba(207,227,255,0.9)" strokeWidth="1.6"/>
                <path d="M17 17l4 4" stroke="rgba(207,227,255,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              className="tc-input"
              type="text"
              placeholder="Search by name, ID, condition…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search patients"
            />
          </div>

          <div className="tc-right">
            <label className="tc-filter">
              <span className="tc-filter-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path d="M3 5h18M6 12h12M10 19h4" stroke="rgba(43,211,231,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </span>
              <select
                className="tc-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </label>

            <label className="tc-filter">
              <span className="tc-filter-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path d="M4 7h16M4 12h12M4 17h8" stroke="rgba(207,227,255,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </span>
              <select
                className="tc-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort by"
              >
                <option value="last_reading">Sort: Last Reading</option>
                <option value="patient_id">Sort: Patient ID</option>
                <option value="name">Sort: Name</option>
              </select>
            </label>

            <label className="tc-filter">
              <span className="tc-filter-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path d="M8 6l4-4 4 4M8 18l4 4 4-4" stroke="rgba(207,227,255,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </span>
              <select
                className="tc-select"
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value)}
                aria-label="Sort direction"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </label>

            <div className="tc-viewtoggle">
              <label className={`tc-toggle ${viewMode === 'cards' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="viewmode"
                  value="cards"
                  checked={viewMode === 'cards'}
                  onChange={() => setViewMode('cards')}
                />
                Cards
              </label>
              <label className={`tc-toggle ${viewMode === 'list' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="viewmode"
                  value="list"
                  checked={viewMode === 'list'}
                  onChange={() => setViewMode('list')}
                />
                List
              </label>
            </div>
          </div>
        </div>

        {/* Patients */}
        {filtered.length === 0 ? (
          <div className="tc-empty">
            <div className="tc-empty-card">
              <div className="tc-empty-title">No patients found</div>
              <div className="tc-empty-sub">Try clearing the search or changing filters.</div>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="tc-cards">
            {filtered.map((p) => {
              const online = (p.connection_status || '').toLowerCase() === 'online';
              const hrClass = p.heart_rate > 100 ? 'crit' : p.heart_rate < 60 ? 'warn' : 'ok';
              const oxClass = p.oxygen_level < 90 ? 'crit' : p.oxygen_level < 95 ? 'warn' : 'ok';
              const sevStripe = isCritical(p) ? 'sev-critical' : online ? 'sev-ok' : 'sev-warn';
              return (
                <div key={p.patient_id} className={`tc-card-patient ${sevStripe}`}>
                  <div className="tc-card-stripe" aria-hidden />
                  <div className="tc-card-head">
                    <div className="tc-pid">{p.patient_id}</div>
                    <span className={`tc-badge ${online ? 'online' : 'offline'}`}>
                      <span className={`tc-dot ${online ? 'online' : 'offline'}`} />
                      {p.connection_status || 'Unknown'}
                    </span>
                  </div>

                  <div className="tc-name">{p.name || 'Unnamed'}</div>
                  <div className="tc-meta">
                    {p.gender || '—'} {p.age ? `· ${p.age}y` : ''}
                  </div>

                  <div className="tc-vitals">
                    <div className="tc-vital">
                      <span className="tc-vital-label">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
                          <path d="M3 12h4l2-6 4 12 2-6h6" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
                        </svg>
                        HR
                      </span>
                      <span className={`tc-chip ${hrClass}`}>{p.heart_rate ?? '--'} {p.heart_rate ? 'bpm' : ''}</span>
                    </div>
                    <div className="tc-vital">
                      <span className="tc-vital-label">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
                          <path d="M12 3c3.5 4 6 7.2 6 10a6 6 0 0 1-12 0c0-2.8 2.5-6 6-10Z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6"/>
                        </svg>
                        SpO₂
                      </span>
                      <span className={`tc-chip ${oxClass}`}>{p.oxygen_level ?? '--'}{p.oxygen_level ? '%' : ''}</span>
                    </div>
                  </div>

                  <div className="tc-cond" title={p.medical_conditions || ''}>
                    {p.medical_conditions || 'No conditions listed'}
                  </div>

                  <div className="tc-foot">
                    <div className="tc-time">
                      {p.last_reading ? new Date(p.last_reading).toLocaleString() : 'No data'}
                    </div>
                    <div className="tc-icons">
                      <button className="tc-icon-btn" title="Copy Patient ID" onClick={() => navigator.clipboard?.writeText(p.patient_id || '')}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
                          <rect x="9" y="9" width="10" height="12" rx="2" stroke="rgba(207,227,255,0.9)" strokeWidth="1.6"/>
                          <rect x="5" y="3" width="10" height="12" rx="2" stroke="rgba(207,227,255,0.6)" strokeWidth="1.2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="tc-list">
            <div className="tc-list-head">
              <div>Patient</div>
              <div>Status</div>
              <div>HR</div>
              <div>SpO₂</div>
              <div>Conditions</div>
              <div>Last Reading</div>
            </div>
            {filtered.map((p) => {
              const online = (p.connection_status || '').toLowerCase() === 'online';
              const hrClass = p.heart_rate > 100 ? 'crit' : p.heart_rate < 60 ? 'warn' : 'ok';
              const oxClass = p.oxygen_level < 90 ? 'crit' : p.oxygen_level < 95 ? 'warn' : 'ok';
              return (
                <div key={p.patient_id} className="tc-row">
                  <div className="tc-cell">
                    <div className="tc-pair">
                      <span className="tc-strong">{p.name || 'Unnamed'}</span>
                      <span className="tc-dim">ID: {p.patient_id}</span>
                    </div>
                  </div>
                  <div className="tc-cell">
                    <span className={`tc-badge ${online ? 'online' : 'offline'}`}>
                      <span className={`tc-dot ${online ? 'online' : 'offline'}`} />
                      {p.connection_status || 'Unknown'}
                    </span>
                  </div>
                  <div className="tc-cell"><span className={`tc-chip ${hrClass}`}>{p.heart_rate ?? '--'} {p.heart_rate ? 'bpm' : ''}</span></div>
                  <div className="tc-cell"><span className={`tc-chip ${oxClass}`}>{p.oxygen_level ?? '--'}{p.oxygen_level ? '%' : ''}</span></div>
                  <div className="tc-cell tc-ellipsis" title={p.medical_conditions || ''}>{p.medical_conditions || '-'}</div>
                  <div className="tc-cell">{p.last_reading ? new Date(p.last_reading).toLocaleString() : 'No data'}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = `
  :root{
    --bg: #0e1423;
    --panel: #111a2f;
    --ink1: #e7f0ff;
    --ink2: #b5c6e4;
    --line: rgba(255,255,255,0.10);
    --brand: #22c7b2;
    --brand2: #2bd3e7;
    --ok: #6ee7b7;
    --warn: #ffd166;
    --crit: #ff6b6b;
    --shadow: 0 12px 36px rgba(0,0,0,0.35);
  }

  .tc-view{ color: var(--ink1); padding-top: 8px; }

  /* Header */
  .tc-header{ margin: 18px 0 14px; }
  .tc-tonal{
    background:
      radial-gradient(900px 500px at -10% 0%, rgba(43,211,231,0.10), transparent 65%),
      radial-gradient(900px 500px at 110% 0%, rgba(34,199,178,0.08), transparent 65%),
      linear-gradient(180deg, #0e1423 0%, #0b111f 100%);
    border: 1px solid var(--line);
    padding: 20px 22px;
    border-radius: 16px;
    box-shadow: var(--shadow);
  }
  .tc-title-line{ display:flex; align-items:center; justify-content:space-between; gap:16px; }
  .tc-title-left{ display:flex; gap:12px; align-items:center; }
  .tc-title-icon{
    width: 38px; height: 38px; border-radius: 12px;
    background: linear-gradient(135deg, var(--brand), var(--brand2));
    display: grid; place-items: center;
  }
  .tc-title-line h2{
    margin: 0; font-weight: 900; color: var(--ink1);
    text-shadow: 0 1px 0 rgba(0,0,0,0.45);  /* improve readability anywhere */
  }
  .tc-count{ color: var(--ink2); font-weight: 800; margin-left: 4px; }
  .tc-header-stats{ display:flex; gap:10px; flex-wrap:wrap; }
  .tc-chip{
    display:inline-flex; align-items:center; justify-content:center;
    padding: 7px 12px; border-radius: 999px; border: 1px solid var(--line);
    background: rgba(13,20,36,0.6); font-weight: 800;
  }
  .tc-chip.ok{ border-color: rgba(110,231,183,0.35); background: rgba(110,231,183,0.10); }
  .tc-chip.warn{ border-color: rgba(255,209,102,0.35); background: rgba(255,209,102,0.10); }
  .tc-chip.crit{ border-color: rgba(255,107,107,0.35); background: rgba(255,107,107,0.10); }
  .tc-sub{ margin: 8px 0 0; color: var(--ink2); }

  /* Banner */
  .tc-banner{
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    margin: 14px 0 16px;
    padding: 12px 14px; border-radius: 12px;
    background: linear-gradient(135deg, rgba(32,213,164,0.10), rgba(43,211,231,0.10));
    border: 1px solid rgba(43,211,231,0.25);
  }
  .tc-banner-left{ display:flex; gap:10px; align-items:center; }
  .tc-banner-icon{
    width: 28px; height: 28px; border-radius: 8px; display:grid; place-items:center;
    background: rgba(43,211,231,0.12); border: 1px solid rgba(43,211,231,0.25);
  }
  .tc-banner-text{ color: rgba(43,211,231,0.95); }
  .tc-banner-close{
    background: transparent; border: 1px solid rgba(43,211,231,0.45);
    color: rgba(43,211,231,0.95); padding: 6px 10px; border-radius: 8px; cursor:pointer;
  }

  /* Form card */
  .tc-form-card{
    background: rgba(13,20,36,0.98);
    border: 1px solid var(--line);
    border-radius: 16px;
    box-shadow: var(--shadow);
    padding: 14px;
    margin-bottom: 16px;
  }
  .tc-form-head{ margin-bottom: 8px; }
  .tc-form-title{
    font-weight: 900; font-size: 1.25rem; color: var(--ink1);
    text-shadow: 0 1px 0 rgba(0,0,0,0.45);
  }
  .tc-form-sub{ color: var(--ink2); }
  .tc-card-inner{
    margin-top: 10px;
  }
  /* generic styling for inputs inside TelemetryForm */
  .tc-form-card input,
  .tc-form-card select,
  .tc-form-card textarea{
    background: #0f1a2e !important;
    color: var(--ink1) !important;
    border: 1px solid rgba(255,255,255,0.08) !important;
    border-radius: 12px !important;
    padding: 10px 12px !important;
    outline: none !important;
  }
.tc-form-card label { 
  color: #1e293b;  /* Dark slate color for better contrast */
  font-weight: 800;
}


  /* Patients container + toolbar */
  .tc-patients-wrap{
    background: linear-gradient(180deg, rgba(17,26,47,0.9), rgba(15,22,38,0.9));
    border: 1px solid var(--line);
    border-radius: 16px;
    box-shadow: var(--shadow);
    padding: 12px;
  }
  .tc-toolbar{
    display:flex; align-items:center; gap: 16px; flex-wrap: wrap;
    margin-bottom: 10px; padding: 6px;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    background: rgba(13,20,36,0.55);
  }
  .tc-search-group{ position: relative; width: clamp(320px, 48vw, 560px); }
  .tc-input-icon{ position:absolute; top:50%; left:10px; transform:translateY(-50%); pointer-events:none; }
  .tc-input{
    width:100%; background:#0f1a2e; color:var(--ink1);
    border:1px solid var(--line); padding:11px 12px 11px 36px; border-radius:12px; outline:none;
  }
  .tc-input::placeholder{ color:#c7d6f0; }

  .tc-right{ display:flex; gap:12px; align-items:center; margin-left:auto; flex-wrap:wrap; }
  .tc-filter{
    display:inline-flex; align-items:center; gap:10px;
    background: var(--panel); border:1px solid var(--line);
    border-radius:12px; padding:9px 12px; position:relative;
  }
  .tc-filter-icon{ display:grid; place-items:center; width:18px; height:18px; }
  .tc-select{
    -webkit-appearance:none; appearance:none;
    background:#0f1a2e; color:var(--ink1);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:10px; padding:9px 28px 9px 10px; outline:none;
  }
  .tc-select option{ background:#0f1a2e; color:#e7f0ff; }
  .tc-viewtoggle{ display:flex; gap:8px; }
  .tc-toggle{
    display:inline-flex; gap:6px; align-items:center;
    background:#0f1a2e; border:1px solid var(--line); padding:9px 12px;
    border-radius:10px; color:var(--ink1); cursor:pointer;
  }
  .tc-toggle.active{ border-color: rgba(43,211,231,0.35); }

  /* Cards */
  .tc-cards{
    display:grid; gap:12px; grid-template-columns: repeat(3, minmax(0,1fr));
  }
  @media (max-width: 1100px){ .tc-cards{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
  @media (max-width: 640px){ .tc-cards{ grid-template-columns: 1fr; } }

  .tc-card-patient{
    position:relative; overflow:hidden;
    border:1px solid var(--line); border-radius:12px;
    background: rgba(13,20,36,0.9);
    padding: 12px;
  }
  .tc-card-stripe{
    position:absolute; left:0; top:0; bottom:0; width:6px; opacity:.9;
    background: linear-gradient(180deg, var(--brand), var(--brand2));
  }
  .tc-card-patient.sev-critical .tc-card-stripe{ background: linear-gradient(180deg, #ef476f, #ff6b6b); }
  .tc-card-patient.sev-warn .tc-card-stripe{ background: linear-gradient(180deg, #ffd166, #ffb703); }
  .tc-card-patient.sev-ok .tc-card-stripe{ background: linear-gradient(180deg, #2bd3e7, #22c7b2); }

  .tc-card-head{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .tc-pid{ color: var(--ink2); font-size:.92rem; }
  .tc-name{ font-weight:800; margin-top:4px; }
  .tc-meta{ color: var(--ink2); font-size:.9rem; margin-bottom:8px; }

  .tc-vitals{ display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px; }
  .tc-vital{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
  .tc-vital-label{ display:inline-flex; align-items:center; gap:6px; color: var(--ink2); font-size:.9rem; }

  .tc-chip{
    display:inline-flex; align-items:center; gap:6px;
    padding: 6px 10px; border-radius:999px; border:1px solid var(--line);
    background: rgba(13,20,36,0.6);
  }
  .tc-chip.ok{ border-color: rgba(110,231,183,0.35); background: rgba(110,231,183,0.10); }
  .tc-chip.warn{ border-color: rgba(255,209,102,0.35); background: rgba(255,209,102,0.10); }
  .tc-chip.crit{ border-color: rgba(255,107,107,0.35); background: rgba(255,107,107,0.10); }

  .tc-cond{ color: var(--ink2); font-size:.92rem; margin-bottom:8px; }
  .tc-foot{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
  .tc-time{ color: var(--ink2); font-size:.9rem; }
  .tc-icons{ display:flex; gap:8px; }
  .tc-icon-btn{
    background: rgba(13,20,36,0.55); border:1px solid var(--line); color: var(--ink1);
    padding: 8px 10px; border-radius: 10px; cursor: pointer;
  }

  /* List */
  .tc-list{ margin-top:10px; border:1px solid var(--line); border-radius:12px; overflow:hidden; }
  .tc-list-head, .tc-row{
    display:grid; grid-template-columns: 1.2fr .9fr .7fr .7fr 1.4fr 1fr; gap:10px; align-items:center;
  }
  .tc-list-head{
    padding:12px; background: rgba(207,227,255,0.06); color: var(--ink1); font-weight:800;
    text-shadow: 0 1px 0 rgba(0,0,0,0.45);
  }
  .tc-row{ padding:12px; background: rgba(15,22,38,0.9); border-top:1px solid rgba(255,255,255,0.05); }
  .tc-row:hover{ background: rgba(32,213,164,0.05); }

  .tc-cell .tc-pair{ display:flex; flex-direction:column; }
  .tc-strong{ font-weight:800; }
  .tc-dim{ color: var(--ink2); font-size:.9rem; }
  .tc-ellipsis{ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Badges */
  .tc-badge{
    display:inline-flex; align-items:center; gap:8px;
    padding:6px 10px; border-radius:999px; font-size:.9rem;
    border:1px solid var(--line); background: rgba(13,20,36,0.6); color: var(--ink1);
  }
  .tc-dot{ width:8px; height:8px; border-radius:50%; display:inline-block; }
  .tc-badge.online{ border-color: rgba(110,231,183,0.35); background: rgba(110,231,183,0.08); }
  .tc-dot.online{ background: var(--ok); }
  .tc-badge.offline{ border-color: rgba(255,209,102,0.35); background: rgba(255,209,102,0.08); }
  .tc-dot.offline{ background: var(--warn); }

  /* Empty */
  .tc-empty{ display:grid; place-items:center; padding: 28px 10px; }
  .tc-empty-card{
    max-width:560px; text-align:center; padding:22px; border-radius:14px;
    background: rgba(13,20,36,0.85); border:1px solid var(--line); box-shadow: var(--shadow);
  }
  .tc-empty-title{ font-weight:900; margin-bottom:6px; }
  .tc-empty-sub{ color: var(--ink2); }
`;

export default TestCenter;
