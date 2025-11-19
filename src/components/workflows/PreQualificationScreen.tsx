/**
 * Pre-Qualification Screening Component
 * Automated screening before RFP enters the formal process
 */
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { PreQualificationCriteria, PreQualificationResponse, PreQualificationResult } from '../../types/workflow';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const DEFAULT_CRITERIA: PreQualificationCriteria[] = [
  // Strategic Alignment
  {
    id: 'strat-1',
    category: 'strategic',
    question: 'Does this RFP align with our strategic focus areas?',
    weight: 20,
    required: true,
    options: [
      { value: 'perfect', label: 'Perfect alignment - Core competency', score: 100, disqualifies: false },
      { value: 'good', label: 'Good alignment - Adjacent area', score: 70, disqualifies: false },
      { value: 'partial', label: 'Partial alignment - New area', score: 40, disqualifies: false },
      { value: 'none', label: 'No alignment - Outside expertise', score: 0, disqualifies: true }
    ]
  },
  {
    id: 'strat-2',
    category: 'strategic',
    question: 'Is the client in our target market/industry?',
    weight: 15,
    required: true,
    options: [
      { value: 'tier1', label: 'Tier 1 target client', score: 100 },
      { value: 'tier2', label: 'Tier 2 target client', score: 70 },
      { value: 'opportunistic', label: 'Opportunistic client', score: 40 },
      { value: 'outside', label: 'Outside target market', score: 20 }
    ]
  },

  // Financial Viability
  {
    id: 'fin-1',
    category: 'financial',
    question: 'What is the estimated contract value?',
    weight: 15,
    required: true,
    options: [
      { value: 'large', label: '>$10M - Strategic deal', score: 100 },
      { value: 'medium', label: '$1M-$10M - Substantial', score: 80 },
      { value: 'small', label: '$100K-$1M - Standard', score: 50 },
      { value: 'minimal', label: '<$100K - Too small', score: 0, disqualifies: true }
    ]
  },
  {
    id: 'fin-2',
    category: 'financial',
    question: 'Is the pricing model acceptable?',
    weight: 10,
    required: true,
    options: [
      { value: 'favorable', label: 'Favorable - Cost+ or T&M', score: 100 },
      { value: 'standard', label: 'Standard - Fixed price', score: 80 },
      { value: 'risky', label: 'Risky - Performance-based', score: 40 },
      { value: 'unacceptable', label: 'Unacceptable terms', score: 0, disqualifies: true }
    ]
  },

  // Technical Capability
  {
    id: 'tech-1',
    category: 'technical',
    question: 'Do we have the required technical capabilities?',
    weight: 20,
    required: true,
    options: [
      { value: 'proven', label: 'Proven track record', score: 100 },
      { value: 'capable', label: 'Have capabilities', score: 80 },
      { value: 'learning', label: 'Need some training', score: 50 },
      { value: 'lacking', label: 'Lack critical capabilities', score: 0, disqualifies: true }
    ]
  },
  {
    id: 'tech-2',
    category: 'technical',
    question: 'Are the technical requirements realistic?',
    weight: 10,
    required: true,
    options: [
      { value: 'realistic', label: 'Fully realistic', score: 100 },
      { value: 'challenging', label: 'Challenging but achievable', score: 70 },
      { value: 'aggressive', label: 'Very aggressive', score: 30 },
      { value: 'unrealistic', label: 'Unrealistic/impossible', score: 0, disqualifies: true }
    ]
  },

  // Resource Availability
  {
    id: 'res-1',
    category: 'resource',
    question: 'Do we have available resources/team?',
    weight: 10,
    required: true,
    options: [
      { value: 'available', label: 'Team ready and available', score: 100 },
      { value: 'reallocation', label: 'Available with reallocation', score: 70 },
      { value: 'hiring', label: 'Need to hire/train', score: 40 },
      { value: 'unavailable', label: 'Resources not available', score: 0, disqualifies: true }
    ]
  }
];

interface PreQualificationScreenProps {
  rfpId: string;
  rfpTitle: string;
  onComplete: (result: PreQualificationResult) => void;
  onCancel: () => void;
}

