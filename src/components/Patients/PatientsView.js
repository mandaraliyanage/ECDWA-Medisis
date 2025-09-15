import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import PatientForm from './PatientForm';
import { createPatient, updatePatient, deletePatient } from '../../services/api';

const PatientsView = ({ patients }) => {
  const { loading, refreshData } = useAppContext();

  // UI state (client-only)
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [showOnlyActiveCards, setShowOnlyActiveCards] = useState(true);

  // Filters / sort
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | online | offline
  const [genderFilter, setGenderFilter] = useState('all'); // all | Male | Female | Other
  const [sortBy, setSortBy] = useState('last_reading'); // last_reading | patient_id | heart_rate | oxygen_level | name
  const [sortDir, setSortDir] = useState('desc'); // asc | desc

  // Optional announcement banner
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const handleAddPatient = () => {
    setEditingPatient(null);
    setShowForm(true);
  };
  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };
  const handleDeletePatient = (patient) => setDeleteConfirm(patient);

  const confirmDelete = async () => {
    try {
      await deletePatient(deleteConfirm.patient_id);
      setDeleteConfirm(null);
      refreshData();
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Error deleting patient: ${error.message}`);
    }
  };

  const handleSavePatient = async (patientData) => {
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.patient_id, patientData);
      } else {
        await createPatient(patientData);
      }
      setShowForm(false);
      setEditingPatient(null);
      refreshData();
    } catch (error) {
      throw error;
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPatient(null);
  };

  const preparedPatients = Array.isArray(patients) ? patients : [];

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = preparedPatients.filter((p) => {
      const statusOk =
        statusFilter === 'all' ||
        (statusFilter === 'online' && (p.connection_status || '').toLowerCase() === 'online') ||
        (statusFilter === 'offline' && (p.connection_status || '').toLowerCase() === 'offline');

      const genderOk = genderFilter === 'all' || (p.gender || '').toLowerCase() === genderFilter.toLowerCase();

      const textOk =
        q === '' ||
        [p.name, p.patient_id, p.medical_conditions, p.gender]
          .map((v) => (v || '').toString().toLowerCase())
          .some((s) => s.includes(q));

      return statusOk && genderOk && textOk;
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
      if (sortBy === 'heart_rate') {
        return (((a.heart_rate ?? -Infinity) - (b.heart_rate ?? -Infinity)) * dir);
      }
      if (sortBy === 'oxygen_level') {
        return (((a.oxygen_level ?? -Infinity) - (b.oxygen_level ?? -Infinity)) * dir);
      }

      // default: last_reading
      const at = a.last_reading ? new Date(a.last_reading).getTime() : -Infinity;
      const bt = b.last_reading ? new Date(b.last_reading).getTime() : -Infinity;
      return (at - bt) * dir;
    });

    return rows;
  }, [preparedPatients, search, statusFilter, genderFilter, sortBy, sortDir]);

  const cardPatients = useMemo(() => {
    let rows = filteredPatients;
    if (showOnlyActiveCards) {
      rows = rows.filter((p) => (p.connection_status || '').toLowerCase() === 'online');
    }
    return rows.slice(0, 12);
  }, [filteredPatients, showOnlyActiveCards]);

  if (loading) {
    return (
      <div className="patients-view">
        <style>{styles}</style>
        <div className="pv-header pv-tonal">
          <div className="pv-title-line">
            <h2>Patients <span className="pv-count">({preparedPatients.length})</span></h2>
          </div>
        </div>
        <div className="pv-skeleton" />
      </div>
    );
  }

  return (
    <div className="patients-view">
      <style>{styles}</style>

      {/* Header (single line: title + count only) */}
      <div className="pv-header pv-tonal">
        <div className="pv-title-line">
          <div className="pv-title-left">
            <div className="pv-title-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M10 3h4v4h4v4h-4v4h-4v-4H6V7h4V3Z" fill="#07111f"/>
              </svg>
            </div>
            <h2>Patients <span className="pv-count">({filteredPatients.length})</span></h2>
          </div>
        </div>
      </div>

      {/* Optional announcement */}
      {showAnnouncement && (
        <div className="pv-announce">
          <div className="pv-announce-left">
            <div className="pv-announce-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path d="M12 3l9 18H3L12 3Z" stroke="rgba(43,211,231,0.9)" strokeWidth="1.6"/>
                <circle cx="12" cy="10" r="1" fill="rgba(43,211,231,0.9)"/>
                <rect x="11" y="12" width="2" height="6" rx="1" fill="rgba(43,211,231,0.9)"/>
              </svg>
            </div>
            <div className="pv-announce-text">
              <strong>Clinic notice:</strong> Wearables sync window is scheduled today 14:00–15:00. Live vitals may slightly delay.
            </div>
          </div>
          <button className="pv-announce-close" onClick={() => setShowAnnouncement(false)} aria-label="Dismiss announcement">×</button>
        </div>
      )}

      {/* Filters / tools (spaced, multi-line allowed) */}
      <div className="pv-tools">
        <div className="pv-search-group">
          <span className="pv-input-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <circle cx="11" cy="11" r="6.5" stroke="rgba(207,227,255,0.8)" strokeWidth="1.6"/>
              <path d="M17 17l4 4" stroke="rgba(207,227,255,0.8)" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            className="pv-input pv-search"
            type="text"
            placeholder="Search by name, ID, condition…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search patients"
          />
        </div>

        <div className="pv-filter-row">
          <label className="pv-filter">
            <span className="pv-filter-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M3 5h18M6 12h12M10 19h4" stroke="rgba(43,211,231,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </span>
            <select
              className="pv-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </label>

          <label className="pv-filter">
            <span className="pv-filter-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0" stroke="rgba(32,213,164,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </span>
            <select
              className="pv-select"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              aria-label="Filter by gender"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="pv-filter">
            <span className="pv-filter-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M4 7h16M4 12h12M4 17h8" stroke="rgba(207,227,255,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </span>
            <select
              className="pv-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort by"
            >
              <option value="last_reading">Sort: Last Reading</option>
              <option value="patient_id">Sort: Patient ID</option>
              <option value="name">Sort: Name</option>
              <option value="heart_rate">Sort: Heart Rate</option>
              <option value="oxygen_level">Sort: SpO₂</option>
            </select>
          </label>

          <label className="pv-filter">
            <span className="pv-filter-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <path d="M8 6l4-4 4 4M8 18l4 4 4-4" stroke="rgba(207,227,255,0.85)" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </span>
            <select
              className="pv-select"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              aria-label="Sort direction"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </label>

          <div className="pv-viewtoggle">
            <label className={`pv-toggle ${viewMode === 'table' ? 'active' : ''}`}>
              <input
                type="radio"
                name="viewmode"
                value="table"
                checked={viewMode === 'table'}
                onChange={() => setViewMode('table')}
              />
              Table
            </label>
            <label className={`pv-toggle ${viewMode === 'cards' ? 'active' : ''}`}>
              <input
                type="radio"
                name="viewmode"
                value="cards"
                checked={viewMode === 'cards'}
                onChange={() => setViewMode('cards')}
              />
              Cards
            </label>
            {/* <button onClick={handleAddPatient} className="pv-primary-btn">
              <span className="pv-plus" aria-hidden>+</span> Add Patient
            </button> */}
          </div>
        </div>
      </div>

      {/* Cards (quick glance) */}
      {viewMode === 'cards' && (
        <div className="pv-cards-wrap">
          <div className="pv-cards-head">
            <div className="pv-cards-title">Quick Overview</div>
            <label className="pv-check">
              <input
                type="checkbox"
                checked={showOnlyActiveCards}
                onChange={(e) => setShowOnlyActiveCards(e.target.checked)}
              />
              Show only active
            </label>
          </div>
          <div className="pv-cards">
            {cardPatients.length === 0 ? (
              <div className="pv-empty-inline">No matching patients.</div>
            ) : (
              cardPatients.map((p) => {
                const online = (p.connection_status || '').toLowerCase() === 'online';
                const hrClass = p.heart_rate > 100 ? 'crit' : p.heart_rate < 60 ? 'warn' : 'ok';
                const oxClass = p.oxygen_level < 90 ? 'crit' : p.oxygen_level < 95 ? 'warn' : 'ok';
                return (
                  <div key={p.patient_id} className="pv-card">
                    <div className="pv-card-top">
                      <div className="pv-card-id">{p.patient_id}</div>
                      <span className={`pv-badge ${online ? 'online' : 'offline'}`}>
                        <span className={`pv-dot ${online ? 'online' : 'offline'}`} />
                        {p.connection_status || 'Unknown'}
                      </span>
                    </div>
                    <div className="pv-card-name">{p.name || 'Unnamed'}</div>
                    <div className="pv-card-meta">
                      {p.gender ? `${p.gender}` : '—'} {p.age ? `· ${p.age}y` : ''}
                    </div>
                    <div className="pv-chiprow">
                      <span className={`pv-chip ${hrClass}`}>{p.heart_rate ?? '--'} {p.heart_rate ? 'bpm' : ''}</span>
                      <span className={`pv-chip ${oxClass}`}>{p.oxygen_level ?? '--'}{p.oxygen_level ? '%' : ''}</span>
                    </div>
                    <div className="pv-card-cond" title={p.medical_conditions || ''}>
                      {p.medical_conditions || 'No conditions listed'}
                    </div>
                    <div className="pv-card-foot">
                      <div className="pv-time">
                        {p.last_reading ? new Date(p.last_reading).toLocaleString() : 'No data'}
                      </div>
                      <div className="pv-actions">
                        <button className="pv-icon-btn" onClick={() => handleEditPatient(p)} title="Edit" aria-label="Edit">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                            <path d="M4 17.5V20h2.5l10-10-2.5-2.5-10 10Z" stroke="rgba(207,227,255,0.9)" strokeWidth="1.6"/>
                            <path d="M14 5l2.5 2.5" stroke="rgba(207,227,255,0.9)" strokeWidth="1.6"/>
                          </svg>
                        </button>
                        <button className="pv-icon-btn danger" onClick={() => handleDeletePatient(p)} title="Delete" aria-label="Delete">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                            <path d="M5 7h14M10 11v6M14 11v6M7 7l1 12h8l1-12M9 7V5h6v2" stroke="rgba(255,107,107,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {viewMode === 'table' && (
        <div className="pv-table-wrap">
          {filteredPatients.length === 0 ? (
            <div className="pv-empty">
              <div className="pv-empty-card">
                <div className="pv-empty-title">No patients match your filters</div>
                <div className="pv-empty-sub">Try clearing search or changing filters.</div>
                <button
                  onClick={() => { setSearch(''); setStatusFilter('all'); setGenderFilter('all'); }}
                  className="pv-secondary-btn"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <table className="pv-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Last Reading</th>
                  <th>Heart Rate</th>
                  <th>Oxygen Level</th>
                  <th>Medical Conditions</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th className="pv-actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const online = (patient.connection_status || '').toLowerCase() === 'online';
                  const hrClass = patient.heart_rate > 100 ? 'crit' : patient.heart_rate < 60 ? 'warn' : 'ok';
                  const oxClass = patient.oxygen_level < 90 ? 'crit' : patient.oxygen_level < 95 ? 'warn' : 'ok';
                  return (
                    <tr key={patient.patient_id} className={!online ? 'pv-offline' : ''}>
                      <td>{patient.patient_id}</td>
                      <td>{patient.name}</td>
                      <td>
                        <span className={`pv-badge ${online ? 'online' : 'offline'}`}>
                          <span className={`pv-dot ${online ? 'online' : 'offline'}`} />
                          {patient.connection_status}
                        </span>
                      </td>
                      <td>{patient.last_reading ? new Date(patient.last_reading).toLocaleString() : 'No data'}</td>
                      <td><span className={`pv-chip ${hrClass}`}>{patient.heart_rate ?? '--'} {patient.heart_rate ? 'bpm' : ''}</span></td>
                      <td><span className={`pv-chip ${oxClass}`}>{patient.oxygen_level ?? '--'}{patient.oxygen_level ? '%' : ''}</span></td>
                      <td className="pv-ellipsis" title={patient.medical_conditions || ''}>
                        {patient.medical_conditions}
                      </td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>
                        <div className="pv-actions">
                          <button
                            onClick={() => handleEditPatient(patient)}
                            className="pv-icon-btn"
                            title="Edit Patient"
                            aria-label={`Edit ${patient.name || patient.patient_id}`}
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                              <path d="M4 17.5V20h2.5l10-10-2.5-2.5-10 10Z" stroke="rgba(207,227,255,0.9)" strokeWidth="1.6"/>
                              <path d="M14 5l2.5 2.5" stroke="rgba(207,227,255,0.9)" strokeWidth="1.6"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeletePatient(patient)}
                            className="pv-icon-btn danger"
                            title="Delete Patient"
                            aria-label={`Delete ${patient.name || patient.patient_id}`}
                          >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                              <path d="M5 7h14M10 11v6M14 11v6M7 7l1 12h8l1-12M9 7V5h6v2" stroke="rgba(255,107,107,0.9)" strokeWidth="1.6" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Patient Form Modal */}
      {showForm && (
        <PatientForm
          patient={editingPatient}
          onSave={handleSavePatient}
          onCancel={handleCancelForm}
          isEditing={!!editingPatient}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="pv-modal-overlay" role="dialog" aria-modal="true">
          <div className="pv-modal">
            <div className="pv-modal-head">
              <div className="pv-modal-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <path d="M12 3l9 18H3L12 3Z" stroke="rgba(255,107,107,0.9)" strokeWidth="1.6"/>
                  <rect x="11" y="9" width="2" height="7" rx="1" fill="rgba(255,107,107,0.9)"/>
                  <circle cx="12" cy="18" r="1" fill="rgba(255,107,107,0.9)"/>
                </svg>
              </div>
              <h3>Confirm Delete</h3>
            </div>
            <p>
              Are you sure you want to delete patient <strong>{deleteConfirm.name}</strong> ({deleteConfirm.patient_id})?
            </p>
            <p className="pv-warning">
              This will also delete all associated telemetry data and alerts.
            </p>
            <div className="pv-modal-actions">
              <button onClick={() => setDeleteConfirm(null)} className="pv-secondary-btn">
                Cancel
              </button>
              <button onClick={confirmDelete} className="pv-danger-btn">
                Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles (calm medical theme, clearer spacing & readable header)
// Includes THEMED DROPDOWNS with better line spacing and chevron
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

  .patients-view{ color: var(--ink1); }

  .pv-header{ margin-bottom: 12px; }
  .pv-tonal{
    background:
      radial-gradient(900px 500px at -10% 0%, rgba(43,211,231,0.10), transparent 65%),
      radial-gradient(900px 500px at 110% 0%, rgba(34,199,178,0.08), transparent 65%),
      linear-gradient(180deg, #0e1423 0%, #0b111f 100%);
    border: 1px solid var(--line);
    padding: 16px 18px;
    border-radius: 14px;
    box-shadow: var(--shadow);
  }
  .pv-title-line{ display:flex; align-items:center; justify-content:space-between; }
  .pv-title-left{ display:flex; gap:10px; align-items:center; }
  .pv-title-icon{
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, var(--brand), var(--brand2));
    display: grid; place-items: center;
  }
  .pv-title-line h2{ margin: 0; font-weight: 800; letter-spacing: .2px; color: var(--ink1); }
  .pv-count{ color: var(--ink2); font-weight: 700; }

  /* Announcement */
  .pv-announce{
    display:flex; align-items:center; justify-content:space-between; gap: 12px;
    margin: 12px 0;
    padding: 12px 14px; border-radius: 12px;
    background: linear-gradient(135deg, rgba(32,213,164,0.10), rgba(43,211,231,0.10));
    border: 1px solid rgba(43,211,231,0.25);
  }
  .pv-announce-left{ display:flex; gap:10px; align-items:center; }
  .pv-announce-icon{
    width: 28px; height: 28px; border-radius: 8px; display:grid; place-items:center;
    background: rgba(43,211,231,0.12); border: 1px solid rgba(43,211,231,0.25);
  }
  .pv-announce-text{ color: rgba(43, 211, 231, 0.95); }
  .pv-announce-close{
    background: transparent;
    border: 1px solid rgba(43,211,231,0.45);
    color: rgba(43,211,231,0.95);
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
  }

  /* Tools */
  .pv-tools{ display: grid; gap: 14px; padding: 12px 0 0 0; }
  .pv-search-group{
    position: relative;
    width: clamp(320px, 52vw, 560px); /* slightly longer search */
  }
  .pv-input-icon{
    position: absolute; top: 50%; left: 10px; transform: translateY(-50%);
    pointer-events: none;
  }
  .pv-input{
    width: 100%;
    background: var(--panel); color: var(--ink1);
    border: 1px solid var(--line);
    padding: 11px 12px 11px 36px;
    border-radius: 12px; outline: none;
  }
  .pv-input::placeholder{ color: #97a9c8; }

  .pv-filter-row{ display: flex; flex-wrap: wrap; gap: 16px 18px; padding: 6px 0; }

  /* Filter pill wrapper (with custom chevron) */
  .pv-filter{
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 10px 14px;
    position: relative;
    transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
  }
  .pv-filter:hover{ border-color: rgba(43,211,231,0.35); box-shadow: 0 8px 28px rgba(0,0,0,0.25); }
  .pv-filter::after{
    content: '▾';
    position: absolute;
    right: 10px;
    font-size: 12px;
    color: rgba(43,211,231,0.85);
    pointer-events: none;
  }
  .pv-filter-icon{ display:inline-grid; place-items:center; width:18px; height:18px; }

  /* Themed select */
  .pv-select{
    -webkit-appearance: none; appearance: none;
    background: #0f1a2e;
    color: var(--ink1);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 10px 28px 10px 12px; /* room for chevron */
    outline: none;
    line-height: 1.35;
  }
  .pv-select:focus-visible{
    border-color: rgba(43,211,231,0.45);
    box-shadow: 0 0 0 3px rgba(43,211,231,0.20);
  }
  .pv-select::-ms-expand{ display:none; }
  .pv-select option, .pv-select optgroup{
    background: #0f1a2e;
    color: #e7f0ff;
    line-height: 1.7;
    padding: 8px 10px;
  }
  .pv-select option:hover{ background: rgba(43,211,231,0.20); }
  .pv-select option:checked{
    background: linear-gradient(135deg, var(--brand), var(--brand2));
    color: #07111f;
  }

  .pv-viewtoggle{ display:flex; gap:8px; align-items:center; margin-left: auto; flex-wrap: wrap; }
  .pv-toggle{
    display: inline-flex; gap: 6px; align-items: center;
    background: var(--panel); border: 1px solid var(--line);
    padding: 9px 12px; border-radius: 10px; color: var(--ink1);
    cursor: pointer;
  }
  .pv-toggle.active{ border-color: rgba(43,211,231,0.35); }
  .pv-primary-btn{
    background: linear-gradient(135deg, var(--brand), var(--brand2));
    border: none; color: #07111f; font-weight: 800;
    padding: 10px 14px; border-radius: 12px; cursor: pointer;
  }
  .pv-plus{ font-weight: 900; }

  /* Cards */
  .pv-cards-wrap{
    margin-top: 12px;
    background: linear-gradient(180deg, rgba(17,26,47,0.9), rgba(15,22,38,0.9));
    border: 1px solid var(--line);
    border-radius: 14px;
    box-shadow: var(--shadow);
    padding: 12px;
  }
  .pv-cards-head{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px; }
  .pv-cards-title{ color: var(--ink2); font-weight: 600; }
  .pv-check{ display:flex; gap:6px; align-items:center; color: var(--ink2); font-size: .92rem; }
  .pv-cards{ display:grid; gap:12px; grid-template-columns: repeat(4, minmax(0,1fr)); }
  @media (max-width: 1100px){ .pv-cards{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
  @media (max-width: 640px){ .pv-cards{ grid-template-columns: 1fr; } }

  .pv-card{
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 12px;
    background: rgba(13,20,36,0.8);
  }
  .pv-card-top{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .pv-card-id{ color: var(--ink2); font-size: .9rem; }
  .pv-card-name{ font-weight: 700; margin-top: 4px; }
  .pv-card-meta{ color: var(--ink2); font-size: .9rem; margin-bottom: 8px; }
  .pv-chiprow{ display:flex; gap:8px; margin-bottom:8px; }
  .pv-card-cond{ color: var(--ink2); font-size: .9rem; margin-bottom:8px; }
  .pv-card-foot{ display:flex; align-items:center; justify-content:space-between; gap:10px; }

  /* Table */
  .pv-table-wrap{
    margin-top: 12px;
    background: linear-gradient(180deg, rgba(17,26,47,0.9), rgba(15,22,38,0.9));
    border: 1px solid var(--line);
    border-radius: 14px;
    box-shadow: var(--shadow);
    overflow: hidden;
  }
  .pv-table{ width: 100%; border-collapse: collapse; font-size: .95rem; }
  .pv-table thead th{
    text-align: left; padding: 12px; color: var(--ink2);
    background: rgba(207,227,255,0.06);
    border-bottom: 1px solid var(--line);
    position: sticky; top: 0;
  }
  .pv-table tbody td{ padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .pv-table tbody tr:hover{ background: rgba(32,213,164,0.05); }

  .pv-ellipsis{ max-width: 360px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pv-actions-col{ width: 120px; }

  .pv-chip{
    display:inline-flex; align-items:center; gap:6px;
    padding: 6px 10px; border-radius:999px; border:1px solid var(--line);
    background: rgba(13,20,36,0.6);
  }
  .pv-chip.ok{ border-color: rgba(110,231,183,0.35); background: rgba(110,231,183,0.10); }
  .pv-chip.warn{ border-color: rgba(255,209,102,0.35); background: rgba(255,209,102,0.10); }
  .pv-chip.crit{ border-color: rgba(255,107,107,0.35); background: rgba(255,107,107,0.10); }

  .pv-badge{
    display:inline-flex; align-items:center; gap:8px;
    padding:6px 10px; border-radius:999px; font-size:.9rem;
    border:1px solid var(--line); background: rgba(13,20,36,0.6); color: var(--ink1);
  }
  .pv-dot{ width:8px; height:8px; border-radius:50%; display:inline-block; }
  .pv-badge.online{ border-color: rgba(110,231,183,0.35); background: rgba(110,231,183,0.08); }
  .pv-dot.online{ background: var(--ok); }
  .pv-badge.offline{ border-color: rgba(255,107,107,0.35); background: rgba(255,107,107,0.08); }
  .pv-dot.offline{ background: var(--crit); }

  .pv-actions{ display:flex; gap:8px; }
  .pv-icon-btn{
    background: rgba(13,20,36,0.55);
    border: 1px solid var(--line);
    color: var(--ink1);
    padding: 8px 10px; border-radius: 10px; cursor: pointer;
  }
  .pv-icon-btn.danger{ border-color: rgba(255,107,107,0.35); }

  .pv-empty{ display:grid; place-items:center; padding: 40px 10px; }
  .pv-empty-card{
    text-align:center; max-width:520px; padding: 22px;
    background: rgba(13,20,36,0.85); border: 1px solid var(--line);
    border-radius: 14px; box-shadow: var(--shadow);
  }
  .pv-empty-title{ font-weight:700; font-size:1.1rem; margin-bottom:6px; }
  .pv-empty-sub{ color: var(--ink2); margin-bottom:14px; }
  .pv-secondary-btn{
    background: transparent; border: 1px solid var(--line); color: var(--ink1);
    padding: 8px 12px; border-radius: 10px; cursor: pointer;
  }

  .pv-modal-overlay{
    position: fixed; inset: 0; display: grid; place-items: center;
    background: rgba(2,8,19,0.65); backdrop-filter: blur(4px); z-index: 100;
  }
  .pv-modal{
    width: min(560px, 92vw);
    background: rgba(13,20,36,0.98);
    border: 1px solid var(--line);
    border-radius: 16px; padding: 18px; color: var(--ink1);
    box-shadow: var(--shadow);
  }
  .pv-modal-head{ display:flex; align-items:center; gap:8px; margin-bottom: 6px; }
  .pv-modal-icon{
    width: 32px; height: 32px; border-radius: 8px; display:grid; place-items:center;
    background: rgba(255,107,107,0.10); border: 1px solid rgba(255,107,107,0.35);
  }
  .pv-warning{ color: #ffd1d1; }
  .pv-modal-actions{ display:flex; justify-content:flex-end; gap:10px; margin-top: 12px; }

  .pv-skeleton{
    height: 160px; border-radius: 14px;
    background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.12), rgba(255,255,255,0.05));
    background-size: 200% 100%; animation: pvShimmer 1.1s infinite linear;
    margin-top: 12px;
  }
  @keyframes pvShimmer{ 0%{background-position: 200% 0;} 100%{background-position: -200% 0;} }
`;

export default PatientsView;
