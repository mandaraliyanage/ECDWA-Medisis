import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const AlertsView = ({ alerts }) => {
  const { loading, refreshData } = useAppContext();

  // Theme-consistent UI state
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'list'
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all'); // all | critical | warning | info
  const [statusFilter, setStatusFilter] = useState('all'); // all | unresolved | resolved
  const [timeFilter, setTimeFilter] = useState('all'); // DEFAULT: show all time
  const [sortBy, setSortBy] = useState('datetime'); // datetime | severity | patient | status
  const [sortDir, setSortDir] = useState('desc'); // asc | desc

  const rows = Array.isArray(alerts) ? alerts : [];

  const normalizeSeverity = (s) => {
    const v = (s || '').toLowerCase();
    if (v === 'high' || v === 'critical' || v === 'severe') return 'critical';
    if (v === 'medium' || v === 'warn' || v === 'warning') return 'warning';
    return 'info';
  };

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const inWindow = (ts) => {
      if (timeFilter === 'all') return true;
      const t = new Date(ts).getTime();
      if (Number.isNaN(t)) return false;
      if (timeFilter === '24h') return now - t <= day;
      if (timeFilter === '7d') return now - t <= 7 * day;
      if (timeFilter === '30d') return now - t <= 30 * day;
      return true;
    };

    let arr = rows.filter((a) => {
      const sev = normalizeSeverity(a.severity_level);
      const statusOk =
        statusFilter === 'all' ||
        (statusFilter === 'unresolved' && !a.resolved) ||
        (statusFilter === 'resolved' && !!a.resolved);

      const sevOk = severityFilter === 'all' || sev === severityFilter;

      const textOk =
        q === '' ||
        [a.patient_name, a.patient_id, a.issue_detected, a.message, a.severity_level]
          .map((v) => (v || '').toString().toLowerCase())
          .some((s) => s.includes(q));

      return inWindow(a.datetime) && statusOk && sevOk && textOk;
    });

    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'severity') {
        const rank = (x) => ({ critical: 3, warning: 2, info: 1 }[normalizeSeverity(x.severity_level)] || 0);
        return (rank(a) - rank(b)) * dir;
      }
      if (sortBy === 'patient') {
        return ((a.patient_name || '') + (a.patient_id || '')).localeCompare((b.patient_name || '') + (b.patient_id || '')) * dir;
      }
      if (sortBy === 'status') {
        const toNum = (r) => (r ? 1 : 0);
        return (toNum(a.resolved) - toNum(b.resolved)) * dir;
      }
      // datetime default
      const at = new Date(a.datetime).getTime() || -Infinity;
      const bt = new Date(b.datetime).getTime() || -Infinity;
      return (at - bt) * dir;
    });

    return arr;
  }, [rows, search, severityFilter, statusFilter, timeFilter, sortBy, sortDir, now]);

  // Stats
  const criticalCount = rows.filter((a) => normalizeSeverity(a.severity_level) === 'critical').length;
  const unresolvedCount = rows.filter((a) => !a.resolved).length;
  const last24hCount = rows.filter((a) => now - (new Date(a.datetime).getTime() || 0) <= day).length;

  if (loading) {
    return (
      <div className="alerts-view">
        <style>{styles}</style>
        <div className="al-header al-tonal">
          <div className="al-title-line">
            <div className="al-title-left">
              <div className="al-title-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path d="M12 3l9 18H3L12 3Z" stroke="#07111f" strokeWidth="1.6" />
                </svg>
              </div>
              <h2>Alerts <span className="al-count">({rows.length})</span></h2>
            </div>
            <button className="al-refresh" disabled>
              <span className="al-spin" aria-hidden>⟳</span> Refresh
            </button>
          </div>
        </div>
        <div className="al-skeleton" />
      </div>
    );
  }

  return (
    <div className="alerts-view">
      <style>{styles}</style>

      {/* Header */}
      <div className="al-header al-tonal">
        <div className="al-title-line">
          <div className="al-title-left">
            <div className="al-title-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M12 3l9 18H3L12 3Z" stroke="#07111f" strokeWidth="1.6" />
              </svg>
            </div>
            <h2>Alerts <span className="al-count">({rows.length})</span></h2>
          </div>
          <button onClick={refreshData} className="al-refresh" title="Refresh alerts">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
              <path d="M21 12a9 9 0 1 1-2.64-6.36" stroke="rgba(43,211,231,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M21 5v6h-6" stroke="rgba(43,211,231,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats chips */}
        <div className="al-stats">
          <div className="al-stat">
            <span className="al-stat-label">Critical</span>
            <span className="al-chip crit">{criticalCount}</span>
          </div>
          <div className="al-stat">
            <span className="al-stat-label">Unresolved</span>
            <span className="al-chip warn">{unresolvedCount}</span>
          </div>
          <div className="al-stat">
            <span className="al-stat-label">Last 24h</span>
            <span className="al-chip ok">{last24hCount}</span>
          </div>
          <div className="al-stat">
            <span className="al-stat-label">Total</span>
            <span className="al-chip neutral">{rows.length}</span>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div className="al-tools">
        <div className="al-search-group">
          <span className="al-input-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <circle cx="11" cy="11" r="6.5" stroke="rgba(207,227,255,0.85)" strokeWidth="1.6"/>
              <path d="M17 17l4 4" stroke="rgba(207,227,255,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            className="al-input"
            type="text"
            placeholder="Search by patient, ID, issue or message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search alerts"
          />
        </div>

        <div className="al-filter-row">
          {/* Severity */}
          <label className="al-filter">
            <span className="al-filter-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M12 3l9 18H3L12 3Z" stroke="rgba(255,107,107,0.9)" strokeWidth="1.6"/>
              </svg>
            </span>
            <select
              className="al-select"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              aria-label="Filter by severity"
            >
              <option value="all">All severity</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </label>

          {/* Status */}
          <label className="al-filter">
            <span className="al-filter-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M6 12l4 4 8-8" stroke="rgba(32,213,164,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </span>
            <select
              className="al-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All status</option>
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>

          {/* Time window (default All time) */}
          <label className="al-filter">
            <span className="al-filter-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M12 7v6l4 2" stroke="rgba(207,227,255,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="9" stroke="rgba(207,227,255,0.9)" strokeWidth="1.6"/>
              </svg>
            </span>
            <select
              className="al-select"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              aria-label="Filter by time"
            >
              <option value="all">All time</option>
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </label>

          {/* Sort */}
          <label className="al-filter">
            <span className="al-filter-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M4 7h16M4 12h12M4 17h8" stroke="rgba(207,227,255,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </span>
            <select
              className="al-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort by"
            >
              <option value="datetime">Sort: Time</option>
              <option value="severity">Sort: Severity</option>
              <option value="patient">Sort: Patient</option>
              <option value="status">Sort: Status</option>
            </select>
          </label>

          <label className="al-filter">
            <span className="al-filter-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M8 6l4-4 4 4M8 18l4 4 4-4" stroke="rgba(207,227,255,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </span>
            <select
              className="al-select"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              aria-label="Sort direction"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </label>

          {/* View toggle */}
          <div className="al-viewtoggle">
            <label className={`al-toggle ${viewMode === 'cards' ? 'active' : ''}`}>
              <input
                type="radio"
                name="viewmode"
                value="cards"
                checked={viewMode === 'cards'}
                onChange={() => setViewMode('cards')}
              />
              Cards
            </label>
            <label className={`al-toggle ${viewMode === 'list' ? 'active' : ''}`}>
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

      {/* Content */}
      <div className="al-content">
        {filtered.length === 0 ? (
          <div className="al-empty">
            <div className="al-empty-card">
              <div className="al-empty-title">No alerts match your filters</div>
              <div className="al-empty-sub">Try expanding the time window or clearing the search.</div>
              <button
                className="al-secondary-btn"
                onClick={() => { setSearch(''); setSeverityFilter('all'); setStatusFilter('all'); setTimeFilter('all'); }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="al-cards">
            {filtered.map((a) => {
              const sev = normalizeSeverity(a.severity_level);
              const resolved = !!a.resolved;
              return (
                <div key={a.alert_id} className={`al-card sev-${sev} ${resolved ? 'resolved' : 'unresolved'}`}>
                  <div className="al-card-stripe" aria-hidden />
                  <div className="al-card-head">
                    <div className="al-sev-icon" aria-hidden>
                      {sev === 'critical' && (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                          <path d="M12 3l9 18H3L12 3Z" stroke="rgba(255,107,107,0.95)" strokeWidth="1.6"/>
                          <rect x="11" y="9" width="2" height="7" rx="1" fill="rgba(255,107,107,0.95)"/>
                        </svg>
                      )}
                      {sev === 'warning' && (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                          <circle cx="12" cy="12" r="9" stroke="rgba(255,209,102,0.95)" strokeWidth="1.6"/>
                          <path d="M12 7v6" stroke="rgba(255,209,102,0.95)" strokeWidth="1.6" strokeLinecap="round"/>
                          <circle cx="12" cy="16.5" r="1" fill="rgba(255,209,102,0.95)"/>
                        </svg>
                      )}
                      {sev === 'info' && (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                          <circle cx="12" cy="12" r="9" stroke="rgba(43,211,231,0.95)" strokeWidth="1.6"/>
                          <rect x="11" y="10" width="2" height="6" rx="1" fill="rgba(43,211,231,0.95)"/>
                          <circle cx="12" cy="8" r="1" fill="rgba(43,211,231,0.95)"/>
                        </svg>
                      )}
                    </div>
                    <div className="al-patient">
                      <div className="al-patient-name">{a.patient_name || 'Unknown Patient'}</div>
                      <div className="al-patient-id">ID: {a.patient_id}</div>
                    </div>
                    <div className="al-head-right">
                      <span className={`al-badge sev ${sev}`}>{sev}</span>
                      <div className="al-time">{a.datetime ? new Date(a.datetime).toLocaleString() : '--'}</div>
                    </div>
                  </div>

                  <div className="al-card-body">
                    <div className="al-issue">{a.issue_detected || 'Issue detected'}</div>
                    {a.message && <div className="al-message">{a.message}</div>}
                  </div>

                  <div className="al-card-foot">
                    <span className={`al-badge status ${resolved ? 'resolved' : 'unresolved'}`}>
                      {resolved ? '✓ Resolved' : '⚠ Unresolved'}
                    </span>
                    <div className="al-actions">
                      <button className="al-icon-btn" title="Copy Patient ID" onClick={() => navigator.clipboard?.writeText(a.patient_id || '')}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
                          <rect x="9" y="9" width="10" height="12" rx="2" stroke="rgba(207,227,255,0.9)" strokeWidth="1.6"/>
                          <rect x="5" y="3" width="10" height="12" rx="2" stroke="rgba(207,227,255,0.6)" strokeWidth="1.2"/>
                        </svg>
                      </button>
                      <button className="al-icon-btn" title="Refresh" onClick={refreshData}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
                          <path d="M21 12a9 9 0 1 1-2.64-6.36" stroke="rgba(43,211,231,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
                          <path d="M21 5v6h-6" stroke="rgba(43,211,231,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List view
          <div className="al-list">
            <div className="al-list-head">
              <div>Patient</div>
              <div>Severity</div>
              <div>Status</div>
              <div>Issue</div>
              <div>Message</div>
              <div>Time</div>
              <div>Actions</div>
            </div>
            {filtered.map((a) => {
              const sev = normalizeSeverity(a.severity_level);
              const resolved = !!a.resolved;
              return (
                <div key={a.alert_id} className="al-row">
                  <div className="al-cell">
                    <div className="al-pair">
                      <span className="al-strong">{a.patient_name || 'Unknown'}</span>
                      <span className="al-dim">ID: {a.patient_id}</span>
                    </div>
                  </div>
                  <div className="al-cell"><span className={`al-badge sev ${sev}`}>{sev}</span></div>
                  <div className="al-cell"><span className={`al-badge status ${resolved ? 'resolved' : 'unresolved'}`}>{resolved ? 'Resolved' : 'Unresolved'}</span></div>
                  <div className="al-cell">{a.issue_detected || '-'}</div>
                  <div className="al-cell al-ellipsis" title={a.message || ''}>{a.message || '-'}</div>
                  <div className="al-cell">{a.datetime ? new Date(a.datetime).toLocaleString() : '--'}</div>
                  <div className="al-cell al-actions">
                    <button className="al-icon-btn" title="Copy Patient ID" onClick={() => navigator.clipboard?.writeText(a.patient_id || '')}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
                        <rect x="9" y="9" width="10" height="12" rx="2" stroke="rgba(207,227,255,0.9)" strokeWidth="1.6"/>
                        <rect x="5" y="3" width="10" height="12" rx="2" stroke="rgba(207,227,255,0.6)" strokeWidth="1.2"/>
                      </svg>
                    </button>
                    <button className="al-icon-btn" title="Refresh" onClick={refreshData}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
                        <path d="M21 12a9 9 0 1 1-2.64-6.36" stroke="rgba(43,211,231,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
                        <path d="M21 5v6h-6" stroke="rgba(43,211,231,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
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
    --ink2: #a7b8d6;
    --line: rgba(255,255,255,0.10);
    --brand: #22c7b2;
    --brand2: #2bd3e7;
    --ok: #6ee7b7;
    --warn: #ffd166;
    --crit: #ff6b6b;
    --shadow: 0 10px 30px rgba(0,0,0,0.35);
  }

  .alerts-view{ color: var(--ink1); }

  /* Header */
  .al-header{ margin-bottom: 12px; }
  .al-tonal{
    background:
      radial-gradient(900px 500px at -10% 0%, rgba(43,211,231,0.10), transparent 65%),
      radial-gradient(900px 500px at 110% 0%, rgba(34,199,178,0.08), transparent 65%),
      linear-gradient(180deg, #0e1423 0%, #0b111f 100%);
    border: 1px solid var(--line);
    padding: 16px 18px;
    border-radius: 14px;
    box-shadow: var(--shadow);
  }
  .al-title-line{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .al-title-left{ display:flex; gap:10px; align-items:center; }
  .al-title-icon{
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, var(--brand), var(--brand2));
    display: grid; place-items: center;
  }
  .al-title-line h2{ margin: 0; font-weight: 800; color: var(--ink1); }
  .al-count{ color: var(--ink2); font-weight: 700; margin-left: 4px; }

  .al-refresh{
    display:inline-flex; gap:8px; align-items:center;
    background: rgba(15,22,38,0.55);
    border: 1px solid rgba(207,227,255,0.16);
    color: var(--ink1);
    padding: 9px 12px; border-radius: 10px; cursor: pointer;
  }
  .al-spin{ display:inline-block; animation: alSpin 1.2s linear infinite; }
  @keyframes alSpin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }

  /* Stats */
  .al-stats{ display:flex; gap:16px; flex-wrap:wrap; margin-top: 12px; }
  .al-stat{ display:flex; align-items:center; gap:10px; }
  .al-stat-label{ color: var(--ink2); }
  .al-chip{
    display:inline-flex; align-items:center; justify-content:center;
    min-width: 40px; padding: 6px 10px; border-radius: 999px;
    border: 1px solid var(--line);
    background: rgba(13,20,36,0.6);
    font-weight: 700;
  }
  .al-chip.crit{ border-color: rgba(255,107,107,0.35); background: rgba(255,107,107,0.10); }
  .al-chip.warn{ border-color: rgba(255,209,102,0.35); background: rgba(255,209,102,0.10); }
  .al-chip.ok{ border-color: rgba(110,231,183,0.35); background: rgba(110,231,183,0.10); }
  .al-chip.neutral{ border-color: rgba(207,227,255,0.16); }

  /* Tools */
  .al-tools{ display: grid; gap: 14px; padding-top: 12px; }
  .al-search-group{ position: relative; width: clamp(320px, 52vw, 560px); }
  .al-input-icon{ position:absolute; top:50%; left:10px; transform:translateY(-50%); pointer-events:none; }
  .al-input{
    width:100%; background: var(--panel); color: var(--ink1);
    border: 1px solid var(--line); padding: 11px 12px 11px 36px; border-radius: 12px; outline:none;
  }
  .al-input::placeholder{ color: #97a9c8; }

  .al-filter-row{ display:flex; flex-wrap:wrap; gap:16px 18px; }

  .al-filter{
    display:inline-flex; align-items:center; gap:10px;
    background: var(--panel); border:1px solid var(--line);
    border-radius:14px; padding:10px 14px; position:relative;
  }
  .al-filter::after{
    content:'▾'; position:absolute; right:10px; font-size:12px;
    color: rgba(43,211,231,0.85); pointer-events:none;
  }
  .al-filter-icon{ display:grid; place-items:center; width:18px; height:18px; }

  .al-select{
    -webkit-appearance:none; appearance:none;
    background:#0f1a2e; color:var(--ink1);
    border:1px solid rgba(255,255,255,0.06);
    border-radius:10px; padding:10px 28px 10px 12px;
    outline:none; line-height:1.35;
  }
  .al-select:focus-visible{
    border-color: rgba(43,211,231,0.45);
    box-shadow: 0 0 0 3px rgba(43,211,231,0.20);
  }
  .al-select::-ms-expand{ display:none; }
  .al-select option, .al-select optgroup{
    background:#0f1a2e; color:#e7f0ff; line-height:1.7; padding:8px 10px;
  }
  .al-select option:hover{ background: rgba(43,211,231,0.20); }
  .al-select option:checked{ background: linear-gradient(135deg, var(--brand), var(--brand2)); color:#07111f; }

  .al-viewtoggle{ display:flex; gap:8px; align-items:center; margin-left:auto; flex-wrap:wrap; }
  .al-toggle{
    display:inline-flex; gap:6px; align-items:center;
    background: var(--panel); border:1px solid var(--line);
    padding:9px 12px; border-radius:10px; color:var(--ink1); cursor:pointer;
  }
  .al-toggle.active{ border-color: rgba(43,211,231,0.35); }

  /* Content - empty */
  .al-empty{ display:grid; place-items:center; padding:32px 10px; }
  .al-empty-card{
    max-width:560px; text-align:center; padding:22px; border-radius:14px;
    background: rgba(13,20,36,0.85); border:1px solid var(--line); box-shadow: var(--shadow);
  }
  .al-empty-title{ font-weight:800; margin-bottom:6px; }
  .al-empty-sub{ color: var(--ink2); margin-bottom:12px; }
  .al-secondary-btn{
    background: transparent; border:1px solid var(--line); color:var(--ink1);
    padding: 8px 12px; border-radius: 10px; cursor: pointer;
  }

  /* Cards */
  .al-cards{
    margin-top:12px;
    display:grid; gap:12px;
    grid-template-columns: repeat(3, minmax(0,1fr));
  }
  @media (max-width: 1100px){ .al-cards{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
  @media (max-width: 640px){ .al-cards{ grid-template-columns: 1fr; } }

  .al-card{
    position:relative;
    border: 1px solid var(--line);
    border-radius: 14px;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(17,26,47,0.9), rgba(15,22,38,0.9));
    box-shadow: var(--shadow);
  }
  .al-card-stripe{
    position:absolute; left:0; top:0; bottom:0; width:6px; opacity:.9;
    background: linear-gradient(180deg, var(--brand), var(--brand2));
  }
  .al-card.sev-critical .al-card-stripe{ background: linear-gradient(180deg, #ef476f, #ff6b6b); }
  .al-card.sev-warning .al-card-stripe{ background: linear-gradient(180deg, #ffd166, #ffb703); }
  .al-card.sev-info .al-card-stripe{ background: linear-gradient(180deg, #2bd3e7, #22c7b2); }

  .al-card-head{
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    padding: 14px 14px 6px 14px; padding-left: 22px;
  }
  .al-sev-icon{
    width:34px; height:34px; border-radius:10px; display:grid; place-items:center;
    background: rgba(13,20,36,0.7); border:1px solid rgba(207,227,255,0.12);
  }
  .al-patient{ flex:1; min-width: 0; }
  .al-patient-name{ font-weight:800; }
  .al-patient-id{ color: var(--ink2); font-size:.9rem; }
  .al-head-right{ display:grid; gap:6px; justify-items:end; }
  .al-time{ color: var(--ink2); font-size:.9rem; }

  .al-card-body{ padding: 6px 14px 8px 22px; }
  .al-issue{ font-weight:700; margin-bottom:4px; }
  .al-message{ color: var(--ink2); }

  .al-card-foot{
    display:flex; align-items:center; justify-content:space-between; gap:10px;
    padding: 8px 14px 14px 22px;
  }
  .al-badge{
    display:inline-flex; align-items:center; gap:8px;
    padding:6px 10px; border-radius:999px; font-size:.9rem;
    border:1px solid var(--line); background: rgba(13,20,36,0.6); color: var(--ink1);
    text-transform: capitalize;
  }
  .al-badge.sev.critical{ border-color: rgba(255,107,107,0.35); background: rgba(255,107,107,0.08); }
  .al-badge.sev.warning{ border-color: rgba(255,209,102,0.35); background: rgba(255,209,102,0.08); }
  .al-badge.sev.info{ border-color: rgba(43,211,231,0.35); background: rgba(43,211,231,0.08); }
  .al-badge.status.resolved{ border-color: rgba(110,231,183,0.35); background: rgba(110,231,183,0.10); }
  .al-badge.status.unresolved{ border-color: rgba(255,209,102,0.35); background: rgba(255,209,102,0.10); }

  .al-actions{ display:flex; gap:8px; }
  .al-icon-btn{
    background: rgba(13,20,36,0.55); border:1px solid var(--line); color: var(--ink1);
    padding: 8px 10px; border-radius: 10px; cursor: pointer;
  }

  /* List */
  .al-list{ margin-top:12px; border:1px solid var(--line); border-radius:14px; overflow:hidden; box-shadow: var(--shadow); }
  .al-list-head, .al-row{
    display:grid; grid-template-columns: 1.2fr .7fr .8fr 1.2fr 1.4fr 1fr .7fr; gap:10px;
    align-items:center;
  }
  .al-list-head{
    padding:12px; background: rgba(207,227,255,0.06); color: var(--ink2); font-weight:700;
  }
  .al-row{ padding:12px; border-top:1px solid rgba(255,255,255,0.05); background: rgba(15,22,38,0.9); }
  .al-row:hover{ background: rgba(32,213,164,0.05); }
  .al-cell .al-pair{ display:flex; flex-direction:column; }
  .al-strong{ font-weight:700; }
  .al-dim{ color: var(--ink2); font-size:.9rem; }
  .al-ellipsis{ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Skeleton */
  .al-skeleton{
    height: 160px; border-radius: 14px;
    background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.12), rgba(255,255,255,0.05));
    background-size: 200% 100%; animation: alShimmer 1.1s infinite linear;
    margin-top: 12px;
  }
  @keyframes alShimmer{ 0%{background-position: 200% 0;} 100%{background-position: -200% 0;} }
`;

export default AlertsView;
