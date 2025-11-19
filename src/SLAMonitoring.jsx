import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// SLA Monitoring Dashboard Component
export const SLAMonitoring = ({ rfpId, currentState, rfpData }) => {
  const { t } = useTranslation();
  const [slaMetrics, setSlaMetrics] = useState({
    clarification_response: { target: 48, actual: 36, status: 'on_track' },
    internal_review: { target: 24, actual: 18, status: 'ahead' },
    legal_turnaround: { target: 72, actual: 84, status: 'overdue' },
    compliance_mapping: { target: 48, actual: 42, status: 'on_track' }
  });

  const [stageTimelines, setStageTimelines] = useState({
    intake: { planned: 1, actual: 1, status: 'completed' },
    go_no_go: { planned: 2, actual: 1.5, status: 'completed' },
    planning: { planned: 2, actual: 2, status: 'completed' },
    solutioning: { planned: 10, actual: 8, status: 'current' },
    pricing: { planned: 5, actual: 0, status: 'pending' },
    proposal_build: { planned: 12, actual: 0, status: 'pending' },
    approvals: { planned: 5, actual: 0, status: 'pending' },
    submission: { planned: 2, actual: 0, status: 'pending' }
  });

  const [alerts, setAlerts] = useState([
    {
      id: 'alert-001',
      type: 'warning',
      message: t('legal_review_approaching_sla'),
      stage: 'approvals',
      created_at: new Date().toISOString()
    },
    {
      id: 'alert-002',
      type: 'info',
      message: t('compliance_mapping_completed_ahead'),
      stage: 'solutioning',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const getSLAStatusColor = (status) => {
    switch (status) {
      case 'ahead': return 'bg-green-100 text-green-800';
      case 'on_track': return 'bg-blue-100 text-blue-800';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📋';
    }
  };

  const calculateOverallHealth = () => {
    const metrics = Object.values(slaMetrics);
    const aheadCount = metrics.filter(m => m.status === 'ahead').length;
    const onTrackCount = metrics.filter(m => m.status === 'on_track').length;
    const overdueCount = metrics.filter(m => m.status === 'overdue').length;

    if (overdueCount > 0) return { status: 'at_risk', score: 60 };
    if (aheadCount > onTrackCount) return { status: 'excellent', score: 95 };
    return { status: 'good', score: 85 };
  };

  const overallHealth = calculateOverallHealth();

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('sla_health_dashboard')}</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${
              overallHealth.status === 'excellent' ? 'bg-green-500' :
              overallHealth.status === 'good' ? 'bg-blue-500' :
              overallHealth.status === 'at_risk' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">{overallHealth.score}% Health Score</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(slaMetrics).map(([key, metric]) => (
            <div key={key} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-2">
                {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold">{metric.actual}h</span>
                <span className={`px-2 py-1 rounded text-xs ${getSLAStatusColor(metric.status)}`}>
                  {metric.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Target: {metric.target}h |
                {metric.actual <= metric.target ?
                  ` ${metric.target - metric.actual}h ahead` :
                  ` ${metric.actual - metric.target}h overdue`
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Timeline Progress */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{t('stage_timeline_progress')}</h3>
        <div className="space-y-3">
          {Object.entries(stageTimelines).map(([stage, timeline]) => (
            <div key={stage} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium capitalize">
                {stage.replace('_', ' ')}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    timeline.status === 'completed' ? 'bg-green-500' :
                    timeline.status === 'current' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`}
                  style={{
                    width: timeline.status === 'completed' ? '100%' :
                           timeline.status === 'current' ? '60%' : '0%'
                  }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 w-20">
                {timeline.actual > 0 ? `${timeline.actual}d` : `${timeline.planned}d planned`}
              </div>
              <div className={`px-2 py-1 rounded text-xs ${
                timeline.status === 'completed' ? 'bg-green-100 text-green-800' :
                timeline.status === 'current' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {timeline.status.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{t('active_alerts_notifications')}</h3>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{getAlertIcon(alert.type)}</span>
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <div className="flex justify-between items-center mt-2 text-sm opacity-75">
                      <span>Stage: {alert.stage.replace('_', ' ')}</span>
                      <span>{formatTimeAgo(alert.created_at)}</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎯</div>
            <p>{t('all_slas_on_track')}</p>
          </div>
        )}
      </div>

      {/* Key Performance Indicators */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">78%</div>
            <div className="text-sm text-gray-600">On-Time Delivery Rate</div>
            <div className="text-xs text-gray-500 mt-1">Target: 85%</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">92%</div>
            <div className="text-sm text-gray-600">SLA Compliance</div>
            <div className="text-xs text-gray-500 mt-1">Target: 90%</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">15.2</div>
            <div className="text-sm text-gray-600">Avg. Cycle Time (days)</div>
            <div className="text-xs text-gray-500 mt-1">Target: 18 days</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SLAMonitoring;
