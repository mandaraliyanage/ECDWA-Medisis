import React from 'react';

// Drop-in UI upgrade: same props (stats, alerts, onNavigate, patients)
// No API/logic changes; adds spacing + lightweight SVG visuals.
const DashboardView = ({ stats, alerts, onNavigate, patients }) => {
  // ===== Derived fallbacks (unchanged logic) =====
  const totalPatients = patients?.length || 0;
  const activePatients = patients?.filter(p => p.connection_status === 'Online').length || 0;
  const criticalAlertsToday = patients?.filter(p =>
    p.heart_rate < 50 || p.heart_rate > 120 || p.oxygen_level < 90
  ).length || 0;
  const unresolvedAlerts = alerts?.filter(alert => !alert.resolved).length || 0;

  const avgHeartRate = patients?.length > 0
    ? Math.round(patients.reduce((sum, p) => sum + (p.heart_rate || 0), 0) / patients.length)
    : 0;
  const avgOxygenLevel = patients?.length > 0
    ? Math.round(patients.reduce((sum, p) => sum + (p.oxygen_level || 0), 0) / patients.length)
    : 0;

  const _stats = {
    totalPatients: stats?.total_patients ?? totalPatients,
    activePatients: stats?.active_patients ?? activePatients,
    criticalAlertsToday: stats?.critical_alerts_today ?? criticalAlertsToday,
    unresolvedAlerts: stats?.unresolved_alerts ?? unresolvedAlerts,
    avgHR: stats?.avg_heart_rate_today ?? avgHeartRate,
    avgSpO2: stats?.avg_oxygen_level_today ?? avgOxygenLevel,
    totalAlertsToday: stats?.total_alerts_today ?? alerts?.length ?? 0,
  };

  const activePct = _stats.totalPatients > 0
    ? Math.round((_stats.activePatients / _stats.totalPatients) * 100)
    : 0;

  const hrPct = Math.max(0, Math.min(100, Math.round(((_stats.avgHR - 40) / (120 - 40)) * 100)));
  const spo2Pct = Math.max(0, Math.min(100, Math.round(((_stats.avgSpO2 - 85) / (100 - 85)) * 100)));

  // ===== Light visualizations (no external libs) =====
  const hrValues = (patients || [])
    .map(p => Number(p.heart_rate))
    .filter(v => Number.isFinite(v) && v > 0);

  const spo2Values = (patients || [])
    .map(p => Number(p.oxygen_level))
    .filter(v => Number.isFinite(v) && v > 0);

  // Sparkline path generator
  const makeSparklinePath = (vals, w = 220, h = 54, padX = 6, padY = 6) => {
    if (!vals || vals.length <= 1) return '';
    const min = Math.min(...vals), max = Math.max(...vals);
    const innerW = w - padX * 2;
    const innerH = h - padY * 2;
    const step = innerW / (vals.length - 1 || 1);
    const y = v => {
      if (max === min) return padY + innerH / 2;
      // Higher values appear higher on chart
      const t = (v - min) / (max - min);
      return padY + innerH - t * innerH;
    };
    let d = `M ${padX} ${y(vals[0])}`;
    for (let i = 1; i < vals.length; i++) d += ` L ${padX + i * step} ${y(vals[i])}`;
    return d;
  };

  // Distribution bars
  const dist = (vals, rules) => {
    const initial = Object.keys(rules).reduce((o, k) => ({ ...o, [k]: 0 }), {});
    const out = vals.reduce((acc, v) => {
      const key = Object.keys(rules).find(k => rules[k](v));
      if (key) acc[key] += 1;
      return acc;
    }, initial);
    const total = vals.length || 1;
    Object.keys(out).forEach(k => (out[k] = Math.round((out[k] / total) * 100)));
    return out;
  };

  const hrDist = dist(hrValues, {
    ok: v => v >= 60 && v <= 100,
    warn: v => (v >= 50 && v < 60) || (v > 100 && v <= 120),
    crit: v => v < 50 || v > 120,
  });

  const spo2Dist = dist(spo2Values, {
    ok: v => v >= 95,
    warn: v => v >= 90 && v < 95,
    crit: v => v < 90,
  });

  // Alerts by hour (last 24h) -> tiny bar chart
  const byHour = Array.from({ length: 24 }, () => 0);
  (alerts || []).forEach(a => {
    const t = new Date(a.datetime).getTime();
    if (!Number.isFinite(t)) return;
    const hr = new Date(t).getHours();
    byHour[hr] += 1;
  });
  const maxHour = Math.max(1, ...byHour);

  const title = 'Vitals & Patients Overview';

  return (
    <div className="health-dashboard">
      {/* Theme (scoped) */}
      <style>{`
        :root {
          --bg: #0b1220;
          --card: #101a2e;
          --card-2: #0f1626;
          --ink-1: #dbe8ff;
          --ink-2: #9fb3d6;
          --brand: #20d5a4;
          --brand-2: #2bd3e7;
          --danger: #ff6b6b;
          --warning: #ffd166;
          --okay: #6ee7b7;
          --ring: rgba(43, 211, 231, 0.35);
          --muted: #17233c;
          --shadow: 0 14px 34px rgba(0,0,0,0.35);
        }

        .health-dashboard {
          min-height: 100%;
          padding: 28px 22px 40px;
          background:
            radial-gradient(1200px 800px at 12% -12%, rgba(43,211,231,0.12), transparent 55%),
            radial-gradient(1000px 900px at 88% -18%, rgba(32,213,164,0.10), transparent 55%),
            linear-gradient(180deg, #0b1220 0%, #0a0f1a 100%);
          color: var(--ink-1);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
        }

        .hd-shell { max-width: 1280px; margin: 0 auto; padding-top: 6px; }

        .hd-header {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 18px;
          margin: 6px 0 22px;
          padding: 16px 18px;
          border-radius: 16px;
          background:
            radial-gradient(700px 500px at -10% 0%, rgba(43,211,231,0.10), transparent 65%),
            radial-gradient(700px 500px at 110% 0%, rgba(32,213,164,0.08), transparent 65%),
            linear-gradient(180deg, #0f1626 0%, #0b1424 100%);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: var(--shadow);
        }

        .hd-title { display: flex; align-items: center; gap: 12px; }
        .hd-logo {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg, var(--brand), var(--brand-2));
          display: grid; place-items: center;
          box-shadow: var(--shadow);
        }
        .hd-title h2 { margin: 0; font-weight: 900; letter-spacing: .2px; }
        .hd-sub { color: var(--ink-2); font-size: .95rem; margin-top: 2px; }

        .hd-actions { display: flex; gap: 10px; }
        .hd-btn {
          background: linear-gradient(135deg, rgba(32,213,164,0.18), rgba(43,211,231,0.14));
          border: 1px solid rgba(43,211,231,0.28);
          color: var(--ink-1);
          padding: 10px 14px; border-radius: 12px; cursor: pointer;
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
        }
        .hd-btn:hover { transform: translateY(-1px); box-shadow: var(--shadow); }

        /* KPI Grid */
        .kpi-grid {
          display: grid; grid-template-columns: repeat(4, minmax(0,1fr));
          gap: 16px; margin-bottom: 18px;
        }
        @media (max-width: 1100px){ .kpi-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (max-width: 640px){ .kpi-grid { grid-template-columns: 1fr; } }

        .kpi-card {
          position: relative; overflow: hidden; border-radius: 16px; padding: 16px;
          background: linear-gradient(180deg, rgba(16,26,46,0.92), rgba(15,22,38,0.92));
          border: 1px solid rgba(207,227,255,0.10);
          box-shadow: var(--shadow);
          cursor: pointer;
          transition: transform .12s ease, border-color .12s ease, background .2s ease;
        }
        .kpi-card:hover { transform: translateY(-2px); border-color: var(--ring); }
        .kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .kpi-pill {
          font-size: 0.78rem; padding: 6px 10px; border-radius: 999px;
          background: rgba(32,213,164,0.12); border: 1px solid rgba(32,213,164,0.3);
          color: var(--ink-1);
        }
        .kpi-icon { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; }
        .kpi-icon.teal { background: rgba(32,213,164,0.18); border: 1px solid rgba(32,213,164,0.35); }
        .kpi-icon.cyan { background: rgba(43,211,231,0.18); border: 1px solid rgba(43,211,231,0.35); }
        .kpi-icon.red { background: rgba(255,107,107,0.18); border: 1px solid rgba(255,107,107,0.35); }
        .kpi-icon.amber { background: rgba(255,209,102,0.18); border: 1px solid rgba(255,209,102,0.35); }

        .kpi-value { font-size: 2rem; font-weight: 900; letter-spacing: .3px; margin-bottom: 6px; }
        .kpi-sub { color: var(--ink-2); font-size: 0.9rem; }

        /* Visuals inside KPI cards */
        .donut {
          width: 96px; height: 96px; display: grid; place-items: center;
          margin-left: auto;
        }
        .donut .center {
          position: absolute; text-align: center; font-weight: 800;
          color: var(--ink-1); font-size: .9rem;
        }

        .spark {
          margin-top: 8px; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 8px;
        }

        /* Metrics Row */
        .metrics-row { display: grid; grid-template-columns: 1.25fr 1fr 1fr; gap: 16px; }
        @media (max-width: 1100px){ .metrics-row { grid-template-columns: 1fr; } }

        .panel {
          background: linear-gradient(180deg, rgba(16,26,46,0.92), rgba(15,22,38,0.92));
          border: 1px solid rgba(207,227,255,0.10);
          border-radius: 16px; padding: 16px 16px 14px; box-shadow: var(--shadow);
        }
        .panel h3 { margin: 0 0 12px; font-size: 1.02rem; letter-spacing: .2px; }

        .progress {
          height: 10px; background: var(--muted); border-radius: 999px; overflow: hidden;
          outline: 1px solid rgba(207,227,255,0.08);
        }
        .progress > span { display: block; height: 100%; border-radius: 999px; }
        .bar-teal { background: linear-gradient(90deg, var(--brand), var(--brand-2)); }
        .bar-red { background: linear-gradient(90deg, #ef476f, #ff6b6b); }

        .rows { display: grid; gap: 12px; }
        .row { display: grid; gap: 10px; }
        .metric-line { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .metric-line .label { color: var(--ink-2); font-size: .92rem; }
        .metric-line .val { font-weight: 800; }

        /* Tiny distribution bars */
        .dist { display:flex; gap:8px; margin-top: 8px; }
        .dist .seg { height: 10px; border-radius: 999px; }
        .seg.ok { background: rgba(110,231,183,0.35); }
        .seg.warn { background: rgba(255,209,102,0.45); }
        .seg.crit { background: rgba(255,107,107,0.55); }

        /* Alerts Panel */
        .alerts { display: grid; gap: 10px; }
        .alert-banner {
          display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px;
          background: linear-gradient(135deg, rgba(255,107,107,0.12), rgba(255,209,102,0.10));
          border: 1px solid rgba(255,107,107,0.35);
          padding: 12px; border-radius: 14px;
        }
        .alert-banner strong { color: #ffd1d1; }
        .alert-actions { display: flex; gap: 8px; }
        .btn-ghost { background: transparent; border: 1px solid rgba(207,227,255,0.14); color: var(--ink-1); padding: 8px 12px; border-radius: 10px; cursor: pointer; }
        .btn-primary { background: linear-gradient(135deg, var(--brand), var(--brand-2)); border: none; color: #07111f; font-weight: 900; padding: 9px 12px; border-radius: 10px; cursor: pointer; }

        /* Mini patients strip */
        .patients-strip { display: grid; gap: 10px; }
        .pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .pill {
          padding: 8px 10px; border-radius: 999px; font-size: .88rem; color: var(--ink-1);
          border: 1px solid rgba(207,227,255,0.1); background: rgba(15,22,38,0.66);
        }
        .pill.online { border-color: rgba(32,213,164,0.35); background: rgba(32,213,164,0.08); }
        .pill.offline { border-color: rgba(255,107,107,0.35); background: rgba(255,107,107,0.08); }
        .pill .dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; margin-right: 6px; }
        .dot.online { background: var(--okay); }
        .dot.offline { background: var(--danger); }

        /* Tiny bars (alerts by hour) */
        .bars { display:flex; align-items:flex-end; gap: 3px; height: 56px; margin-top: 6px; }
        .bar { width: 8px; background: linear-gradient(180deg, var(--brand-2), var(--brand)); border-radius: 4px; opacity: .85; }
        .bars .bar.mute { background: rgba(207,227,255,0.18); }

        .muted { color: var(--ink-2); }
      `}</style>

      <div className="hd-shell">
        {/* ===== Header ===== */}
        <div className="hd-header">
          <div className="hd-title">
            <div className="hd-logo" aria-hidden>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h3l2-4 4 8 2-4h5" stroke="#07111f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2>{title}</h2>
              <div className="hd-sub">Real-time insight into patient vitals, alerts, and connectivity</div>
            </div>
          </div>
          <div className="hd-actions">
            <button className="hd-btn" onClick={() => onNavigate && onNavigate('patients')}>Patients</button>
            <button className="hd-btn" onClick={() => onNavigate && onNavigate('alerts')}>Alerts</button>
          </div>
        </div>

        {/* ===== KPI Grid ===== */}
        <div className="kpi-grid">
          {/* Total Patients + donut active */}
          <div className="kpi-card" onClick={() => onNavigate && onNavigate('patients')}>
            <div className="kpi-top">
              <span className="kpi-pill">Total Patients</span>
              <div className="kpi-icon teal" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 3-9 6v1h18v-1c0-3-4-6-9-6Z" fill="rgba(32,213,164,0.9)"/>
                </svg>
              </div>
            </div>
            <div className="kpi-value">{_stats.totalPatients}</div>
            <div className="kpi-sub">Active: {activePct}%</div>

            {/* Donut */}
            <div className="donut" aria-label="Active vs Inactive">
              {(() => {
                const r = 36, c = 2 * Math.PI * r;
                const pct = Math.max(0, Math.min(100, activePct));
                const dash = (pct / 100) * c;
                return (
                  <svg width="96" height="96" viewBox="0 0 96 96">
                    <g transform="translate(48,48)">
                      <circle r={36} cx="0" cy="0" fill="none" stroke="rgba(207,227,255,0.15)" strokeWidth="12" />
                      <circle
                        r={36} cx="0" cy="0" fill="none"
                        stroke="url(#grad)"
                        strokeWidth="12"
                        strokeDasharray={`${dash} ${c - dash}`}
                        strokeLinecap="round"
                        transform="rotate(-90)"
                      />
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={getComputedStyle(document.documentElement).getPropertyValue('--brand') || '#20d5a4'} />
                          <stop offset="100%" stopColor={getComputedStyle(document.documentElement).getPropertyValue('--brand-2') || '#2bd3e7'} />
                        </linearGradient>
                      </defs>
                    </g>
                  </svg>
                );
              })()}
            </div>
          </div>

          {/* Active Patients + HR sparkline */}
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-pill">Active Patients</span>
              <div className="kpi-icon cyan" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M2 12a10 10 0 0 1 20 0" stroke="rgba(43,211,231,0.9)" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="2" fill="rgba(43,211,231,0.9)"/>
                </svg>
              </div>
            </div>
            <div className="kpi-value">{_stats.activePatients}</div>
            <div className="progress" aria-label="Active percentage"><span className="bar-teal" style={{width: `${activePct}%`}}/></div>
            <div className="spark" aria-hidden>
              <svg width="100%" height="54" viewBox="0 0 220 54" preserveAspectRatio="none">
                <path d={makeSparklinePath(hrValues.slice(0, 40).sort((a,b)=>a-b))} fill="none" stroke="rgba(43,211,231,0.9)" strokeWidth="2"/>
              </svg>
            </div>
          </div>

          {/* Critical Alerts + bars by hour */}
          <div className="kpi-card" onClick={() => onNavigate && onNavigate('alerts')}>
            <div className="kpi-top">
              <span className="kpi-pill">Critical Alerts Today</span>
              <div className="kpi-icon red" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21s-7-4.5-9-9a5.3 5.3 0 0 1 9-5 5.3 5.3 0 0 1 9 5c-2 4.5-9 9-9 9Z" fill="rgba(255,107,107,0.9)"/>
                </svg>
              </div>
            </div>
            <div className="kpi-value">{_stats.criticalAlertsToday}</div>
            <div className="bars" aria-label="Alerts by hour">
              {byHour.map((v, i) => {
                const h = Math.max(3, Math.round((v / maxHour) * 54));
                return <div key={i} className={`bar ${v === 0 ? 'mute':''}`} style={{height: `${h}px`}} />;
              })}
            </div>
          </div>

          {/* Unresolved Alerts + distributions */}
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-pill">Unresolved Alerts</span>
              <div className="kpi-icon amber" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm8-6V11a8 8 0 1 0-16 0v5l-2 2v1h20v-1Z" fill="rgba(255,209,102,0.95)"/>
                </svg>
              </div>
            </div>
            <div className="kpi-value">{_stats.unresolvedAlerts}</div>
            <div className="kpi-sub">HR/SpO₂ distribution</div>
            <div className="dist" aria-label="HR distribution">
              <div className="seg ok" style={{width: `${hrDist.ok}%`}} title={`HR OK ${hrDist.ok}%`}/>
              <div className="seg warn" style={{width: `${hrDist.warn}%`}} title={`HR Warn ${hrDist.warn}%`}/>
              <div className="seg crit" style={{width: `${hrDist.crit}%`}} title={`HR Critical ${hrDist.crit}%`}/>
            </div>
            <div className="dist" aria-label="SpO2 distribution">
              <div className="seg ok" style={{width: `${spo2Dist.ok}%`}} title={`SpO₂ OK ${spo2Dist.ok}%`}/>
              <div className="seg warn" style={{width: `${spo2Dist.warn}%`}} title={`SpO₂ Warn ${spo2Dist.warn}%`}/>
              <div className="seg crit" style={{width: `${spo2Dist.crit}%`}} title={`SpO₂ Critical ${spo2Dist.crit}%`}/>
            </div>
          </div>
        </div>

        {/* ===== Metrics + Alerts + Patients ===== */}
        <div className="metrics-row">
          {/* Vitals panel */}
          <div className="panel">
            <h3>Population Vitals (Today)</h3>
            <div className="rows">
              <div className="row">
                <div className="metric-line"><span className="label">Average Heart Rate</span><span className="val">{_stats.avgHR} bpm</span></div>
                <div className="progress" aria-label="Average heart rate"><span className="bar-teal" style={{ width: `${hrPct}%` }} /></div>
              </div>
              <div className="row">
                <div className="metric-line"><span className="label">Average Oxygen Saturation</span><span className="val">{_stats.avgSpO2}%</span></div>
                <div className="progress" aria-label="Average oxygen saturation"><span className="bar-teal" style={{ width: `${spo2Pct}%` }} /></div>
              </div>
              <div className="row">
                <div className="metric-line"><span className="label">Total Alerts (24h)</span><span className="val">{_stats.totalAlertsToday}</span></div>
                <div className="progress" aria-label="Total alerts density"><span className="bar-red" style={{ width: `${Math.min(100, _stats.totalAlertsToday * 4)}%` }} /></div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="panel alerts">
            <h3>Alert Center</h3>
            <div className="alert-banner">
              <div>
                {_stats.criticalAlertsToday > 0 ? (
                  <div>
                    <strong>{_stats.criticalAlertsToday}</strong> critical alert{_stats.criticalAlertsToday !== 1 ? 's' : ''} require attention today.
                  </div>
                ) : (
                  <div className="muted">No critical alerts in the last 24 hours.</div>
                )}
                <div className="muted">Unresolved incidents: <strong>{_stats.unresolvedAlerts}</strong></div>
              </div>
              <div className="alert-actions">
                <button className="btn-ghost" onClick={() => onNavigate && onNavigate('alerts')}>View All</button>
                <button className="btn-primary" onClick={() => onNavigate && onNavigate('alerts')}>Open Triage</button>
              </div>
            </div>
          </div>

          {/* Patients quick view */}
          <div className="panel patients-strip">
            <h3>Connectivity Snapshot</h3>
            <div className="pills">
              {(patients?.slice(0, 12) || []).map((p, idx) => (
                <div key={idx} className={`pill ${p.connection_status === 'Online' ? 'online' : 'offline'}`}>
                  <span className={`dot ${p.connection_status === 'Online' ? 'online' : 'offline'}`} />
                  {p.name || p.patient_id || `Patient ${idx+1}`} · {p.connection_status || 'Unknown'}
                </div>
              ))}
              {(!patients || patients.length === 0) && (
                <div className="muted">No patients to display</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
