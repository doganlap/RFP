/**
 * Workflow-specific types for RFP lifecycle
 */

export interface PreQualificationCriteria {
  id: string;
  category: 'strategic' | 'financial' | 'technical' | 'compliance' | 'resource';
  question: string;
  weight: number;
  required: boolean;
  options?: PreQualificationOption[];
}

export interface PreQualificationOption {
  value: string;
  label: string;
  score: number;
  disqualifies?: boolean;
}

export interface PreQualificationResponse {
  criteriaId: string;
  value: string | number | boolean;
  score: number;
  notes?: string;
  respondedBy: string;
  respondedAt: string;
}

export interface PreQualificationResult {
  rfpId: string;
  totalScore: number;
  maxScore: number;
  scorePercentage: number;
  passed: boolean;
  disqualified: boolean;
  disqualificationReasons: string[];
  responses: PreQualificationResponse[];
  recommendation: 'proceed' | 'review' | 'reject';
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface RiskAssessment {
  id: string;
  rfpId: string;
  risks: Risk[];
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  mitigationPlan?: string;
  assessedBy: string;
  assessedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Risk {
  id: string;
  category: RiskCategory;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  riskScore: number;
  mitigation?: string;
  owner?: string;
  status: 'identified' | 'mitigated' | 'accepted' | 'transferred';
}

export enum RiskCategory {
  TECHNICAL = 'technical',
  FINANCIAL = 'financial',
  LEGAL = 'legal',
  OPERATIONAL = 'operational',
  COMPLIANCE = 'compliance',
  REPUTATIONAL = 'reputational',
  RESOURCE = 'resource',
  TIMELINE = 'timeline'
}

export interface BidNoBidVote {
  id: string;
  rfpId: string;
  committeeMembers: CommitteeMember[];
  votes: Vote[];
  decision?: 'bid' | 'no-bid' | 'defer';
  decisionMadeAt?: string;
  quorumRequired: number;
  votingDeadline: string;
  status: 'open' | 'closed' | 'cancelled';
  finalRecommendation?: string;
}

export interface CommitteeMember {
  userId: string;
  name: string;
  role: string;
  department: string;
  votingPower: number;
  required: boolean;
}

export interface Vote {
  userId: string;
  decision: 'bid' | 'no-bid' | 'abstain';
  rationale?: string;
  votedAt: string;
  conditions?: string[];
}

export interface ContractNegotiation {
  id: string;
  rfpId: string;
  stage: NegotiationStage;
  negotiationItems: NegotiationItem[];
  clientContact: Contact;
  ourNegotiator: Contact;
  startDate: string;
  targetCloseDate: string;
  actualCloseDate?: string;
  status: 'pending' | 'active' | 'completed' | 'stalled' | 'cancelled';
}

export enum NegotiationStage {
  INITIAL_TERMS = 'initial_terms',
  PRICING = 'pricing',
  LEGAL_TERMS = 'legal_terms',
  SLA_TERMS = 'sla_terms',
  FINAL_REVIEW = 'final_review',
  SIGNATURE = 'signature'
}

export interface NegotiationItem {
  id: string;
  category: 'pricing' | 'terms' | 'scope' | 'timeline' | 'sla' | 'legal';
  description: string;
  ourPosition: string;
  clientPosition: string;
  agreedPosition?: string;
  status: 'open' | 'agreed' | 'conceded' | 'deadlocked';
  priority: 'must-have' | 'should-have' | 'nice-to-have';
  notes?: string;
}

export interface Contact {
  name: string;
  email: string;
  phone?: string;
  title?: string;
  company?: string;
}

export interface WinLossAnalysis {
  id: string;
  rfpId: string;
  outcome: 'won' | 'lost' | 'no-decision';
  contractValue?: number;
  winDate?: string;
  lossDate?: string;
  primaryReasons: WinLossReason[];
  competitorInfo?: CompetitorInfo;
  lessonsLearned: string[];
  strengthsIdentified: string[];
  weaknessesIdentified: string[];
  recommendations: string[];
  analyzedBy: string;
  analyzedAt: string;
  teamFeedback?: TeamFeedback[];
}

export interface WinLossReason {
  category: 'pricing' | 'technical' | 'relationship' | 'experience' | 'timeline' | 'other';
  description: string;
  impact: 'primary' | 'secondary' | 'minor';
}

export interface CompetitorInfo {
  name?: string;
  estimatedPrice?: number;
  strengths: string[];
  weaknesses: string[];
  marketPosition: string;
}

export interface TeamFeedback {
  userId: string;
  userName: string;
  role: string;
  feedback: string;
  suggestions: string[];
  submittedAt: string;
}

export interface Comment {
  id: string;
  entityType: 'rfp' | 'section' | 'document' | 'task';
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  text: string;
  mentions: Mention[];
  parentCommentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt?: string;
  isResolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface Mention {
  userId: string;
  userName: string;
  notified: boolean;
}

export interface Discussion {
  id: string;
  rfpId: string;
  title: string;
  description: string;
  category: 'technical' | 'commercial' | 'legal' | 'general';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  participants: string[];
  comments: Comment[];
  status: 'open' | 'resolved' | 'closed';
  tags: string[];
  pinned: boolean;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  changes: string;
  fileSize: number;
  checksum: string;
  previousVersionId?: string;
}

export interface ChangeLog {
  id: string;
  entityType: 'rfp' | 'document' | 'proposal' | 'pricing';
  entityId: string;
  changeType: 'create' | 'update' | 'delete' | 'approve' | 'reject';
  field?: string;
  oldValue?: any;
  newValue?: any;
  changedBy: string;
  changedByName: string;
  changedAt: string;
  reason?: string;
}
