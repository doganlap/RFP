import React, { useState, useEffect } from 'react';
import AnalyticsService from '../services/AnalyticsService';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const { t } = useTranslation();

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
    return <div className="p-4">{t('loading_win_loss_analysis')}</div>;
  }

  const totalRFPs = (data?.won.length || 0) + (data?.lost.length || 0);
  const winRate = totalRFPs > 0 ? ((data?.won.length || 0) / totalRFPs * 100).toFixed(2) : '0';

  // Prepare chart data
  const pieData = [
    { name: t('won'), value: data?.won.length || 0, color: '#10B981' },
    { name: t('lost'), value: data?.lost.length || 0, color: '#EF4444' }
  ];

  // Count reasons for bar chart
  const countReasons = (items: WinLossRecord[]) => {
    const counts: { [key: string]: number } = {};
    items.forEach(item => {
      counts[item.reason] = (counts[item.reason] || 0) + 1;
    });
    return Object.entries(counts).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  };

  const wonReasons = countReasons(data?.won || []);
  const lostReasons = countReasons(data?.lost || []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">{t('win_loss_analysis')}</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">{t('total_rfps')}</p>
          <p className="text-2xl font-bold text-blue-600">{totalRFPs}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">{t('won')}</p>
          <p className="text-2xl font-bold text-green-600">{data?.won.length || 0}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-gray-600">{t('lost')}</p>
          <p className="text-2xl font-bold text-red-600">{data?.lost.length || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600">{t('win_rate')}</p>
          <p className="text-2xl font-bold text-purple-600">{winRate}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-4 py-2 font-medium ${selectedTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          {t('overview')}
        </button>
        <button
          onClick={() => setSelectedTab('won')}
          className={`px-4 py-2 font-medium ${selectedTab === 'won' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
        >
          {t('won_deals')}
        </button>
        <button
          onClick={() => setSelectedTab('lost')}
          className={`px-4 py-2 font-medium ${selectedTab === 'lost' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-600'}`}
        >
          {t('lost_deals')}
        </button>
      </div>

      {/* Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Win/Loss Distribution Pie Chart */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{t('win_loss_distribution')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Win Reasons Bar Chart */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{t('top_win_reasons')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={wonReasons}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="reason" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Top Loss Reasons Bar Chart */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{t('top_loss_reasons')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lostReasons}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="reason" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Key Insights */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{t('key_insights')}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <span className="text-sm font-medium">{t('win_rate')}</span>
                  <span className="text-lg font-bold text-green-600">{winRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                  <span className="text-sm font-medium">{t('total_rfps')}</span>
                  <span className="text-lg font-bold text-blue-600">{totalRFPs}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                  <span className="text-sm font-medium">{t('avg_deal_value')}</span>
                  <span className="text-lg font-bold text-purple-600">$125K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'won' && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-4">{t('won_opportunities')}</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">{t('rfp_id')}</th>
                <th className="px-4 py-2 text-left text-sm font-medium">{t('reason')}</th>
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
          <h3 className="font-semibold mb-4">{t('lost_opportunities')}</h3>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">{t('rfp_id')}</th>
                <th className="px-4 py-2 text-left text-sm font-medium">{t('reason')}</th>
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
