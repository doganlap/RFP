import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  IntakeStage,
  GoNoGoStage,
  PlanningStage,
  SolutioningStage,
  PricingStage,
  ProposalBuildStage,
  ApprovalsStage,
  SubmissionStage,
  PostBidStage
} from './RFPStages.jsx';
import TaskManagement from './TaskManagement.jsx';
import ClarificationsManagement from './ClarificationsManagement.jsx';
import SLAMonitoring from './SLAMonitoring.jsx';
import { useRFP } from './hooks/useRFP';
// Real RFP Process Implementation based on Sales ↔ Pre-Sales Blueprint
// States: intake → go_no_go → planning → solutioning → pricing → proposal_build → approvals → submission → post_bid

const RFP_STATES = {
  INTAKE: 'intake',
  GO_NO_GO: 'go_no_go',
  PLANNING: 'planning',
  SOLUTIONING: 'solutioning',
  PRICING: 'pricing',
  PROPOSAL_BUILD: 'proposal_build',
  APPROVALS: 'approvals',
  SUBMISSION: 'submission',
  POST_BID: 'post_bid',
  WON: 'won',
  LOST: 'lost',
  ABANDONED: 'abandoned'
};

const ROLES = {
  SALES_REP: 'sales_rep',
  SALES_MANAGER: 'sales_manager',
  PRESALES_LEAD: 'presales_lead',
  SOLUTION_ARCHITECT: 'solution_architect',
  PRICING_FINANCE: 'pricing_finance',
  LEGAL_CONTRACTS: 'legal_contracts',
  COMPLIANCE_GRC: 'compliance_grc',
  PMO: 'pmo'
};

const mapStageToWorkflowState = (stage) => {
  switch (stage) {
    case 'STAGE_1_TRIAGE':
      return RFP_STATES.INTAKE;
    case 'STAGE_2_BUSINESS_REVIEW':
      return RFP_STATES.GO_NO_GO;
    case 'STAGE_3_SME_QUALIFICATION':
      return RFP_STATES.PLANNING;
    case 'STAGE_4_PROPOSAL':
      return RFP_STATES.PROPOSAL_BUILD;
    case 'STAGE_5_SUBMISSION':
      return RFP_STATES.SUBMISSION;
    default:
      return RFP_STATES.INTAKE;
  }
};

// Real RFP Process Component
export const RealRFPProcess = ({ rfpId }) => {
  const params = useParams();
  const routeRfpId = params?.id;
  const derivedRfpId = rfpId || routeRfpId || null;
  const { rfps, fetchRFPs, loadRFP, setCurrentRFP } = useRFP();

  const [currentState, setCurrentState] = useState(RFP_STATES.INTAKE);
  const [activeTab, setActiveTab] = useState('process');
  const [rfpData, setRfpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!rfps.length) {
      fetchRFPs().catch((err) => {
        console.error('Error fetching RFPs list:', err);
        setError(err instanceof Error ? err.message : 'Failed to load RFP list');
      });
    }
  }, [rfps.length, fetchRFPs]);

  useEffect(() => {
    const targetId = derivedRfpId || (rfps.length ? rfps[0].id : null);

    if (!targetId) {
      setLoading(false);
      setError('No RFPs available. Create one from the RFP list to get started.');
      return;
    }

    let isMounted = true;
    setLoading(true);

    loadRFP(targetId)
      .then((rfp) => {
        if (!isMounted) return;
        if (!rfp) {
          setError('RFP not found');
          return;
        }

        const enriched = {
          ...rfp,
          value: rfp.estimatedValue || 0,
          deadline: rfp.submissionDeadline
            ? new Date(rfp.submissionDeadline).toISOString().split('T')[0]
            : 'Not set',
          category: rfp.tags?.[0] || 'General',
        };

        setRfpData(enriched);
        setCurrentRFP(rfp);
        setCurrentState(mapStageToWorkflowState(rfp.stage));
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching RFP data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load RFP data');
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [derivedRfpId, rfps, loadRFP, setCurrentRFP]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600">Loading RFP data...</p>
        </div>
      </div>
    );
  }

  if (error || !rfpData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-red-600">{error || 'Failed to load RFP data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <RFPHeader rfpData={rfpData} currentState={currentState} />
      <StateProgressBar currentState={currentState} />

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'process', label: 'Process Flow', icon: '🔄' },
              { id: 'tasks', label: 'Task Management', icon: '📋' },
              { id: 'clarifications', label: 'Clarifications', icon: '💬' },
              { id: 'sla', label: 'SLA Monitoring', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'process' && (
        <StateContent
          currentState={currentState}
          rfpData={rfpData}
          setRfpData={setRfpData}
          setCurrentState={setCurrentState}
        />
      )}
      {activeTab === 'tasks' && (
        <TaskManagement rfpId={rfpId} currentState={currentState} />
      )}
      {activeTab === 'clarifications' && (
        <ClarificationsManagement rfpId={rfpId} />
      )}
      {activeTab === 'sla' && (
        <SLAMonitoring rfpId={rfpId} currentState={currentState} rfpData={rfpData} />
      )}
    </div>
  );
};

