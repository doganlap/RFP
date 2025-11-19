import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Clarifications Management Component
export const ClarificationsManagement = ({ rfpId }) => {
  const { t } = useTranslation();
  const [clarifications, setClarifications] = useState([
    {
      id: 'clar-001',
      question: 'What is the expected timeline for cloud migration completion?',
      priority: 'high',
      raised_at: '2025-01-20T10:00:00Z',
      answered_at: '2025-01-22T14:30:00Z',
      answer: 'The migration should be completed within 18 months from contract signing.',
      status: 'answered',
      sla_hours: 48,
      raised_by: 'Solution Architect'
    },
    {
      id: 'clar-002',
      question: 'Are there any specific compliance certifications required beyond SOC 2?',
      priority: 'medium',
      raised_at: '2025-01-21T09:15:00Z',
      answered_at: null,
      answer: '',
      status: 'pending',
      sla_hours: 48,
      raised_by: 'Compliance Officer'
    }
  ]);

  const [newClarification, setNewClarification] = useState({
    question: '',
    priority: 'medium',
    raised_by: ''
  });

  const addClarification = () => {
    if (!newClarification.question.trim()) return;

    const clarification = {
      id: `clar-${Date.now()}`,
      ...newClarification,
      raised_at: new Date().toISOString(),
      answered_at: null,
      answer: '',
      status: 'pending',
      sla_hours: 48
    };

    setClarifications([clarification, ...clarifications]);
    setNewClarification({ question: '', priority: 'medium', raised_by: '' });
  };

  const answerClarification = (id, answer) => {
    setClarifications(clarifications.map(c =>
      c.id === id
        ? { ...c, answer, answered_at: new Date().toISOString(), status: 'answered' }
        : c
    ));
  };

  const getSLAStatus = (clarification) => {
    if (clarification.status === 'answered') return 'completed';

    const raisedTime = new Date(clarification.raised_at);
    const now = new Date();
    const hoursElapsed = (now - raisedTime) / (1000 * 60 * 60);

    if (hoursElapsed > clarification.sla_hours) return 'overdue';
    if (hoursElapsed > clarification.sla_hours * 0.8) return 'warning';
    return 'on_time';
  };

  const getSLAColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_time': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const pendingCount = clarifications.filter(c => c.status === 'pending').length;
  const overdueCount = clarifications.filter(c => getSLAStatus(c) === 'overdue').length;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('clarifications_management')}</h2>
        <div className="flex space-x-4 text-sm">
          <span className="text-yellow-600">📋 {pendingCount} {t('pending')}</span>
          {overdueCount > 0 && (
            <span className="text-red-600">⚠️ {overdueCount} {t('overdue')}</span>
          )}
        </div>
      </div>

      {/* Add New Clarification */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-3">{t('raise_new_clarification')}</h3>
        <div className="space-y-3">
          <textarea
            placeholder={t('clarification_question_placeholder')}
            value={newClarification.question}
            onChange={(e) => setNewClarification({...newClarification, question: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-20"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={newClarification.priority}
              onChange={(e) => setNewClarification({...newClarification, priority: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="low">{t('low_priority')}</option>
              <option value="medium">{t('medium_priority')}</option>
              <option value="high">{t('high_priority')}</option>
            </select>
            <input
              type="text"
              placeholder={t('your_name_role')}
              value={newClarification.raised_by}
              onChange={(e) => setNewClarification({...newClarification, raised_by: e.target.value})}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <button
            onClick={addClarification}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {t('raise_clarification')}
          </button>
        </div>
      </div>

      {/* Clarifications List */}
      <div className="space-y-4">
        {clarifications.map(clarification => {
          const slaStatus = getSLAStatus(clarification);
          return (
            <div key={clarification.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(clarification.priority)}`}>
                    {clarification.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getSLAColor(slaStatus)}`}>
                    {slaStatus === 'completed' ? t('answered') :
                     slaStatus === 'overdue' ? t('overdue') :
                     slaStatus === 'warning' ? t('due_soon') : t('on_time')}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {clarification.id}
                </div>
              </div>

              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-1">{t('question')}:</h4>
                <p className="text-gray-700">{clarification.question}</p>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>👤 {t('raised_by')}: {clarification.raised_by}</span>
                <span>📅 {formatTimeAgo(clarification.raised_at)}</span>
                <span>⏱️ {t('sla')}: {clarification.sla_hours}h</span>
              </div>

              {clarification.status === 'answered' ? (
                <div className="bg-green-50 p-3 rounded">
                  <h4 className="font-medium text-green-900 mb-1">{t('answer')}:</h4>
                  <p className="text-green-800">{clarification.answer}</p>
                  <div className="text-xs text-green-600 mt-2">
                    {t('answered')} {formatTimeAgo(clarification.answered_at)}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-800 text-sm">⏳ {t('awaiting_client_response')}</span>
                    <button
                      onClick={() => {
                        const answer = prompt('Enter the answer:');
                        if (answer) answerClarification(clarification.id, answer);
                      }}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700"
                    >
                      {t('add_answer')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {clarifications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">💬</div>
          <p>{t('no_clarifications_raised_yet')}</p>
        </div>
      )}
    </div>
  );
};

export default ClarificationsManagement;
