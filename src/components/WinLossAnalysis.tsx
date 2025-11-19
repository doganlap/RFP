import React, { useState, useEffect } from 'react';
import AnalyticsService from '../services/AnalyticsService';

interface WinLossRecord {
  id: string;
  reason: string;
  rfpNumber?: string;
  value?: number;
  date?: string;
}

interface WinLossData {
  won: WinLossRecord[];
  lost: WinLossRecord[];
}

const WinLossAnalysis: React.FC = () => {
  const [data, setData] = useState<WinLossData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'won' | 'lost'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await AnalyticsService.getWinLossData();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch win/loss data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading win/loss analysis...</div>;
  }

  const totalRFPs = (data?.won.length || 0) + (data?.lost.length || 0);
  const winRate = totalRFPs > 0 ? ((data?.won.length || 0) / totalRFPs * 100).toFixed(2) : '0';

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Win/Loss Analysis</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Total RFPs</p>
          <p className="text-2xl font-bold text-blue-600">{totalRFPs}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Won</p>
          <p className="text-2xl font-bold text-green-600">{data?.won.length || 0}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600">Lost</p>
          <p className="text-2xl font-bold text-red-600">{data?.lost.length || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600">Win Rate</p>
          <p className="text-2xl font-bold text-purple-600">{winRate}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-4 py-2 font-medium ${selectedTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab('won')}
          className={`px-4 py-2 font-medium ${selectedTab === 'won' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
        >
          Won Deals
        </button>
        <button
          onClick={() => setSelectedTab('lost')}
          className={`px-4 py-2 font-medium ${selectedTab === 'lost' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
        >
          Lost Deals
        </button>
      </div>

      {/* Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Key Insights</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Top Win Reasons</h4>
              <ul className="space-y-1 text-sm">
                {data?.won.slice(0, 3).map((item) => (
                  <li key={item.id} className="text-gray-700">• {item.reason}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Top Loss Reasons</h4>
              <ul className="space-y-1 text-sm">
                {data?.lost.slice(0, 3).map((item) => (
                  <li key={item.id} className="text-gray-700">• {item.reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'won' && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-4">Won Opportunities</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">RFP ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {data?.won.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{item.id}</td>
                  <td className="px-4 py-2 text-sm">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTab === 'lost' && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-4">Lost Opportunities</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">RFP ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {data?.lost.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{item.id}</td>
                  <td className="px-4 py-2 text-sm">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WinLossAnalysis;
