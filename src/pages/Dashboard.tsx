import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Award,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface KPIData {
  label: string;
  value: string;
  change: number;
  target: string;
  progress: number;
  trend: 'up' | 'down';
}

interface TimeAnalytics {
  period: string;
  rfpsSubmitted: number;
  rfpsWon: number;
  winRate: number;
  revenue: string;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<'yearly' | 'quarterly' | 'monthly'>('quarterly');

  const kpis: KPIData[] = [
    {
      label: 'Win Rate',
      value: '68%',
      change: 12,
      target: '70%',
      progress: 97,
      trend: 'up'
    },
    {
      label: 'Active RFPs',
      value: '24',
      change: -5,
      target: '30',
      progress: 80,
      trend: 'down'
    },
    {
      label: 'Revenue (YTD)',
      value: '$2.4M',
      change: 18,
      target: '$3M',
      progress: 80,
      trend: 'up'
    },
    {
      label: 'Avg Response Time',
      value: '4.2 days',
      change: -15,
      target: '5 days',
      progress: 84,
      trend: 'up'
    }
  ];

  const timeAnalytics: Record<string, TimeAnalytics[]> = {
    yearly: [
      { period: '2024', rfpsSubmitted: 156, rfpsWon: 98, winRate: 63, revenue: '$2.4M' },
      { period: '2023', rfpsSubmitted: 142, rfpsWon: 85, winRate: 60, revenue: '$2.1M' },
      { period: '2022', rfpsSubmitted: 128, rfpsWon: 76, winRate: 59, revenue: '$1.8M' }
    ],
    quarterly: [
      { period: 'Q4 2024', rfpsSubmitted: 42, rfpsWon: 29, winRate: 69, revenue: '$680K' },
      { period: 'Q3 2024', rfpsSubmitted: 38, rfpsWon: 25, winRate: 66, revenue: '$590K' },
      { period: 'Q2 2024', rfpsSubmitted: 40, rfpsWon: 26, winRate: 65, revenue: '$620K' },
      { period: 'Q1 2024', rfpsSubmitted: 36, rfpsWon: 18, winRate: 50, revenue: '$510K' }
    ],
    monthly: [
      { period: 'Nov 2024', rfpsSubmitted: 15, rfpsWon: 11, winRate: 73, revenue: '$245K' },
      { period: 'Oct 2024', rfpsSubmitted: 14, rfpsWon: 10, winRate: 71, revenue: '$225K' },
      { period: 'Sep 2024', rfpsSubmitted: 13, rfpsWon: 8, winRate: 62, revenue: '$210K' }
    ]
  };

  const agencyTargets = [
    { name: 'Quarterly Revenue', current: '$680K', target: '$750K', progress: 91 },
    { name: 'Win Rate', current: '68%', target: '70%', progress: 97 },
    { name: 'Client Satisfaction', current: '4.6/5', target: '4.8/5', progress: 96 },
    { name: 'Response Time', current: '4.2 days', target: '3.5 days', progress: 83 }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Platform Badge */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('dashboard')}
            </h1>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full">
              {t('app_title')}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time performance metrics and agency targets
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">Current Period</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Q4 2024</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {kpi.label}
              </span>
              {kpi.trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {kpi.value}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`flex items-center ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </span>
                <span className="text-gray-500">Target: {kpi.target}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    kpi.progress >= 90 ? 'bg-green-500' : kpi.progress >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${kpi.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Agency Targets Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Agency Targets
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agencyTargets.map((target, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{target.name}</span>
                <span className="text-sm text-gray-500">
                  {target.current} / {target.target}
                </span>
              </div>
              <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`absolute h-3 rounded-full transition-all ${
                    target.progress >= 95
                      ? 'bg-green-500'
                      : target.progress >= 85
                      ? 'bg-blue-500'
                      : 'bg-yellow-500'
                  }`}
                  style={{ width: `${target.progress}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {target.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Analytics Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Time Analytics
            </h2>
          </div>
          <div className="flex gap-2">
            {(['yearly', 'quarterly', 'monthly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Period
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  RFPs Submitted
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  RFPs Won
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Win Rate
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {timeAnalytics[selectedPeriod].map((data, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {data.period}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {data.rfpsSubmitted}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {data.rfpsWon}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        data.winRate >= 65
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : data.winRate >= 55
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {data.winRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {data.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8" />
            <span className="text-2xl font-bold">98</span>
          </div>
          <div className="text-blue-100">Total RFPs Won This Year</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8" />
            <span className="text-2xl font-bold">24</span>
          </div>
          <div className="text-purple-100">Active RFPs In Progress</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8" />
            <span className="text-2xl font-bold">4.6</span>
          </div>
          <div className="text-green-100">Avg Client Satisfaction</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
