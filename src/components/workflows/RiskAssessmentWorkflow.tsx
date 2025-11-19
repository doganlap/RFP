/**
 * Risk Assessment Workflow Component
 * Comprehensive risk identification and mitigation planning
 */
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import type { Risk, RiskAssessment, RiskCategory } from '../../types/workflow';
import { AlertTriangle, Plus, Trash2, Shield } from 'lucide-react';

const RISK_CATEGORIES: { value: RiskCategory; label: string; icon: string }[] = [
  { value: 'technical' as RiskCategory, label: 'Technical Risk', icon: '⚙️' },
  { value: 'financial' as RiskCategory, label: 'Financial Risk', icon: '💰' },
  { value: 'legal' as RiskCategory, label: 'Legal Risk', icon: '⚖️' },
  { value: 'operational' as RiskCategory, label: 'Operational Risk', icon: '🔧' },
  { value: 'compliance' as RiskCategory, label: 'Compliance Risk', icon: '📋' },
  { value: 'reputational' as RiskCategory, label: 'Reputational Risk', icon: '🏢' },
  { value: 'resource' as RiskCategory, label: 'Resource Risk', icon: '👥' },
  { value: 'timeline' as RiskCategory, label: 'Timeline Risk', icon: '⏱️' }
];

const calculateRiskScore = (probability: string, impact: string): number => {
  const probScore = { low: 1, medium: 2, high: 3 }[probability] || 1;
  const impactScore = { low: 1, medium: 2, high: 3 }[impact] || 1;
  return probScore * impactScore;
};

const getRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score <= 2) return 'low';
  if (score <= 4) return 'medium';
  if (score <= 6) return 'high';
  return 'critical';
};

interface RiskAssessmentWorkflowProps {
  rfpId: string;
  existingAssessment?: RiskAssessment;
  onSave: (assessment: RiskAssessment) => void;
  onCancel: () => void;
}

