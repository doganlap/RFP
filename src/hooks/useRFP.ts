/**
 * Enterprise RFP Hook wired to the real API layer
 */
import { useCallback } from 'react';
import { useAppStore } from '../store';
import { apiClient } from '../services/ApiClient';
import type { RFP } from '../types';
import { RFPStage, RFPStatus, Priority } from '../types';

export interface CreateRfpInput {
  title: string;
  client: string;
  estimatedValue?: number;
  currency?: string;
  submissionDeadline?: string;
  duration?: string;
  status?: RFPStatus;
  stage?: RFPStage;
  priority?: Priority;
  tags?: string[];
  triage?: RFP['triage'];
  strategy?: RFP['strategy'];
  assignedTo?: string[];
  metadata?: Record<string, unknown>;
}

export type UpdateRfpInput = Partial<CreateRfpInput> & { clientId?: string };

const workflowStageMap: Record<string, RFPStage> = {
  intake: RFPStage.STAGE_1_TRIAGE,
  go_no_go: RFPStage.STAGE_2_BUSINESS_REVIEW,
  planning: RFPStage.STAGE_3_SME_QUALIFICATION,
  solutioning: RFPStage.STAGE_3_SME_QUALIFICATION,
  pricing: RFPStage.STAGE_4_PROPOSAL,
  proposal_build: RFPStage.STAGE_4_PROPOSAL,
  approvals: RFPStage.STAGE_4_PROPOSAL,
  submission: RFPStage.STAGE_5_SUBMISSION,
  post_bid: RFPStage.STAGE_5_SUBMISSION,
  won: RFPStage.STAGE_5_SUBMISSION,
  lost: RFPStage.STAGE_5_SUBMISSION,
  abandoned: RFPStage.STAGE_1_TRIAGE,
};

const workflowStatusMap: Record<string, RFPStatus> = {
  intake: RFPStatus.DRAFT,
  go_no_go: RFPStatus.IN_REVIEW,
  planning: RFPStatus.IN_REVIEW,
  solutioning: RFPStatus.IN_REVIEW,
  pricing: RFPStatus.IN_REVIEW,
  proposal_build: RFPStatus.IN_REVIEW,
  approvals: RFPStatus.IN_REVIEW,
  submission: RFPStatus.SUBMITTED,
  post_bid: RFPStatus.IN_REVIEW,
  won: RFPStatus.APPROVED,
  lost: RFPStatus.REJECTED,
  abandoned: RFPStatus.ON_HOLD,
};

const priorityMap: Record<string, Priority> = {
  low: Priority.LOW,
  medium: Priority.MEDIUM,
  high: Priority.HIGH,
  critical: Priority.CRITICAL,
};

const parseDurationMonths = (value?: string | null): number | undefined => {
  if (!value) return undefined;
  const match = value.match(/(\d+)/);
  if (!match) return undefined;
  return Number.parseInt(match[1], 10);
};

const normalizeStatus = (value?: string | null): RFPStatus => {
  if (!value) return RFPStatus.DRAFT;
  const normalized = workflowStatusMap[value.toLowerCase()];
  return normalized || (value as RFPStatus) || RFPStatus.DRAFT;
};

const normalizeStage = (payload: any): RFPStage => {
  if (payload.stage && Object.values(RFPStage).includes(payload.stage as RFPStage)) {
    return payload.stage as RFPStage;
  }

  if (payload.status) {
    const mapped = workflowStageMap[payload.status.toLowerCase()];
    if (mapped) {
      return mapped;
    }
  }

  return RFPStage.STAGE_1_TRIAGE;
};

const normalizePriority = (value?: string | null): Priority => {
  if (!value) return Priority.MEDIUM;
  const mapped = priorityMap[value.toLowerCase()];
  return mapped || Priority.MEDIUM;
};

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value as string[];
  }

  if (typeof value === 'string') {
    return value
      .replace('{', '')
      .replace('}', '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeRfp = (raw: any): RFP => {
  const metadata = raw.metadata || {};
  const normalizedStage = normalizeStage(raw);
  const normalizedStatus = normalizeStatus(raw.status);

  return {
    id: raw.id,
    title: raw.title || 'Untitled RFP',
    client: raw.client_name || raw.client || 'Unknown Client',
    status: normalizedStatus,
    stage: normalizedStage,
    submittedAt: raw.submitted_at || raw.created_at || new Date().toISOString(),
    estimatedValue: Number(raw.estimated_value || 0),
    currency: raw.currency || 'USD',
    duration: raw.duration_months ? `${raw.duration_months} months` : 'Not specified',
    submissionDeadline: raw.submission_deadline || raw.submitted_at || new Date().toISOString(),
    createdBy: raw.created_by || metadata.createdBy || 'system',
    assignedTo: metadata.assignedTo || raw.assigned_to || [],
    triage: metadata.triage || raw.triage,
    strategy: metadata.strategy || raw.strategy,
    tags: toArray(raw.tags),
    priority: normalizePriority(raw.priority),
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || new Date().toISOString(),
  };
};

const toApiPayload = (rfp: Partial<RFP> & { client?: string }): Record<string, unknown> => {
  const rfpData = rfp as any;
  const payload: Record<string, unknown> = {
    title: rfpData.title,
    client: rfpData.client,
    clientName: rfpData.client,
    status: rfpData.status?.toLowerCase(),
    priority: rfpData.priority?.toLowerCase(),
    estimatedValue: rfpData.estimatedValue,
    currency: rfpData.currency,
    submissionDeadline: rfpData.submissionDeadline,
    durationMonths: parseDurationMonths(rfpData.duration),
    tags: rfpData.tags,
    metadata: {
      ...(rfpData.metadata || {}),
      triage: rfpData.triage || null,
      strategy: rfpData.strategy || null,
      assignedTo: rfpData.assignedTo || [],
    } as any,
  } as any;

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === null) {
      delete payload[key];
    }
  });

  return payload;
};