// RFP Header Component
const RFPHeader = ({ rfpData, currentState }) => (
  <div className="bg-white shadow rounded-lg p-6 mb-6">
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{rfpData.title}</h1>
        <p className="text-lg text-gray-600">{rfpData.client}</p>
        <div className="flex space-x-4 mt-2 text-sm text-gray-500">
          <span>Value: ${(rfpData.value / 1000000).toFixed(1)}M</span>
          <span>Deadline: {rfpData.deadline}</span>
          <span>Category: {rfpData.category}</span>
        </div>
      </div>
      <div className="text-right">
        <StateChip state={currentState} />
        <p className="text-sm text-gray-500 mt-1">RFP ID: {rfpData.id}</p>
      </div>
    </div>
  </div>
);

// State Progress Bar
const StateProgressBar = ({ currentState }) => {
  const states = [
    { key: RFP_STATES.INTAKE, label: 'Intake' },
    { key: RFP_STATES.GO_NO_GO, label: 'Go/No-Go' },
    { key: RFP_STATES.PLANNING, label: 'Planning' },
    { key: RFP_STATES.SOLUTIONING, label: 'Solutioning' },
    { key: RFP_STATES.PRICING, label: 'Pricing' },
    { key: RFP_STATES.PROPOSAL_BUILD, label: 'Proposal' },
    { key: RFP_STATES.APPROVALS, label: 'Approvals' },
    { key: RFP_STATES.SUBMISSION, label: 'Submission' }
  ];

  const currentIndex = states.findIndex(s => s.key === currentState);

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Process Progress</h3>
      <div className="flex items-center space-x-2">
        {states.map((state, index) => (
          <React.Fragment key={state.key}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              index <= currentIndex
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
            <span className={`text-sm ${
              index <= currentIndex ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`}>
              {state.label}
            </span>
            {index < states.length - 1 && (
              <div className={`flex-1 h-0.5 ${
                index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// State Content Router
const StateContent = ({ currentState, rfpData, setRfpData, setCurrentState }) => {
  switch (currentState) {
    case RFP_STATES.INTAKE:
      return <IntakeStage rfpData={rfpData} setRfpData={setRfpData} setCurrentState={setCurrentState} />;
    case RFP_STATES.GO_NO_GO:
      return <GoNoGoStage rfpData={rfpData} setCurrentState={setCurrentState} />;
    case RFP_STATES.PLANNING:
      return <PlanningStage rfpData={rfpData} setRfpData={setRfpData} setCurrentState={setCurrentState} />;
    case RFP_STATES.SOLUTIONING:
      return <SolutioningStage rfpData={rfpData} setCurrentState={setCurrentState} />;
    case RFP_STATES.PRICING:
      return <PricingStage rfpData={rfpData} setCurrentState={setCurrentState} />;
    case RFP_STATES.PROPOSAL_BUILD:
      return <ProposalBuildStage rfpData={rfpData} setCurrentState={setCurrentState} />;
    case RFP_STATES.APPROVALS:
      return <ApprovalsStage rfpData={rfpData} setRfpData={setRfpData} setCurrentState={setCurrentState} />;
    case RFP_STATES.SUBMISSION:
      return <SubmissionStage rfpData={rfpData} setCurrentState={setCurrentState} />;
    case RFP_STATES.POST_BID:
      return <PostBidStage rfpData={rfpData} setCurrentState={setCurrentState} />;
    case RFP_STATES.WON:
    case RFP_STATES.LOST:
    case RFP_STATES.ABANDONED:
      return <FinalOutcomeStage currentState={currentState} rfpData={rfpData} />;
    default:
      return <div>Unknown state: {currentState}</div>;
  }
};

// State Chip Component
const StateChip = ({ state }) => {
  const getStateColor = (state) => {
    switch (state) {
      case RFP_STATES.INTAKE: return 'bg-gray-100 text-gray-800';
      case RFP_STATES.GO_NO_GO: return 'bg-yellow-100 text-yellow-800';
      case RFP_STATES.PLANNING: return 'bg-blue-100 text-blue-800';
      case RFP_STATES.SOLUTIONING: return 'bg-purple-100 text-purple-800';
      case RFP_STATES.PRICING: return 'bg-orange-100 text-orange-800';
      case RFP_STATES.PROPOSAL_BUILD: return 'bg-indigo-100 text-indigo-800';
      case RFP_STATES.APPROVALS: return 'bg-pink-100 text-pink-800';
      case RFP_STATES.SUBMISSION: return 'bg-green-100 text-green-800';
      case RFP_STATES.WON: return 'bg-green-100 text-green-800';
      case RFP_STATES.LOST: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(state)}`}>
      {state.replace('_', ' ').toUpperCase()}
    </span>
  );
};

// Final Outcome Stage - Shows final result
const FinalOutcomeStage = ({ currentState, rfpData }) => {
  const getOutcomeDetails = () => {
    switch (currentState) {
      case RFP_STATES.WON:
        return {
          icon: '🏆',
          title: 'RFP WON!',
          message: 'Congratulations! Contract has been awarded.',
          color: 'green',
          nextSteps: [
            'Contract negotiation and signing',
            'Project kickoff and team mobilization',
            'Delivery planning and milestone setup'
          ]
        };
      case RFP_STATES.LOST:
        return {
          icon: '❌',
          title: 'RFP Lost',
          message: 'Better luck next time. Focus on lessons learned.',
          color: 'red',
          nextSteps: [
            'Conduct win/loss analysis',
            'Update capability assessments',
            'Improve proposal processes'
          ]
        };
      case RFP_STATES.ABANDONED:
        return {
          icon: '🚫',
          title: 'RFP Abandoned',
          message: 'RFP was abandoned during the process.',
          color: 'gray',
          nextSteps: [
            'Document reasons for abandonment',
            'Review go/no-go criteria',
            'Update qualification processes'
          ]
        };
      default:
        return {
          icon: '❓',
          title: 'Unknown Outcome',
          message: 'Outcome not recognized.',
          color: 'gray',
          nextSteps: []
        };
    }
  };

  const outcome = getOutcomeDetails();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="text-center py-8">
        <div className="text-6xl mb-4">{outcome.icon}</div>
        <h2 className={`text-2xl font-bold mb-2 text-${outcome.color}-900`}>
          {outcome.title}
        </h2>
        <p className={`text-lg text-${outcome.color}-700 mb-6`}>
          {outcome.message}
        </p>

        <div className={`bg-${outcome.color}-50 p-4 rounded-lg mb-6`}>
          <h3 className={`font-medium text-${outcome.color}-900 mb-2`}>Contract Details</h3>
          <div className={`text-sm text-${outcome.color}-800`}>
            <p>• Client: {rfpData.client}</p>
            <p>• Value: ${(rfpData.value / 1000000).toFixed(1)}M</p>
            <p>• Duration: {rfpData.duration || '24 months'}</p>
          </div>
        </div>

        {outcome.nextSteps.length > 0 && (
          <div className="text-left">
            <h3 className="font-medium text-gray-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {outcome.nextSteps.map((step, index) => (
                <li key={index}>• {step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealRFPProcess;
