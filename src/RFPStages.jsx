import React, { useState } from 'react';

// Stage 1: Intake - Sales Rep creates RFP and attaches documents
export const IntakeStage = ({ rfpData, setRfpData, setCurrentState }) => {
  const [formData, setFormData] = useState({
    title: rfpData.title,
    client: rfpData.client,
    value: rfpData.value,
    deadline: rfpData.deadline,
    category: rfpData.category,
    documents: []
  });

  const handleSubmit = () => {
    setRfpData({ ...rfpData, ...formData });
    setCurrentState('go_no_go');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">RFP Intake</h2>
      <p className="text-gray-600 mb-6">Sales Rep: Create RFP and attach tender documents</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">RFP Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
          <input
            type="text"
            value={formData.client}
            onChange={(e) => setFormData({...formData, client: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Value ($)</label>
          <input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({...formData, value: parseInt(e.target.value)})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Submission Deadline</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>
      
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="Cloud Services">Cloud Services</option>
          <option value="Software Development">Software Development</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Consulting">Consulting</option>
        </select>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Proceed to Go/No-Go
        </button>
      </div>
    </div>
  );
};

// Stage 2: Go/No-Go Decision with weighted scoring
export const GoNoGoStage = ({ rfpData, setCurrentState }) => {
  const [scores, setScores] = useState({
    strategic_fit: 8,
    competitiveness: 7,
    timeline_feasibility: 9,
    risk_flags: [],
    notes: ''
  });

  const calculateScore = () => {
    return (scores.strategic_fit * 0.4) + (scores.competitiveness * 0.4) + (scores.timeline_feasibility * 0.2);
  };

  const totalScore = calculateScore();
  const threshold = 7.0;
  const canProceed = totalScore >= threshold;

  const handleDecision = (proceed) => {
    if (proceed && canProceed) {
      setCurrentState('planning');
    } else {
      setCurrentState('abandoned');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Go/No-Go Decision</h2>
      <p className="text-gray-600 mb-6">Sales Manager: Evaluate RFP viability with weighted scoring</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Strategic Fit (40% weight)
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={scores.strategic_fit}
            onChange={(e) => setScores({...scores, strategic_fit: parseInt(e.target.value)})}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600">{scores.strategic_fit}/10</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Competitiveness (40% weight)
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={scores.competitiveness}
            onChange={(e) => setScores({...scores, competitiveness: parseInt(e.target.value)})}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600">{scores.competitiveness}/10</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeline Feasibility (20% weight)
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={scores.timeline_feasibility}
            onChange={(e) => setScores({...scores, timeline_feasibility: parseInt(e.target.value)})}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600">{scores.timeline_feasibility}/10</div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Total Score:</span>
          <span className={`text-2xl font-bold ${canProceed ? 'text-green-600' : 'text-red-600'}`}>
            {totalScore.toFixed(1)}/10
          </span>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Threshold: {threshold}/10 {canProceed ? '✅ PASS' : '❌ FAIL'}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={scores.notes}
          onChange={(e) => setScores({...scores, notes: e.target.value})}
          className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
          placeholder="Additional comments and risk assessment..."
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleDecision(false)}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          No-Go (Abandon)
        </button>
        <button
          onClick={() => handleDecision(true)}
          disabled={!canProceed}
          className={`px-4 py-2 rounded-md ${
            canProceed 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Go (Proceed to Planning)
        </button>
      </div>
    </div>
  );
};

// Stage 3: Planning - Team assignment and RACI matrix
export const PlanningStage = ({ rfpData, setRfpData, setCurrentState }) => {
  const [team, setTeam] = useState({
    presales_lead: 'Sarah Johnson',
    solution_architect: 'Mike Chen',
    pricing_analyst: 'Lisa Rodriguez',
    proposal_writer: 'David Kim',
    legal_reviewer: 'Emma Thompson'
  });

  const handleAssignTeam = () => {
    setRfpData({ ...rfpData, assignedTeam: team });
    setCurrentState('solutioning');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Team Planning & Assignment</h2>
      <p className="text-gray-600 mb-6">Sales Manager + Pre-Sales Lead: Assign team and define work packages</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {Object.entries(team).map(([role, person]) => (
          <div key={role}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </label>
            <input
              type="text"
              value={person}
              onChange={(e) => setTeam({...team, [role]: e.target.value})}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-blue-900 mb-2">RACI Matrix Generated</h3>
        <div className="text-sm text-blue-800">
          <p>• Pre-Sales Lead: Responsible for solution strategy</p>
          <p>• Solution Architect: Accountable for technical design</p>
          <p>• Pricing Analyst: Consulted on cost modeling</p>
          <p>• Proposal Writer: Informed of all deliverables</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleAssignTeam}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Assign Team & Start Solutioning
        </button>
      </div>
    </div>
  );
};

// Stage 4: Solutioning - Architecture, compliance, and BoQ
export const SolutioningStage = ({ rfpData, setCurrentState }) => {
  const [deliverables, setDeliverables] = useState({
    architecture: false,
    compliance: false,
    boq: false
  });

  const allComplete = Object.values(deliverables).every(Boolean);

  const toggleDeliverable = (key) => {
    setDeliverables({ ...deliverables, [key]: !deliverables[key] });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Solution Development</h2>
      <p className="text-gray-600 mb-6">Pre-Sales Team: Develop architecture, map compliance, build BoQ</p>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Architecture Draft</h3>
            <p className="text-sm text-gray-600">Technical solution design and infrastructure planning</p>
          </div>
          <button
            onClick={() => toggleDeliverable('architecture')}
            className={`px-3 py-1 rounded text-sm ${
              deliverables.architecture 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {deliverables.architecture ? 'Complete' : 'In Progress'}
          </button>
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Compliance Mapping</h3>
            <p className="text-sm text-gray-600">SOC 2, PCI DSS, GDPR requirements mapping</p>
          </div>
          <button
            onClick={() => toggleDeliverable('compliance')}
            className={`px-3 py-1 rounded text-sm ${
              deliverables.compliance 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {deliverables.compliance ? 'Complete' : 'In Progress'}
          </button>
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Bill of Quantities (BoQ)</h3>
            <p className="text-sm text-gray-600">Detailed resource and service breakdown</p>
          </div>
          <button
            onClick={() => toggleDeliverable('boq')}
            className={`px-3 py-1 rounded text-sm ${
              deliverables.boq 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {deliverables.boq ? 'Complete' : 'In Progress'}
          </button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => setCurrentState('pricing')}
          disabled={!allComplete}
          className={`px-4 py-2 rounded-md ${
            allComplete 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Proceed to Pricing
        </button>
      </div>
    </div>
  );
};

// Stage 5: Pricing - Cost modeling and margin analysis
export const PricingStage = ({ rfpData, setCurrentState }) => {
  const [pricing, setPricing] = useState({
    cost: 18500000,
    margin: 35,
    discount: 5,
    finalPrice: 25000000
  });

  const handlePricingComplete = () => {
    setCurrentState('proposal_build');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Pricing & Financial Modeling</h2>
      <p className="text-gray-600 mb-6">Finance Team: Cost modeling, margin analysis, discount approvals</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Base Cost ($)</label>
          <input
            type="number"
            value={pricing.cost}
            onChange={(e) => setPricing({...pricing, cost: parseInt(e.target.value)})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Margin (%)</label>
          <input
            type="number"
            value={pricing.margin}
            onChange={(e) => setPricing({...pricing, margin: parseInt(e.target.value)})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
          <input
            type="number"
            value={pricing.discount}
            onChange={(e) => setPricing({...pricing, discount: parseInt(e.target.value)})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Final Price ($)</label>
          <input
            type="number"
            value={pricing.finalPrice}
            onChange={(e) => setPricing({...pricing, finalPrice: parseInt(e.target.value)})}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-green-900 mb-2">Pricing Summary</h3>
        <div className="text-sm text-green-800">
          <p>• Gross Margin: ${(pricing.finalPrice - pricing.cost).toLocaleString()}</p>
          <p>• Margin %: {((pricing.finalPrice - pricing.cost) / pricing.finalPrice * 100).toFixed(1)}%</p>
          <p>• Competitive Position: Strong (within 5% of market rate)</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handlePricingComplete}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Proceed to Proposal Build
        </button>
      </div>
    </div>
  );
};

// Stage 6: Proposal Build - Document compilation and QA
export const ProposalBuildStage = ({ rfpData, setCurrentState }) => {
  const [volumes, setVolumes] = useState({
    technical: false,
    commercial: false,
    compliance: false,
    executive_summary: false
  });

  const allVolumesComplete = Object.values(volumes).every(Boolean);

  const toggleVolume = (key) => {
    setVolumes({ ...volumes, [key]: !volumes[key] });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Proposal Build & QA</h2>
      <p className="text-gray-600 mb-6">Pre-Sales + Writer: Compile volumes and complete QA checklist</p>
      
      <div className="space-y-4 mb-6">
        {Object.entries(volumes).map(([volume, complete]) => (
          <div key={volume} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">{volume.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Volume</h3>
              <p className="text-sm text-gray-600">Document compilation and review</p>
            </div>
            <button
              onClick={() => toggleVolume(volume)}
              className={`px-3 py-1 rounded text-sm ${
                complete ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {complete ? 'Complete' : 'In Progress'}
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => setCurrentState('approvals')}
          disabled={!allVolumesComplete}
          className={`px-4 py-2 rounded-md ${
            allVolumesComplete 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Submit for Approvals
        </button>
      </div>
    </div>
  );
};

// Stage 7: Approvals - Multi-stakeholder sign-offs
export const ApprovalsStage = ({ rfpData, setRfpData, setCurrentState }) => {
  const [approvals, setApprovals] = useState({
    tech: { status: 'pending', approver: 'Pre-Sales Lead', notes: '' },
    finance: { status: 'pending', approver: 'Finance Manager', notes: '' },
    legal: { status: 'pending', approver: 'Legal Counsel', notes: '' },
    grc: { status: 'pending', approver: 'Compliance Officer', notes: '' }
  });

  const toggleApproval = (key) => {
    const newStatus = approvals[key].status === 'approved' ? 'pending' : 'approved';
    setApprovals({
      ...approvals,
      [key]: { ...approvals[key], status: newStatus }
    });
  };

  const allApproved = Object.values(approvals).every(a => a.status === 'approved');

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Approvals Matrix</h2>
      <p className="text-gray-600 mb-6">Multi-stakeholder sign-offs required before submission</p>
      
      <div className="space-y-4 mb-6">
        {Object.entries(approvals).map(([key, approval]) => (
          <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">{key.toUpperCase()} Approval</h3>
              <p className="text-sm text-gray-600">Approver: {approval.approver}</p>
            </div>
            <button
              onClick={() => toggleApproval(key)}
              className={`px-3 py-1 rounded text-sm ${
                approval.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {approval.status === 'approved' ? 'Approved ✓' : 'Pending'}
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={() => setCurrentState('submission')}
          disabled={!allApproved}
          className={`px-4 py-2 rounded-md ${
            allApproved 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Proceed to Submission
        </button>
      </div>
    </div>
  );
};

// Stage 8: Submission - Final packaging and delivery
export const SubmissionStage = ({ rfpData, setCurrentState }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmission = () => {
    setSubmitted(true);
    setTimeout(() => {
      setCurrentState('post_bid');
    }, 2000);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Proposal Submission</h2>
      <p className="text-gray-600 mb-6">Final packaging and delivery to client</p>
      
      {!submitted ? (
        <div>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Ready for Submission</h3>
            <div className="text-sm text-blue-800">
              <p>• All approvals obtained ✓</p>
              <p>• Documents packaged ✓</p>
              <p>• Submission portal ready ✓</p>
              <p>• Deadline: {rfpData.deadline} ✓</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSubmission}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
            >
              Submit Proposal
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h3 className="text-xl font-semibold text-green-900 mb-2">Proposal Submitted Successfully!</h3>
          <p className="text-gray-600">Moving to post-bid phase...</p>
        </div>
      )}
    </div>
  );
};

// Stage 9: Post-Bid - Outcome tracking and analysis
export const PostBidStage = ({ rfpData, setCurrentState }) => {
  const [outcome, setOutcome] = useState('pending');
  const [analysis, setAnalysis] = useState({
    feedback: '',
    lessons_learned: '',
    competitive_analysis: '',
    win_loss_factors: []
  });

  const handleOutcome = (result) => {
    setOutcome(result);
    setCurrentState(result);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Post-Bid Analysis</h2>
      <p className="text-gray-600 mb-6">Track outcome and capture lessons learned</p>
      
      {outcome === 'pending' ? (
        <div>
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-yellow-900 mb-2">Awaiting Client Decision</h3>
            <div className="text-sm text-yellow-800">
              <p>• Proposal submitted: ✓</p>
              <p>• Client evaluation in progress</p>
              <p>• Expected decision: Within 30 days</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleOutcome('won')}
              className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 font-medium"
            >
              🏆 WON
            </button>
            <button
              onClick={() => handleOutcome('lost')}
              className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 font-medium"
            >
              ❌ LOST
            </button>
            <button
              onClick={() => handleOutcome('cancelled')}
              className="bg-gray-600 text-white px-4 py-3 rounded-md hover:bg-gray-700 font-medium"
            >
              🚫 CANCELLED
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className={`p-4 rounded-lg mb-6 ${
            outcome === 'won' ? 'bg-green-50' : 
            outcome === 'lost' ? 'bg-red-50' : 'bg-gray-50'
          }`}>
            <h3 className={`font-medium mb-2 ${
              outcome === 'won' ? 'text-green-900' : 
              outcome === 'lost' ? 'text-red-900' : 'text-gray-900'
            }`}>
              RFP {outcome.toUpperCase()}
            </h3>
            <p className={`text-sm ${
              outcome === 'won' ? 'text-green-800' : 
              outcome === 'lost' ? 'text-red-800' : 'text-gray-800'
            }`}>
              {outcome === 'won' && 'Congratulations! Contract awarded.'}
              {outcome === 'lost' && 'Better luck next time. Capture lessons learned.'}
              {outcome === 'cancelled' && 'RFP cancelled by client.'}
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Feedback</label>
              <textarea
                value={analysis.feedback}
                onChange={(e) => setAnalysis({...analysis, feedback: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                placeholder="What feedback did the client provide?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lessons Learned</label>
              <textarea
                value={analysis.lessons_learned}
                onChange={(e) => setAnalysis({...analysis, lessons_learned: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                placeholder="What would we do differently next time?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Competitive Analysis</label>
              <textarea
                value={analysis.competitive_analysis}
                onChange={(e) => setAnalysis({...analysis, competitive_analysis: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                placeholder="Who were the competitors and what were their strengths?"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  IntakeStage,
  GoNoGoStage,
  PlanningStage,
  SolutioningStage,
  PricingStage,
  ProposalBuildStage,
  ApprovalsStage,
  SubmissionStage,
  PostBidStage
};
