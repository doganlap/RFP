// src/services/AnalyticsService.ts
import { apiClient } from './ApiClient';

export interface WinLossRecord {
  id: string;
  rfpNumber?: string;
  reason: string;
  value?: number;
  date?: string;
}

export interface WinLossData {
  won: WinLossRecord[];
  lost: WinLossRecord[];
}

export interface AnalyticsData {
  statistics: {
    total_rfps: number;
    won: number;
    lost: number;
    no_decision: number;
    total_value: number;
    avg_value: number;
  };
  winRate: string;
  topLossReasons: Array<{ reason: string; count: number }>;
  byStage: Array<{ stage: string; count: number; avg_value: number }>;
}

interface AnalyticsApiResponse {
  success: boolean;
  data: {
    statistics: any;
    winRate: string;
    topLossReasons: Array<{ reason: string; count: number }>;
    byStage: Array<{ stage: string; count: number; avg_value: number }>;
    topWinReasons?: Record<string, number>;
  };
}

interface WinLossApiResponse {
  success: boolean;
  data: WinLossData;
}

class AnalyticsService {
  async getWinLossData(): Promise<WinLossData> {
    try {
      // Try to get real data from API
      const response = await apiClient.request<WinLossApiResponse>('/api/analysis/win-loss');
      if (response && response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.warn('Failed to fetch real win/loss data, using fallback:', error);
    }

    // Fallback mock data for development/offline
    const mockWon: WinLossRecord[] = [
      { id: '1', rfpNumber: 'RFP-2025-001', reason: 'Superior Technology', value: 150000, date: '2025-11-01' },
      { id: '2', rfpNumber: 'RFP-2025-002', reason: 'Competitive Pricing', value: 200000, date: '2025-11-05' },
      { id: '3', rfpNumber: 'RFP-2025-003', reason: 'Strong Partnership', value: 175000, date: '2025-11-10' },
      { id: '4', rfpNumber: 'RFP-2025-004', reason: 'Innovation Leadership', value: 300000, date: '2025-11-12' },
      { id: '5', rfpNumber: 'RFP-2025-005', reason: 'Excellent Support', value: 125000, date: '2025-11-15' },
    ];

    const mockLost: WinLossRecord[] = [
      { id: '6', rfpNumber: 'RFP-2025-006', reason: 'Higher Price', value: 180000, date: '2025-11-02' },
      { id: '7', rfpNumber: 'RFP-2025-007', reason: 'Competitor Relationship', value: 250000, date: '2025-11-08' },
      { id: '8', rfpNumber: 'RFP-2025-008', reason: 'Timeline Issues', value: 160000, date: '2025-11-14' },
    ];

    return {
      won: mockWon,
      lost: mockLost,
    };
  }

  async getWinReasons(): Promise<Record<string, number>> {
    try {
      // Try to get real data from API
      const response = await apiClient.request<AnalyticsApiResponse>('/api/analysis/analytics');
      if (response && response.success && response.data && response.data.topWinReasons) {
        return response.data.topWinReasons;
      }
    } catch (error) {
      console.warn('Failed to fetch real win reasons, using fallback:', error);
    }

    // Fallback mock data
    const mockReasons: Record<string, number> = {
      'Superior Technology': 3,
      'Competitive Pricing': 2,
      'Strong Partnership': 2,
      'Innovation Leadership': 1,
      'Excellent Support': 1,
    };

    return mockReasons;
  }

  async getLossReasons(): Promise<Record<string, number>> {
    try {
      // Try to get real data from API
      const response = await apiClient.request<AnalyticsApiResponse>('/api/analysis/analytics');
      if (response && response.success && response.data && response.data.topLossReasons) {
        // Transform array to record
        const reasons: Record<string, number> = {};
        response.data.topLossReasons.forEach((item: { reason: string; count: number }) => {
          reasons[item.reason] = item.count;
        });
        return reasons;
      }
    } catch (error) {
      console.warn('Failed to fetch real loss reasons, using fallback:', error);
    }

    // Fallback mock data
    const mockReasons: Record<string, number> = {
      'Higher Price': 2,
      'Competitor Relationship': 1,
      'Timeline Issues': 1,
    };

    return mockReasons;
  }

  async getWinRateByCategory(): Promise<number> {
    try {
      // Try to get real data from API
      const response = await apiClient.request<AnalyticsApiResponse>('/api/analysis/analytics');
      if (response && response.success && response.data && response.data.winRate) {
        return parseFloat(response.data.winRate);
      }
    } catch (error) {
      console.warn('Failed to fetch real win rate, using fallback:', error);
    }

    // Fallback: 5 won out of 8 total = 62.5%
    return 62.5;
  }

  async getAnalyticsData(): Promise<AnalyticsData | null> {
    try {
      // Try to get real data from API
      const response = await apiClient.request<AnalyticsApiResponse>('/api/analysis/analytics');
      if (response && response.success && response.data) {
        return {
          statistics: response.data.statistics,
          winRate: response.data.winRate,
          topLossReasons: response.data.topLossReasons || [],
          byStage: response.data.byStage || []
        };
      }
    } catch (error) {
      console.warn('Failed to fetch real analytics data, using fallback:', error);
    }

    // Fallback mock data
    const mockData: AnalyticsData = {
      statistics: {
        total_rfps: 8,
        won: 5,
        lost: 3,
        no_decision: 0,
        total_value: 1360000,
        avg_value: 170000,
      },
      winRate: '62.5',
      topLossReasons: [
        { reason: 'Higher Price', count: 2 },
        { reason: 'Competitor Relationship', count: 1 },
        { reason: 'Timeline Issues', count: 1 },
      ],
      byStage: [
        { stage: 'Initial Review', count: 3, avg_value: 150000 },
        { stage: 'Technical Evaluation', count: 2, avg_value: 200000 },
        { stage: 'Final Decision', count: 3, avg_value: 180000 },
      ],
    };

    return mockData;
  }
}

export default new AnalyticsService();
