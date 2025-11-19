// src/services/AnalyticsService.ts
import { apiClient as ApiClient } from './ApiClient';

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

class AnalyticsService {
  async getWinLossData(): Promise<WinLossData> {
    try {
      // Fetch real data from API
      const analytics = await ApiClient.getAnalytics() as any;

      if (!analytics || !analytics.data) {
        return { won: [], lost: [] };
      }

      const data = analytics.data;

      // Transform API response to WinLossData format
      // In a real scenario, the API would return this directly
      // For now, we construct it from the analytics data
      return {
        won: [], // These would come from the rfp/win-loss endpoint
        lost: (data.topLossReasons || []).map((item: any, idx: number) => ({
          id: `loss-${idx}`,
          reason: item.reason,
          value: 0,
          date: new Date().toISOString().split('T')[0],
        })),
      };
    } catch (error) {
      console.error('Error fetching win/loss data:', error);
      return { won: [], lost: [] };
    }
  }

  async getWinReasons(): Promise<Record<string, number>> {
    try {
      // Fetch from the dedicated win-loss analysis endpoint
      const response = await ApiClient.getWinLossAnalysis() as any;

      if (!response || !response.data) {
        return {};
      }

      const reasons: Record<string, number> = {};

      // Process won records
      if (Array.isArray(response.data.won)) {
        response.data.won.forEach((record: any) => {
          reasons[record.reason] = (reasons[record.reason] || 0) + 1;
        });
      }

      return reasons;
    } catch (error) {
      console.error('Error fetching win reasons:', error);
      return {};
    }
  }

  async getLossReasons(): Promise<Record<string, number>> {
    try {
      // Fetch analytics data which includes top loss reasons
      const response = await ApiClient.getAnalytics() as any;

      if (!response || !response.data) {
        return {};
      }

      const reasons: Record<string, number> = {};

      // Process top loss reasons from analytics
      if (Array.isArray(response.data.topLossReasons)) {
        response.data.topLossReasons.forEach((item: any) => {
          reasons[item.reason] = item.count;
        });
      }

      return reasons;
    } catch (error) {
      console.error('Error fetching loss reasons:', error);
      return {};
    }
  }

  async getWinRateByCategory(category: string): Promise<number> {
    try {
      // Fetch analytics data which includes overall win rate
      const response = await ApiClient.getAnalytics() as any;

      if (!response || !response.data) {
        return 0;
      }

      // Return the win rate percentage as a number (e.g., 65.43 for 65.43%)
      return parseFloat(response.data.winRate || '0');
    } catch (error) {
      console.error('Error fetching win rate:', error);
      return 0;
    }
  }

  async getAnalyticsData(): Promise<AnalyticsData | null> {
    try {
      // Fetch complete analytics data from API
      const response = await ApiClient.getAnalytics() as any;

      if (!response || !response.data) {
        return null;
      }

      return response.data as AnalyticsData;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return null;
    }
  }
}

export default new AnalyticsService();
