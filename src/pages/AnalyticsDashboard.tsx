import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Plot from 'react-plotly.js';
import PivotTable from '../components/analytics/PivotTable';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Calendar,
  DollarSign,
  Users,
  Target,
  Clock,
  Award,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  Search,
  FileText
} from 'lucide-react';
import { cn } from '../utils/cn';

// Mock data for RFP lifecycle analytics
const generateRFPAnalyticsData = () => {
  const departments = ['Engineering', 'Sales', 'Legal', 'Finance', 'Marketing', 'Operations'];
  const statuses = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Awarded', 'Cancelled'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const quarters = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'];

  const data = [];

  for (let i = 0; i < 200; i++) {
    data.push({
      id: `RFP-${String(i + 1).padStart(3, '0')}`,
      title: `Technology Implementation Project ${i + 1}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      value: Math.floor(Math.random() * 5000000) + 50000,
      submittedDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      deadline: new Date(2024, Math.floor(Math.random() * 12) + 1, Math.floor(Math.random() * 28) + 1),
      responseTime: Math.floor(Math.random() * 45) + 1,
      winRate: Math.random() > 0.6 ? 'Won' : 'Lost',
      quarter: quarters[Math.floor(Math.random() * quarters.length)],
      region: ['North America', 'Europe', 'Asia Pacific', 'Middle East'][Math.floor(Math.random() * 4)],
      clientType: ['Enterprise', 'Mid-Market', 'SMB'][Math.floor(Math.random() * 3)],
      complexity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      teamSize: Math.floor(Math.random() * 8) + 2,
      budget: Math.floor(Math.random() * 200000) + 10000,
      estimatedHours: Math.floor(Math.random() * 2000) + 100,
    });
  }

  return data;
};

const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [rfpData, setRfpData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('All Time');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedMetric, setSelectedMetric] = useState('value');
  const [activeTab, setActiveTab] = useState('overview');
  const [globalSearch, setGlobalSearch] = useState('');
  const [sortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRfpData(generateRFPAnalyticsData());
      setLoading(false);
    }, 1000);
  }, []);

  const filteredData = useMemo(() => {
    let filtered = rfpData;

    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(item => item.department === selectedDepartment);
    }

    if (selectedTimeframe !== 'All Time') {
      const now = new Date();
      const monthsBack = selectedTimeframe === 'Last 3 Months' ? 3 :
                        selectedTimeframe === 'Last 6 Months' ? 6 : 12;
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, now.getDate());
      filtered = filtered.filter(item => item.submittedDate >= cutoffDate);
    }

    if (globalSearch) {
      const searchLower = globalSearch.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.department.toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower) ||
        item.priority.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting if configured
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [rfpData, selectedDepartment, selectedTimeframe, globalSearch, sortConfig]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalValue = filteredData.reduce((sum, item) => sum + item.value, 0);
    const totalRFPs = filteredData.length;
    const wonRFPs = filteredData.filter(item => item.winRate === 'Won').length;
    const winRate = totalRFPs > 0 ? (wonRFPs / totalRFPs) * 100 : 0;
    const avgResponseTime = filteredData.reduce((sum, item) => sum + item.responseTime, 0) / totalRFPs || 0;
    const activeRFPs = filteredData.filter(item => ['Draft', 'Submitted', 'Under Review'].includes(item.status)).length;
    const avgValue = totalValue / totalRFPs || 0;
    const totalBudget = filteredData.reduce((sum, item) => sum + item.budget, 0);
    const avgTeamSize = filteredData.reduce((sum, item) => sum + item.teamSize, 0) / totalRFPs || 0;
    const criticalRFPs = filteredData.filter(item => item.priority === 'Critical').length;
    const overdueRFPs = filteredData.filter(item => item.deadline < new Date()).length;

    return {
      totalValue,
      totalRFPs,
      winRate,
      avgResponseTime,
      activeRFPs,
      avgValue,
      totalBudget,
      avgTeamSize,
      criticalRFPs,
      overdueRFPs
    };
  }, [filteredData]);

  // Chart Data Preparation
  const statusDistribution = useMemo(() => {
    const statusCounts = filteredData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts),
      values: Object.values(statusCounts),
      type: 'pie' as const,
      name: 'Status Distribution',
      marker: {
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']
      }
    };
  }, [filteredData]);

  const departmentPerformance = useMemo(() => {
    const deptData = filteredData.reduce((acc, item) => {
      if (!acc[item.department]) {
        acc[item.department] = { total: 0, won: 0, value: 0 };
      }
      acc[item.department].total += 1;
      acc[item.department].value += item.value;
      if (item.winRate === 'Won') {
        acc[item.department].won += 1;
      }
      return acc;
    }, {});

    return Object.entries(deptData).map(([dept, data]: [string, any]) => ({
      department: dept,
      winRate: (data.won / data.total) * 100,
      totalValue: data.value,
      totalRFPs: data.total
    }));
  }, [filteredData]);

  const timelineData = useMemo(() => {
    const monthlyData = filteredData.reduce((acc, item) => {
      const month = item.submittedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!acc[month]) {
        acc[month] = { count: 0, value: 0, won: 0 };
      }
      acc[month].count += 1;
      acc[month].value += item.value;
      if (item.winRate === 'Won') {
        acc[month].won += 1;
      }
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return {
      x: sortedMonths,
      y: sortedMonths.map(month => monthlyData[month].count),
      type: 'scatter' as const,
      mode: 'lines+markers',
      name: 'RFP Count',
      line: { color: '#3B82F6' }
    };
  }, [filteredData]);

  const priorityAnalysis = useMemo(() => {
    const priorityData = filteredData.reduce((acc, item) => {
      if (!acc[item.priority]) {
        acc[item.priority] = { count: 0, value: 0 };
      }
      acc[item.priority].count += 1;
      acc[item.priority].value += item.value;
      return acc;
    }, {});

    return Object.entries(priorityData).map(([priority, data]: [string, any]) => ({
      priority,
      count: data.count,
      avgValue: data.value / data.count
    }));
  }, [filteredData]);

  // Advanced Animated Charts Data
  const animatedBarData = useMemo(() => {
    const departmentData = filteredData.reduce((acc, item) => {
      if (!acc[item.department]) {
        acc[item.department] = { total: 0, won: 0, lost: 0 };
      }
      acc[item.department].total += 1;
      if (item.winRate === 'Won') {
        acc[item.department].won += 1;
      } else {
        acc[item.department].lost += 1;
      }
      return acc;
    }, {});

    const departments = Object.keys(departmentData);
    const wonData = departments.map(dept => departmentData[dept].won);
    const lostData = departments.map(dept => departmentData[dept].lost);

    return [
      {
        x: departments,
        y: wonData,
        type: 'bar' as const,
        name: 'Won',
        marker: { color: '#10B981' },
        animation: {
          duration: 1000,
          easing: 'cubic-in-out'
        }
      },
      {
        x: departments,
        y: lostData,
        type: 'bar' as const,
        name: 'Lost',
        marker: { color: '#EF4444' },
        animation: {
          duration: 1000,
          easing: 'cubic-in-out'
        }
      }
    ];
  }, [filteredData]);

  const animatedLineData = useMemo(() => {
    const monthlyTrends = filteredData.reduce((acc, item) => {
      const month = item.submittedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { count: 0, value: 0 };
      }
      acc[month].count += 1;
      acc[month].value += item.value;
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyTrends).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return [{
      x: sortedMonths,
      y: sortedMonths.map(month => monthlyTrends[month].count),
      type: 'scatter' as const,
      mode: 'lines+markers',
      name: 'RFP Count',
      line: {
        color: '#3B82F6',
        width: 3,
        shape: 'spline'
      },
      marker: {
        size: 8,
        color: '#3B82F6'
      },
      animation: {
        duration: 2000,
        easing: 'cubic-in-out'
      }
    }];
  }, [filteredData]);

  const animatedScatterData = useMemo(() => {
    return [{
      x: filteredData.map(item => item.responseTime),
      y: filteredData.map(item => item.value),
      mode: 'markers',
      type: 'scatter' as const,
      name: 'Response Time vs Value',
      marker: {
        size: filteredData.map(item => Math.max(8, Math.min(20, item.teamSize * 2))),
        color: filteredData.map(item => item.winRate === 'Won' ? '#10B981' : '#EF4444'),
        opacity: 0.7,
        line: {
          width: 1,
          color: '#ffffff'
        }
      },
      animation: {
        duration: 1500,
        easing: 'elastic-in-out'
      },
      text: filteredData.map(item => `${item.title}<br>Response Time: ${item.responseTime} days<br>Value: $${item.value.toLocaleString()}`)
    }];
  }, [filteredData]);

  const animatedPieData = useMemo(() => {
    const regionData = filteredData.reduce((acc, item) => {
      if (!acc[item.region]) {
        acc[item.region] = 0;
      }
      acc[item.region] += item.value;
      return acc;
    }, {});

    const regions = Object.keys(regionData);
    const values = Object.values(regionData);

    return [{
      labels: regions,
      values: values,
      type: 'pie' as const,
      name: 'Regional Distribution',
      marker: {
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
      },
      animation: {
        duration: 1200,
        easing: 'cubic-in-out'
      },
      textinfo: 'label+percent',
      textposition: 'outside',
      hovertemplate: '%{label}<br>$%{value:,.0f}<br>%{percent}<extra></extra>'
    }];
  }, [filteredData]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
          </div>
          {t('analytics_dashboard')}
        </h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            {t('export_data')}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            {t('refresh')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{t('filters')}:</span>
          </div>

          {/* Global Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder={t('search_rfps') || 'Search RFPs...'}
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            title={t('select_timeframe')}
          >
            <option>{t('all_time')}</option>
            <option>{t('last_3_months')}</option>
            <option>{t('last_6_months')}</option>
            <option>{t('last_12_months')}</option>
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            title={t('select_department')}
          >
            <option>{t('all_departments')}</option>
            <option>Engineering</option>
            <option>Sales</option>
            <option>Legal</option>
            <option>Finance</option>
            <option>Marketing</option>
            <option>Operations</option>
          </select>

          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="value">{t('total_value')}</option>
            <option value="count">{t('rfp_count')}</option>
            <option value="winRate">{t('win_rate')}</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">{t('total_rfps')}</p>
              <p className="text-2xl font-bold text-blue-800">{kpis.totalRFPs}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">{t('win_rate')}</p>
              <p className="text-2xl font-bold text-green-800">{kpis.winRate.toFixed(1)}%</p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">{t('total_value')}</p>
              <p className="text-2xl font-bold text-purple-800">${kpis.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">{t('avg_response_time')}</p>
              <p className="text-2xl font-bold text-orange-800">{kpis.avgResponseTime.toFixed(1)} days</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">{t('active_rfps')}</p>
              <p className="text-2xl font-bold text-indigo-800">{kpis.activeRFPs}</p>
            </div>
            <Activity className="w-8 h-8 text-indigo-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">{t('critical_rfps')}</p>
              <p className="text-2xl font-bold text-red-800">{kpis.criticalRFPs}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'overview', label: t('overview'), icon: BarChart3 },
          { id: 'lifecycle', label: t('rfp_lifecycle'), icon: Activity },
          { id: 'performance', label: t('performance'), icon: TrendingUp },
          { id: 'pivot', label: t('pivot_analysis'), icon: Target },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all whitespace-nowrap min-w-max',
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Status Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              {t('status_distribution')}
            </h3>
            <Plot
              data={[statusDistribution]}
              layout={{
                height: 400,
                margin: { t: 0, b: 0, l: 0, r: 0 },
                showlegend: true,
                legend: { orientation: 'h', y: -0.1 }
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>

          {/* Timeline Chart */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t('rfp_timeline')}
            </h3>
            <Plot
              data={[timelineData]}
              layout={{
                height: 400,
                margin: { t: 0, b: 40, l: 40, r: 20 },
                xaxis: { title: 'Month' },
                yaxis: { title: 'Number of RFPs' }
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>

          {/* Department Performance Bar Chart */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('department_performance')}
            </h3>
            <Plot
              data={[{
                type: 'bar',
                x: departmentPerformance.map(d => d.department),
                y: departmentPerformance.map(d => d.winRate),
                marker: { color: '#3B82F6' },
                name: 'Win Rate %'
              }]}
              layout={{
                height: 400,
                margin: { t: 0, b: 60, l: 40, r: 20 },
                xaxis: { title: 'Department' },
                yaxis: { title: 'Win Rate (%)' }
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>

          {/* Priority Analysis */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              {t('priority_analysis')}
            </h3>
            <Plot
              data={[{
                type: 'bar',
                x: priorityAnalysis.map(p => p.priority),
                y: priorityAnalysis.map(p => p.count),
                marker: {
                  color: ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
                },
                name: 'RFP Count'
              }]}
              layout={{
                height: 400,
                margin: { t: 0, b: 60, l: 40, r: 20 },
                xaxis: { title: 'Priority' },
                yaxis: { title: 'Number of RFPs' }
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>
        </div>
      )}

      {activeTab === 'lifecycle' && (
        <div className="space-y-6">
          {/* Animated Department Performance Bar Chart */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Animated Department Performance
            </h3>
            <Plot
              data={animatedBarData}
              layout={{
                height: 400,
                margin: { t: 20, b: 60, l: 40, r: 20 },
                xaxis: { title: 'Department' },
                yaxis: { title: 'Number of RFPs' },
                barmode: 'stack',
                showlegend: true,
                updatemenus: [{
                  type: 'buttons',
                  buttons: [{
                    method: 'animate',
                    args: [null, {
                      mode: 'immediate',
                      frame: { duration: 500, redraw: true },
                      fromcurrent: true,
                      transition: { duration: 300 }
                    }],
                    label: 'Play Animation'
                  }]
                }]
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>

          {/* Animated Timeline Line Chart */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Animated RFP Timeline
            </h3>
            <Plot
              data={animatedLineData}
              layout={{
                height: 400,
                margin: { t: 20, b: 60, l: 60, r: 20 },
                xaxis: { title: 'Month' },
                yaxis: { title: 'Number of RFPs' },
                showlegend: false,
                updatemenus: [{
                  type: 'buttons',
                  buttons: [{
                    method: 'animate',
                    args: [null, {
                      mode: 'immediate',
                      frame: { duration: 800, redraw: true },
                      fromcurrent: true,
                      transition: { duration: 500, easing: 'cubic-in-out' }
                    }],
                    label: 'Animate Timeline'
                  }]
                }]
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>

          {/* Animated Scatter Plot */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Animated Response Time vs Value
            </h3>
            <Plot
              data={animatedScatterData}
              layout={{
                height: 400,
                margin: { t: 20, b: 60, l: 60, r: 20 },
                xaxis: { title: 'Response Time (days)' },
                yaxis: { title: 'RFP Value ($)' },
                hovermode: 'closest',
                updatemenus: [{
                  type: 'buttons',
                  buttons: [{
                    method: 'animate',
                    args: [null, {
                      mode: 'immediate',
                      frame: { duration: 1000, redraw: true },
                      fromcurrent: true,
                      transition: { duration: 600, easing: 'elastic-in-out' }
                    }],
                    label: 'Animate Scatter'
                  }]
                }]
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>

          {/* Animated Regional Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Animated Regional Distribution
            </h3>
            <Plot
              data={animatedPieData}
              layout={{
                height: 400,
                margin: { t: 20, b: 20, l: 20, r: 20 },
                showlegend: true,
                legend: { orientation: 'h', y: -0.2 },
                updatemenus: [{
                  type: 'buttons',
                  buttons: [{
                    method: 'animate',
                    args: [null, {
                      mode: 'immediate',
                      frame: { duration: 1200, redraw: true },
                      fromcurrent: true,
                      transition: { duration: 400, easing: 'cubic-in-out' }
                    }],
                    label: 'Animate Pie'
                  }]
                }]
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Win Rate by Region */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              {t('win_rate_by_region')}
            </h3>
            <Plot
              data={[{
                type: 'bar',
                x: ['North America', 'Europe', 'Asia Pacific', 'Middle East'],
                y: [75, 68, 82, 71],
                marker: { color: '#10B981' },
                name: 'Win Rate %'
              }]}
              layout={{
                height: 400,
                margin: { t: 0, b: 60, l: 40, r: 20 },
                xaxis: { title: 'Region' },
                yaxis: { title: 'Win Rate (%)' }
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>

          {/* Response Time Distribution */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t('response_time_distribution')}
            </h3>
            <Plot
              data={[{
                type: 'histogram',
                x: filteredData.map(item => item.responseTime),
                nbinsx: 20,
                marker: { color: '#F59E0B' },
                name: 'Response Time'
              }]}
              layout={{
                height: 400,
                margin: { t: 0, b: 60, l: 40, r: 20 },
                xaxis: { title: 'Response Time (days)' },
                yaxis: { title: 'Frequency' }
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>

          {/* Budget vs Actual Performance */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {t('budget_vs_performance')}
            </h3>
            <Plot
              data={[{
                type: 'scatter',
                mode: 'markers',
                x: filteredData.map(item => item.budget),
                y: filteredData.map(item => item.value),
                marker: {
                  size: 8,
                  color: filteredData.map(item => item.winRate === 'Won' ? '#10B981' : '#EF4444')
                },
                name: 'Budget vs Value'
              }]}
              layout={{
                height: 400,
                margin: { t: 0, b: 60, l: 60, r: 20 },
                xaxis: { title: 'Budget ($)' },
                yaxis: { title: 'RFP Value ($)' }
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>

          {/* Complexity vs Success Rate */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t('complexity_vs_success')}
            </h3>
            <Plot
              data={[{
                type: 'bar',
                x: ['Low', 'Medium', 'High'],
                y: [85, 72, 45],
                marker: { color: '#8B5CF6' },
                name: 'Success Rate %'
              }]}
              layout={{
                height: 400,
                margin: { t: 0, b: 60, l: 40, r: 20 },
                xaxis: { title: 'Complexity' },
                yaxis: { title: 'Success Rate (%)' }
              }}
              config={{ responsive: true }}
              className="w-full"
            />
          </div>
        </div>
      )}

      {activeTab === 'pivot' && (
        <div className="space-y-6">
          <PivotTable
            data={filteredData}
            title={t('interactive_pivot_analysis')}
          />
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
