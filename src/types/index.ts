// Core Types for Enterprise RFP Platform

export interface User {
  id: string;
  email: string;
  role: UserRole;
  department?: string;
  firstName?: string;
  lastName?: string;
  permissions: Array<Permission | string>;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  PRESALES = 'PRESALES',
  LEGAL = 'LEGAL',
  FINANCE = 'FINANCE',
  TECH = 'TECH',
  VIEWER = 'VIEWER'
}

export enum Permission {
  RFP_CREATE = 'RFP_CREATE',
  RFP_EDIT = 'RFP_EDIT',
  RFP_DELETE = 'RFP_DELETE',
  RFP_VIEW = 'RFP_VIEW',
  RFP_APPROVE = 'RFP_APPROVE',
  RFP_REJECT = 'RFP_REJECT',
  ADMIN_ACCESS = 'ADMIN_ACCESS'
}

export interface RFP {
  id: string;
  title: string;
  client: string;
  status: RFPStatus;
  stage: RFPStage;
  submittedAt: string;
  estimatedValue: number;
  currency: string;
  duration: string;
  submissionDeadline: string;
  createdBy: string;
  assignedTo?: string[];
  triage?: TriageData;
  strategy?: StrategyData;
  tags?: string[];
  priority?: Priority;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export enum RFPStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ON_HOLD = 'ON_HOLD'
}

export enum RFPStage {
  STAGE_1_TRIAGE = 'STAGE_1_TRIAGE',
  STAGE_2_BUSINESS_REVIEW = 'STAGE_2_BUSINESS_REVIEW',
  STAGE_3_SME_QUALIFICATION = 'STAGE_3_SME_QUALIFICATION',
  STAGE_4_PROPOSAL = 'STAGE_4_PROPOSAL',
  STAGE_5_SUBMISSION = 'STAGE_5_SUBMISSION'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface TriageData {
  tShirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  effortDays: number;
  value: number;
  riskScore: number;
  confidenceLevel: number;
  nonNegotiableQualifiers: NonNegotiableQualifier[];
}

export interface NonNegotiableQualifier {
  id: string;
  type: QualifierType;
  text: string;
  status: QualifierStatus;
}

export enum QualifierType {
  LEGAL = 'LEGAL',
  FINANCE = 'FINANCE',
  TECH = 'TECH',
  COMPLIANCE = 'COMPLIANCE',
  STANDARD = 'STANDARD'
}

export enum QualifierStatus {
  VERIFIED = 'VERIFIED',
  ACCEPTABLE = 'ACCEPTABLE',
  FLAG_FOR_REVIEW = 'FLAG_FOR_REVIEW',
  DEAL_BREAKER = 'DEAL_BREAKER'
}

export interface StrategyData {
  strategicFitScore: number;
  winProbability: number;
  competitiveAdvantage: string;
  summary: string;
  historicalData: HistoricalRFP[];
}

export interface HistoricalRFP {
  id: string;
  rfpId: string;
  client: string;
  outcome: 'WON' | 'LOST' | 'NO_BID';
  similarity: number;
  notes: string;
}

export interface QueueItem {
  id: string;
  type: QualifierType;
  text: string;
  botAnalysis: string;
  botSuggestion: BotSuggestion;
  historicalPrecedent?: HistoricalPrecedent;
  humanStatus: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

export enum BotSuggestion {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  ESCALATE = 'ESCALATE',
  ESCALATE_TO_TECH = 'ESCALATE_TO_TECH'
}

export enum ReviewStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  ESCALATED = 'Escalated'
}

export interface HistoricalPrecedent {
  rfpId: string;
  notes: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
  rfpId?: string;
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export interface Document {
  id: string;
  rfpId: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  status: DocumentStatus;
}

export enum DocumentStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface Task {
  id: string;
  rfpId: string;
  title: string;
  description?: string;
  assignedTo: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED'
}

export interface Comment {
  id: string;
  rfpId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Pagination Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter Types
export interface RFPFilters {
  status?: RFPStatus[];
  stage?: RFPStage[];
  priority?: Priority[];
  assignedTo?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
