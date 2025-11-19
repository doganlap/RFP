// src/services/AnalyticsService.ts

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

class AnalyticsService {
  async getWinLossData(): Promise<WinLossData> {
    try {
      // In production, this would call your API endpoint
      // const response = await fetch('/api/analytics/win-loss');
      // return response.json();

      // Mock data for now
      return Promise.resolve({
        won: [
          { id: 'RFP001', rfpNumber: 'RFP-2025-001', reason: 'Better pricing', value: 150000, date: '2025-01-15' },
          { id: 'RFP003', rfpNumber: 'RFP-2025-003', reason: 'Stronger technical solution', value: 250000, date: '2025-01-20' },
          { id: 'RFP005', rfpNumber: 'RFP-2025-005', reason: 'Existing relationship', value: 180000, date: '2025-02-01' },
        ],
        lost: [
          { id: 'RFP002', rfpNumber: 'RFP-2025-002', reason: 'Incumbent relationship', value: 200000, date: '2025-01-18' },
          { id: 'RFP004', rfpNumber: 'RFP-2025-004', reason: 'Missing key features', value: 320000, date: '2025-01-25' },
          { id: 'RFP006', rfpNumber: 'RFP-2025-006', reason: 'Price objection', value: 145000, date: '2025-02-05' },
        ],
      });
    } catch (error) {
      console.error('Error fetching win/loss data:', error);
      return { won: [], lost: [] };
    }
  }

  async getWinReasons(): Promise<Record<string, number>> {
    try {
      // In production, this would call your API endpoint
      // const response = await fetch('/api/analytics/win-reasons');
      // return response.json();

      const data = await this.getWinLossData();
      const reasons: Record<string, number> = {};

      data.won.forEach((record) => {
        reasons[record.reason] = (reasons[record.reason] || 0) + 1;
      });

      return reasons;
    } catch (error) {
      console.error('Error fetching win reasons:', error);
      return {};
    }
  }

  async getLossReasons(): Promise<Record<string, number>> {
    try {
      // In production, this would call your API endpoint
      // const response = await fetch('/api/analytics/loss-reasons');
      // return response.json();

      const data = await this.getWinLossData();
      const reasons: Record<string, number> = {};

      data.lost.forEach((record) => {
        reasons[record.reason] = (reasons[record.reason] || 0) + 1;
      });

      return reasons;
    } catch (error) {
      console.error('Error fetching loss reasons:', error);
      return {};
    }
  }

  async getWinRateByCategory(category: string): Promise<number> {
    try {
      // In production, this would call your API endpoint
      // const response = await fetch(`/api/analytics/win-rate?category=${category}`);
      // return response.json();

      // Mock calculation
      return 65.5;
    } catch (error) {
      console.error('Error fetching win rate:', error);
      return 0;
    }
  }
}

export default new AnalyticsService();
