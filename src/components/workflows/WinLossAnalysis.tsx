/**
 * Win/Loss Analysis Module
 * Post-RFP retrospective with lessons learned
 */
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { WinLossAnalysis, WinLossReason } from '../../types/workflow';
import {
  TrophyIcon,
  XCircle,
  HelpCircle,
  DollarSign,
  Wrench,
  Users,
  Award,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/format';

interface WinLossAnalysisProps {
  rfpId: string;
  rfpTitle: string;
  client: string;
  estimatedValue: number;
  actualValue?: number;
  competitorCount?: number;
  onAnalysisSubmit: (analysis: WinLossAnalysis) => void;
  existingAnalysis?: WinLossAnalysis;
}

const OUTCOME_OPTIONS: { value: 'won' | 'lost' | 'no-decision'; label: string; icon: any; color: string }[] = [
  { value: 'won', label: 'Won', icon: TrophyIcon, color: 'green' },
  { value: 'lost', label: 'Lost', icon: XCircle, color: 'red' },
  { value: 'no-decision', label: 'No Decision', icon: HelpCircle, color: 'gray' }
];

const PRIMARY_REASONS: { value: WinLossReason; label: string; icon: any }[] = [
  { value: 'pricing', label: 'Pricing/Cost', icon: DollarSign },
  { value: 'technical', label: 'Technical Solution', icon: Wrench },
  { value: 'relationship', label: 'Client Relationship', icon: Users },
  { value: 'experience', label: 'Past Experience/References', icon: Award },
  { value: 'timeline', label: 'Timeline/Delivery', icon: Clock },
  { value: 'compliance', label: 'Compliance/Certifications', icon: Target },
  { value: 'team', label: 'Team Expertise', icon: Users },
  { value: 'innovation', label: 'Innovation/Differentiation', icon: Lightbulb },
  { value: 'other', label: 'Other', icon: HelpCircle }
];

const RATING_CATEGORIES = [
  { key: 'technicalQuality', label: 'Technical Solution Quality', icon: Wrench },
  { key: 'pricingCompetitiveness', label: 'Pricing Competitiveness', icon: DollarSign },
  { key: 'presentationQuality', label: 'Presentation Quality', icon: BookOpen },
  { key: 'teamPerformance', label: 'Team Performance', icon: Users },
  { key: 'timelinessOfDelivery', label: 'Timeliness of Delivery', icon: Clock }
] as const;

export const WinLossAnalysis: React.FC<WinLossAnalysisProps> = ({
  rfpId,
  rfpTitle,
  client,
  estimatedValue,
  actualValue,
  competitorCount = 0,
  onAnalysisSubmit,
  existingAnalysis
}) => {
  const [outcome, setOutcome] = useState<'won' | 'lost' | 'no-decision' | undefined>(
    existingAnalysis?.outcome
  );
  const [primaryReason, setPrimaryReason] = useState<WinLossReason | undefined>(
    existingAnalysis?.primaryReason
  );
  const [secondaryReasons, setSecondaryReasons] = useState<WinLossReason[]>(
    existingAnalysis?.secondaryReasons || []
  );
  const [competitorWon, setCompetitorWon] = useState(existingAnalysis?.competitorWon || '');
  const [finalContractValue, setFinalContractValue] = useState(
    existingAnalysis?.finalContractValue || actualValue || estimatedValue
  );
  const [ratings, setRatings] = useState({
    technicalQuality: existingAnalysis?.ratings?.technicalQuality || 3,
    pricingCompetitiveness: existingAnalysis?.ratings?.pricingCompetitiveness || 3,
    presentationQuality: existingAnalysis?.ratings?.presentationQuality || 3,
    teamPerformance: existingAnalysis?.ratings?.teamPerformance || 3,
    timelinessOfDelivery: existingAnalysis?.ratings?.timelinessOfDelivery || 3
  });
  const [strengths, setStrengths] = useState<string[]>(existingAnalysis?.strengths || ['']);
  const [weaknesses, setWeaknesses] = useState<string[]>(existingAnalysis?.weaknesses || ['']);
  const [lessonsLearned, setLessonsLearned] = useState<string[]>(existingAnalysis?.lessonsLearned || ['']);
  const [teamFeedback, setTeamFeedback] = useState<string>(existingAnalysis?.teamFeedback || '');
  const [actionItems, setActionItems] = useState<string[]>(existingAnalysis?.actionItems || ['']);

  const handleSubmit = () => {
    if (!outcome || !primaryReason) {
      alert('Please select an outcome and primary reason');
      return;
    }

    const analysis: WinLossAnalysis = {
      id: existingAnalysis?.id || `analysis-${Date.now()}`,
      rfpId,
      outcome,
      primaryReason,
      secondaryReasons: secondaryReasons.filter(r => r),
      competitorWon: outcome === 'lost' ? competitorWon : undefined,
      finalContractValue: outcome === 'won' ? finalContractValue : undefined,
      ratings,
      strengths: strengths.filter(s => s.trim()),
      weaknesses: weaknesses.filter(w => w.trim()),
      lessonsLearned: lessonsLearned.filter(l => l.trim()),
      teamFeedback,
      actionItems: actionItems.filter(a => a.trim()),
      completedAt: new Date().toISOString(),
      completedBy: user?.id || 'current-user',
    };

    onAnalysisSubmit(analysis);
  };

  const addArrayItem = (
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setArr([...arr, '']);
  };

  const updateArrayItem = (
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    const newArr = [...arr];
    newArr[index] = value;
    setArr(newArr);
  };

  const removeArrayItem = (
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setArr(arr.filter((_, i) => i !== index));
  };

  const toggleSecondaryReason = (reason: WinLossReason) => {
    if (secondaryReasons.includes(reason)) {
      setSecondaryReasons(secondaryReasons.filter(r => r !== reason));
    } else {
      setSecondaryReasons([...secondaryReasons, reason]);
    }
  };

  const averageRating = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.keys(ratings).length;

  const selectedOutcome = OUTCOME_OPTIONS.find(o => o.value === outcome);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <CardBody>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Win/Loss Analysis</h2>
              <p className="text-gray-600">{rfpTitle}</p>
              <p className="text-sm text-gray-500 mt-1">Client: {client}</p>
              <p className="text-sm text-gray-500">
                Estimated Value: {formatCurrency(estimatedValue)}
              </p>
              {competitorCount > 0 && (
                <p className="text-sm text-gray-500">Competitors: {competitorCount}</p>
              )}
            </div>
            {outcome && selectedOutcome && (
              <Badge
                variant={
                  outcome === 'won' ? 'success' :
                  outcome === 'lost' ? 'danger' : 'default'
                }
                size="lg"
                dot
              >
                {selectedOutcome.label}
              </Badge>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Outcome Selection */}
      <Card>
        <CardHeader title="Outcome" />
        <CardBody>
          <div className="grid grid-cols-3 gap-4">
            {OUTCOME_OPTIONS.map(option => {
              const Icon = option.icon;
              const isSelected = outcome === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setOutcome(option.value)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`h-12 w-12 mx-auto mb-3 ${
                    isSelected
                      ? `text-${option.color}-600`
                      : 'text-gray-400'
                  }`} />
                  <p className={`font-medium ${
                    isSelected ? `text-${option.color}-900` : 'text-gray-700'
                  }`}>
                    {option.label}
                  </p>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Additional Details Based on Outcome */}
      {outcome && (
        <>
          {outcome === 'won' && (
            <Card>
              <CardHeader title="Contract Details" />
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Contract Value
                    </label>
                    <input
                      type="number"
                      value={finalContractValue}
                      onChange={(e) => setFinalContractValue(Number(e.target.value))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="bg-green-50 p-4 rounded-lg w-full">
                      <p className="text-sm text-green-700">
                        {finalContractValue > estimatedValue ? (
                          <>
                            <TrendingUp className="inline h-4 w-4 mr-1" />
                            {formatCurrency(finalContractValue - estimatedValue)} above estimate
                          </>
                        ) : finalContractValue < estimatedValue ? (
                          <>
                            <TrendingDown className="inline h-4 w-4 mr-1" />
                            {formatCurrency(estimatedValue - finalContractValue)} below estimate
                          </>
                        ) : (
                          'Exactly as estimated'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {outcome === 'lost' && (
            <Card>
              <CardHeader title="Competitor Information" />
              <CardBody>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who won the contract?
                </label>
                <input
                  type="text"
                  value={competitorWon}
                  onChange={(e) => setCompetitorWon(e.target.value)}
                  placeholder="e.g., Acme Corp, CompetitorX, Unknown"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </CardBody>
            </Card>
          )}

          {/* Primary Reason */}
          <Card>
            <CardHeader title="Primary Reason" />
            <CardBody>
              <div className="grid grid-cols-3 gap-3">
                {PRIMARY_REASONS.map(reason => {
                  const Icon = reason.icon;
                  const isSelected = primaryReason === reason.value;

                  return (
                    <button
                      key={reason.value}
                      onClick={() => setPrimaryReason(reason.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm ${
                        isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'
                      }`}>
                        {reason.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Secondary Reasons */}
          <Card>
            <CardHeader title="Contributing Factors (Optional)" />
            <CardBody>
              <div className="grid grid-cols-4 gap-2">
                {PRIMARY_REASONS.filter(r => r.value !== primaryReason).map(reason => (
                  <label
                    key={reason.value}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={secondaryReasons.includes(reason.value)}
                      onChange={() => toggleSecondaryReason(reason.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{reason.label}</span>
                  </label>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Performance Ratings */}
          <Card>
            <CardHeader title="Performance Ratings" />
            <CardBody>
              <div className="space-y-4">
                {RATING_CATEGORIES.map(category => {
                  const Icon = category.icon;
                  return (
                    <div key={category.key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-gray-600" />
                          <label className="text-sm font-medium text-gray-700">
                            {category.label}
                          </label>
                        </div>
                        <Badge size="sm" variant={
                          ratings[category.key] >= 4 ? 'success' :
                          ratings[category.key] >= 3 ? 'default' : 'warning'
                        }>
                          {ratings[category.key]}/5
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(value => (
                          <button
                            key={value}
                            onClick={() => setRatings({ ...ratings, [category.key]: value })}
                            className={`flex-1 h-10 rounded transition-colors ${
                              value <= ratings[category.key]
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-600"> / 5.0 Average</span>
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Strengths */}
          <Card>
            <CardHeader
              title="Strengths"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ThumbsUp className="h-4 w-4" />}
                  onClick={() => addArrayItem(strengths, setStrengths)}
                >
                  Add Strength
                </Button>
              }
            />
            <CardBody>
              <div className="space-y-2">
                {strengths.map((strength, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={strength}
                      onChange={(e) => updateArrayItem(strengths, setStrengths, index, e.target.value)}
                      placeholder="What did we do well?"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem(strengths, setStrengths, index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Weaknesses */}
          <Card>
            <CardHeader
              title="Weaknesses / Areas for Improvement"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ThumbsDown className="h-4 w-4" />}
                  onClick={() => addArrayItem(weaknesses, setWeaknesses)}
                >
                  Add Weakness
                </Button>
              }
            />
            <CardBody>
              <div className="space-y-2">
                {weaknesses.map((weakness, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={weakness}
                      onChange={(e) => updateArrayItem(weaknesses, setWeaknesses, index, e.target.value)}
                      placeholder="What could we improve?"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem(weaknesses, setWeaknesses, index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Lessons Learned */}
          <Card>
            <CardHeader
              title="Lessons Learned"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Lightbulb className="h-4 w-4" />}
                  onClick={() => addArrayItem(lessonsLearned, setLessonsLearned)}
                >
                  Add Lesson
                </Button>
              }
            />
            <CardBody>
              <div className="space-y-2">
                {lessonsLearned.map((lesson, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={lesson}
                      onChange={(e) => updateArrayItem(lessonsLearned, setLessonsLearned, index, e.target.value)}
                      placeholder="Key takeaway for future RFPs"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem(lessonsLearned, setLessonsLearned, index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader
              title="Action Items for Future RFPs"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Target className="h-4 w-4" />}
                  onClick={() => addArrayItem(actionItems, setActionItems)}
                >
                  Add Action
                </Button>
              }
            />
            <CardBody>
              <div className="space-y-2">
                {actionItems.map((action, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={action}
                      onChange={(e) => updateArrayItem(actionItems, setActionItems, index, e.target.value)}
                      placeholder="Specific action to implement"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem(actionItems, setActionItems, index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Team Feedback */}
          <Card>
            <CardHeader title="Team Feedback & Comments" />
            <CardBody>
              <textarea
                value={teamFeedback}
                onChange={(e) => setTeamFeedback(e.target.value)}
                placeholder="Overall team reflections, client feedback, or additional context..."
                rows={6}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </CardBody>
          </Card>

          {/* Submit */}
          <Card variant="elevated">
            <CardBody>
              <div className="text-center py-4">
                <Button
                  variant={outcome === 'won' ? 'success' : 'primary'}
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!outcome || !primaryReason}
                >
                  Complete Win/Loss Analysis
                </Button>
                {(!outcome || !primaryReason) && (
                  <p className="text-sm text-gray-500 mt-2">
                    Please select an outcome and primary reason
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};