export const PreQualificationScreen: React.FC<PreQualificationScreenProps> = ({
  rfpId,
  rfpTitle,
  onComplete,
  onCancel
}) => {
  const [responses, setResponses] = useState<Map<string, PreQualificationResponse>>(new Map());
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentCriteria = DEFAULT_CRITERIA[currentStep];
  const isLastStep = currentStep === DEFAULT_CRITERIA.length - 1;

  const handleResponse = (criteriaId: string, value: string, score: number, disqualifies?: boolean) => {
    const response: PreQualificationResponse = {
      criteriaId,
      value,
      score,
      respondedBy: user?.id || 'current-user',
      respondedAt: new Date().toISOString()
    };

    const newResponses = new Map(responses);
    newResponses.set(criteriaId, response);
    setResponses(newResponses);

    // Auto-advance if disqualified or last step
    if (disqualifies) {
      calculateAndShowResults(newResponses);
    } else if (isLastStep) {
      calculateAndShowResults(newResponses);
    } else {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const calculateAndShowResults = (finalResponses: Map<string, PreQualificationResponse>) => {
    const responsesArray = Array.from(finalResponses.values());

    // Calculate total score
    let totalScore = 0;
    let maxScore = 0;
    const disqualificationReasons: string[] = [];

    DEFAULT_CRITERIA.forEach(criteria => {
      maxScore += criteria.weight;
      const response = finalResponses.get(criteria.id);

      if (response) {
        totalScore += (response.score / 100) * criteria.weight;

        // Check for disqualification
        const option = criteria.options?.find(opt => opt.value === response.value);
        if (option?.disqualifies) {
          disqualificationReasons.push(criteria.question);
        }
      }
    });

    const scorePercentage = (totalScore / maxScore) * 100;
    const disqualified = disqualificationReasons.length > 0;

    let recommendation: 'proceed' | 'review' | 'reject';
    if (disqualified) {
      recommendation = 'reject';
    } else if (scorePercentage >= 70) {
      recommendation = 'proceed';
    } else if (scorePercentage >= 50) {
      recommendation = 'review';
    } else {
      recommendation = 'reject';
    }

    const result: PreQualificationResult = {
      rfpId,
      totalScore,
      maxScore,
      scorePercentage,
      passed: !disqualified && scorePercentage >= 50,
      disqualified,
      disqualificationReasons,
      responses: responsesArray,
      recommendation
    };

    setShowResults(true);
    setTimeout(() => onComplete(result), 3000);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / DEFAULT_CRITERIA.length) * 100;
  };

  if (showResults) {
    const responsesArray = Array.from(responses.values());
    let totalScore = 0;
    let maxScore = 0;

    DEFAULT_CRITERIA.forEach(criteria => {
      maxScore += criteria.weight;
      const response = responses.get(criteria.id);
      if (response) {
        totalScore += (response.score / 100) * criteria.weight;
      }
    });

    const scorePercentage = (totalScore / maxScore) * 100;
    const disqualified = responsesArray.some(r => {
      const criteria = DEFAULT_CRITERIA.find(c => c.id === r.criteriaId);
      const option = criteria?.options?.find(opt => opt.value === r.value);
      return option?.disqualifies;
    });

    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <div className="mb-6">
              {disqualified ? (
                <XCircle className="w-20 h-20 mx-auto text-red-500" />
              ) : scorePercentage >= 70 ? (
                <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
              ) : (
                <AlertTriangle className="w-20 h-20 mx-auto text-yellow-500" />
              )}
            </div>

            <h2 className="text-3xl font-bold mb-2">
              {disqualified ? 'Disqualified' : scorePercentage >= 70 ? 'Qualified' : 'Review Required'}
            </h2>

            <div className="text-6xl font-bold my-6" style={{
              color: disqualified ? '#EF4444' : scorePercentage >= 70 ? '#10B981' : '#F59E0B'
            }}>
              {Math.round(scorePercentage)}%
            </div>

            <p className="text-gray-600 mb-4">
              {disqualified
                ? 'This RFP does not meet minimum qualification criteria'
                : scorePercentage >= 70
                  ? 'This RFP meets all qualification criteria'
                  : 'This RFP requires management review before proceeding'
              }
            </p>

            <div className="mt-8">
              <p className="text-sm text-gray-500">Processing results...</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader
          title="Pre-Qualification Screening"
          subtitle={rfpTitle}
        />
        <CardBody>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentStep + 1} of {DEFAULT_CRITERIA.length}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(getProgressPercentage())}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Category Badge */}
          <div className="mb-4">
            <Badge variant="info" size="md">
              {currentCriteria.category.toUpperCase()}
            </Badge>
          </div>

          {/* Question */}
          <h3 className="text-xl font-semibold mb-6">
            {currentCriteria.question}
            {currentCriteria.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentCriteria.options?.map(option => (
              <button
                key={option.value}
                onClick={() => handleResponse(
                  currentCriteria.id,
                  option.value,
                  option.score,
                  option.disqualifies
                )}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  option.disqualifies
                    ? 'border-red-200 hover:border-red-500 hover:bg-red-50'
                    : option.score >= 80
                      ? 'border-green-200 hover:border-green-500 hover:bg-green-50'
                      : option.score >= 50
                        ? 'border-yellow-200 hover:border-yellow-500 hover:bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{option.label}</span>
                  <div className="flex items-center gap-2">
                    {option.disqualifies && (
                      <Badge variant="danger" size="sm">Disqualifies</Badge>
                    )}
                    <Badge
                      variant={option.score >= 80 ? 'success' : option.score >= 50 ? 'warning' : 'default'}
                      size="sm"
                    >
                      {option.score} pts
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onCancel : handleBack}
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>

            <span className="text-sm text-gray-500">
              Select an option to continue
            </span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
