import React from 'react';
import StatCard from './StatCard';
import HealthMetricCard from './HealthMetricCard';
import RecentAlertsCard from './RecentAlertsCard';

const DashboardView = ({ stats, alerts, onNavigate }) => {
  const handleStatCardClick = (tab) => {
    if (onNavigate) onNavigate(tab);
  };

  return (
    <div>
      {/* Statistics Cards */}
      <div className="row mb-4">
        <StatCard
          title="Total Patients"
          value={stats.total_patients}
          icon="fas fa-users"
          color="primary"
          onClick={() => handleStatCardClick('patients')}
        />
        <StatCard
          title="Active Patients"
          value={stats.active_patients}
          icon="fas fa-heartbeat"
          color="success"
          subtitle="Currently monitored"
          onClick={() => handleStatCardClick('patients')}
        />
        <StatCard
          title="Critical Alerts"
          value={stats.critical_alerts_today}
          icon="fas fa-exclamation-triangle"
          color="danger"
          subtitle="Today"
          onClick={() => handleStatCardClick('alerts')}
        />
        <StatCard
          title="Unresolved Alerts"
          value={stats.unresolved_alerts}
          icon="fas fa-bell"
          color="warning"
          onClick={() => handleStatCardClick('alerts')}
        />
      </div>

      {/* Health Metrics */}
      <div className="row mb-4">
        <HealthMetricCard
          title="Average Heart Rate Today"
          value={stats.avg_heart_rate_today}
          unit="BPM"
          icon="fas fa-heartbeat"
          maxValue={120}
          normalRange="Normal: 60-120 BPM"
          color="danger"
        />
        <HealthMetricCard
          title="Average Oxygen Level Today"
          value={stats.avg_oxygen_level_today}
          unit="%"
          icon="fas fa-lungs"
          maxValue={100}
          normalRange="Normal: 95-100%"
          color="info"
        />
      </div>

      {/* Recent Critical Alerts */}
      <div className="row">
        <div className="col-12">
          <RecentAlertsCard 
            alerts={alerts} 
            maxDisplay={5}
            onViewAll={() => handleStatCardClick('alerts')}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;