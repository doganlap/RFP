export interface RFP {
  id: number;
  name: string;
  deadline?: string;
  document_url?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ParsedRFP {
  sections: Record<string, string>;
  evaluationCriteria: Array<{criterion: string; weight: number}>;
  metadata: Record<string, any>;
}

export interface ValidationResult {
  layers: {
    format_ok: boolean;
    schema_ok: boolean;
    business_rules_ok: boolean;
    cross_ref_ok?: boolean;
    ai_review_ok?: boolean;
  };
  issues: string[];
}

export interface ScoreResult {
  fit: number;
  complexity: number;
  competitive: number;
  total: number;
}

export interface DecisionResult {
  decision: 'BID'|'NO_BID'|'REVIEW';
  rationale: string;
}