export const useRFP = () => {
  const currentRFP = useAppStore((state) => state.currentRFP);
  const setCurrentRFP = useAppStore((state) => state.setCurrentRFP);
  const rfps = useAppStore((state) => state.rfps);
  const setRFPs = useAppStore((state) => state.setRFPs);
  const addRFP = useAppStore((state) => state.addRFP);
  const updateRFPInStore = useAppStore((state) => state.updateRFP);
  const removeRFP = useAppStore((state) => state.removeRFP);
  const setError = useAppStore((state) => state.setError);
  const setIsLoading = useAppStore((state) => state.setIsLoading);

  const getRFPById = useCallback(
    (id: string): RFP | undefined => rfps.find((rfp) => rfp.id === id),
    [rfps]
  );

  const loadRFP = useCallback(
    async (id: string, options: { forceRefresh?: boolean } = {}) => {
      if (!options.forceRefresh) {
        const cached = rfps.find((rfp) => rfp.id === id);
        if (cached) {
          return cached;
        }
      }

      const response = await apiClient.getRFPById(id);
      if (!response) return undefined;
      const normalized = normalizeRfp(response);
      if (rfps.some((rfp) => rfp.id === normalized.id)) {
        updateRFPInStore(normalized.id, normalized);
      } else {
        addRFP(normalized);
      }
      return normalized;
    },
    [rfps, addRFP, updateRFPInStore]
  );

  const fetchRFPs = useCallback(
    async (params?: { page?: number; limit?: number; status?: string }) => {
      setIsLoading(true);
      try {
        const response = await apiClient.getRFPs(params || {});
        const items = Array.isArray(response) ? response : response.items || [];
        const normalized = items.map(normalizeRfp);
        setRFPs(normalized);
        setError(null);
        return normalized;
      } catch (error) {
        console.error('Fetch RFPs failed:', error);
        setError(error instanceof Error ? error.message : 'Failed to load RFPs');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [setRFPs, setError, setIsLoading]
  );

  const createRFP = useCallback(
    async (data: CreateRfpInput): Promise<RFP> => {
      try {
        const payload = toApiPayload({
          ...data,
          status: data.status,
          priority: data.priority,
        } as RFP & { client: string });
        const response = await apiClient.createRFP(payload);
        const normalized = normalizeRfp(response);
        addRFP(normalized);
        setCurrentRFP(normalized);
        return normalized;
      } catch (error) {
        console.error('Create RFP failed:', error);
        throw error;
      }
    },
    [addRFP, setCurrentRFP]
  );

  const editRFP = useCallback(
    async (id: string, updates: UpdateRfpInput) => {
      try {
        const payload = toApiPayload(updates as RFP & { client: string });
        if (updates.clientId) {
          payload.client_id = updates.clientId;
        }
        const response = await apiClient.updateRFP(id, payload);
        const normalized = normalizeRfp(response);
        updateRFPInStore(id, normalized);
        if (currentRFP?.id === id) {
          setCurrentRFP(normalized);
        }
        return normalized;
      } catch (error) {
        console.error('Edit RFP failed:', error);
        throw error;
      }
    },
    [currentRFP, setCurrentRFP, updateRFPInStore]
  );

  const deleteRFP = useCallback(
    async (id: string) => {
      try {
        await apiClient.deleteRFP(id);
        removeRFP(id);
        if (currentRFP?.id === id) {
          setCurrentRFP(null);
        }
      } catch (error) {
        console.error('Delete RFP failed:', error);
        throw error;
      }
    },
    [currentRFP, removeRFP, setCurrentRFP]
  );

  return {
    currentRFP,
    setCurrentRFP,
    rfps,
    getRFPById,
    loadRFP,
    fetchRFPs,
    createRFP,
    editRFP,
    deleteRFP,
  };
};