export const RiskAssessmentWorkflow: React.FC<RiskAssessmentWorkflowProps> = ({
  rfpId,
  existingAssessment,
  onSave,
  onCancel
}) => {
  const [risks, setRisks] = useState<Risk[]>(existingAssessment?.risks || []);
  const [newRisk, setNewRisk] = useState<Partial<Risk>>({
    category: 'technical' as RiskCategory,
    probability: 'medium',
    impact: 'medium',
    status: 'identified'
  });

  const addRisk = () => {
    if (!newRisk.description) {
      alert('Please enter a risk description');
      return;
    }

    const risk: Risk = {
      id: `risk-${Date.now()}`,
      category: newRisk.category as RiskCategory,
      description: newRisk.description,
      probability: newRisk.probability as 'low' | 'medium' | 'high',
      impact: newRisk.impact as 'low' | 'medium' | 'high',
      riskScore: calculateRiskScore(
        newRisk.probability as string,
        newRisk.impact as string
      ),
      mitigation: newRisk.mitigation,
      owner: newRisk.owner,
      status: 'identified'
    };

    setRisks([...risks, risk]);
    setNewRisk({
      category: 'technical' as RiskCategory,
      probability: 'medium',
      impact: 'medium',
      status: 'identified'
    });
  };

  const removeRisk = (riskId: string) => {
    setRisks(risks.filter(r => r.id !== riskId));
  };

  const updateRisk = (riskId: string, updates: Partial<Risk>) => {
    setRisks(risks.map(r => {
      if (r.id === riskId) {
        const updated = { ...r, ...updates };
        if (updates.probability || updates.impact) {
          updated.riskScore = calculateRiskScore(updated.probability, updated.impact);
        }
        return updated;
      }
      return r;
    }));
  };

  const calculateOverallRisk = (): { score: number; level: 'low' | 'medium' | 'high' | 'critical' } => {
    if (risks.length === 0) return { score: 0, level: 'low' };

    const totalScore = risks.reduce((sum, risk) => sum + risk.riskScore, 0);
    const averageScore = totalScore / risks.length;

    return {
      score: Math.round(averageScore * 10) / 10,
      level: getRiskLevel(averageScore)
    };
  };

  const handleSave = () => {
    const overall = calculateOverallRisk();

    const assessment: RiskAssessment = {
      id: existingAssessment?.id || `assessment-${Date.now()}`,
      rfpId,
      risks,
      overallRiskScore: overall.score,
      riskLevel: overall.level,
      assessedBy: user?.id || 'current-user',
      assessedAt: new Date().toISOString()
    };

    onSave(assessment);
  };

  const overall = calculateOverallRisk();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Overall Risk Summary */}
      <Card variant="elevated">
        <CardHeader title="Risk Assessment Summary" />
        <CardBody>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overall Risk Level</p>
              <Badge
                variant={
                  overall.level === 'low' ? 'success' :
                  overall.level === 'medium' ? 'warning' :
                  overall.level === 'high' ? 'danger' : 'danger'
                }
                size="lg"
                dot
              >
                {overall.level.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Risk Score</p>
              <p className="text-3xl font-bold">
                {overall.score.toFixed(1)}/9
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Risks Identified</p>
              <p className="text-3xl font-bold">
                {risks.length}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Add New Risk */}
      <Card>
        <CardHeader title="Add New Risk" />
        <CardBody>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Category
              </label>
              <select
                title="Risk Category"
                value={newRisk.category}
                onChange={(e) => setNewRisk({ ...newRisk, category: e.target.value as RiskCategory })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {RISK_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Owner (Optional)
              </label>
              <input
                type="text"
                value={newRisk.owner || ''}
                onChange={(e) => setNewRisk({ ...newRisk, owner: e.target.value })}
                placeholder="e.g., John Doe"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Description *
            </label>
            <textarea
              value={newRisk.description || ''}
              onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
              placeholder="Describe the risk..."
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Probability
              </label>
              <select
                title="Probability"
                value={newRisk.probability}
                onChange={(e) => setNewRisk({ ...newRisk, probability: e.target.value as any })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low (&lt; 30%)</option>
                <option value="medium">Medium (30-70%)</option>
                <option value="high">High (&gt; 70%)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impact
              </label>
              <select
                title="Impact"
                value={newRisk.impact}
                onChange={(e) => setNewRisk({ ...newRisk, impact: e.target.value as any })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">Low (Minor)</option>
                <option value="medium">Medium (Moderate)</option>
                <option value="high">High (Severe)</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mitigation Plan (Optional)
            </label>
            <textarea
              value={newRisk.mitigation || ''}
              onChange={(e) => setNewRisk({ ...newRisk, mitigation: e.target.value })}
              placeholder="How will we mitigate this risk?"
              rows={2}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={addRisk}
          >
            Add Risk
          </Button>
        </CardBody>
      </Card>

      {/* Risk List */}
      {risks.length > 0 && (
        <Card>
          <CardHeader title={`Identified Risks (${risks.length})`} />
          <CardBody>
            <div className="space-y-4">
              {risks.map(risk => {
                const category = RISK_CATEGORIES.find(c => c.value === risk.category);
                const riskLevel = getRiskLevel(risk.riskScore);

                return (
                  <div key={risk.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{category?.icon}</span>
                        <div>
                          <Badge variant="info" size="sm">
                            {category?.label}
                          </Badge>
                          {risk.owner && (
                            <span className="text-sm text-gray-600 ml-2">
                              Owner: {risk.owner}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            riskLevel === 'low' ? 'success' :
                            riskLevel === 'medium' ? 'warning' : 'danger'
                          }
                          size="sm"
                        >
                          Score: {risk.riskScore}
                        </Badge>
                        <button
                          onClick={() => removeRisk(risk.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete risk"
                          aria-label="Delete risk"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-900 mb-2 font-medium">{risk.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Probability: </span>
                        <span className="font-medium capitalize">{risk.probability}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Impact: </span>
                        <span className="font-medium capitalize">{risk.impact}</span>
                      </div>
                    </div>

                    {risk.mitigation && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-3">
                        <div className="flex items-start">
                          <Shield className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Mitigation Plan</p>
                            <p className="text-sm text-blue-800 mt-1">{risk.mitigation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-3">
                      <select
                        title="Risk Status"
                        value={risk.status}
                        onChange={(e) => updateRisk(risk.id, { status: e.target.value as any })}
                        className="text-sm rounded-md border-gray-300"
                      >
                        <option value="identified">Identified</option>
                        <option value="mitigated">Mitigated</option>
                        <option value="accepted">Accepted</option>
                        <option value="transferred">Transferred</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={risks.length === 0}
        >
          Save Risk Assessment
        </Button>
      </div>
    </div>
  );
};
