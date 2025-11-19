/**
 * Enterprise Route Configuration
 */

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  RFP: {
    LIST: '/rfps',
    DETAIL: '/rfps/:id',
    CREATE: '/rfps/new',
    EDIT: '/rfps/:id/edit',
    COLLABORATION: '/rfps/:id/collaboration',
    WIN_LOSS: '/rfps/:id/win-loss',
  },
  STAGE: {
    TRIAGE: '/rfps/:id/stage/triage',
    BUSINESS_REVIEW: '/rfps/:id/stage/business-review',
    SME_QUALIFICATION: '/rfps/:id/stage/sme-qualification',
    PROPOSAL: '/rfps/:id/stage/proposal',
    SUBMISSION: '/rfps/:id/stage/submission',
  },
  SME: {
    LEGAL: '/rfps/:id/sme/legal',
    FINANCE: '/rfps/:id/sme/finance',
    TECH: '/rfps/:id/sme/tech',
  },
  SME_GENERAL: {
    LEGAL: '/sme/legal',
    FINANCE: '/sme/finance',
    TECH: '/sme/tech',
  },
  TEAM: '/team',
  SETTINGS: {
    ROOT: '/settings',
    PROFILE: '/settings/profile',
    TEAM: '/settings/team',
    INTEGRATIONS: '/settings/integrations',
  },
  ANALYSIS: {
    WIN_LOSS: '/analysis/win-loss',
  },
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },
  ERROR: {
    NOT_FOUND: '/404',
    SERVER_ERROR: '/500',
    UNAUTHORIZED: '/401',
  },
} as const;

export const getRoute = (path: string, params?: Record<string, string>): string => {
  let route = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      route = route.replace(`:${key}`, value);
    });
  }
  return route;
};
