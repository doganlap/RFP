import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/ApiClient';
import { DollarSign, Edit, CheckCircle, TrendingUp, Calculator, PieChart, BarChart3 } from 'lucide-react';
import { cn } from '../utils/cn';

interface RFP {
  id: string;
  title: string;
  status: string;
  financeReview?: string;
  value?: number;
  client?: string;
  estimatedCost?: number;
  projectedRevenue?: number;
}

const FinanceReview: React.FC = () => {
  const { t } = useTranslation();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'budget' | 'roi'>('overview');

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      const data = await apiClient.getRFPs();
      // Mock additional financial data
      const rfpArray = Array.isArray(data) ? data : data.items || [];
      const enhancedData = rfpArray.map((rfp: RFP) => ({
        ...rfp,
        value: rfp.value || Math.floor(Math.random() * 500000) + 50000,
        estimatedCost: Math.floor(Math.random() * 200000) + 30000,
        projectedRevenue: Math.floor(Math.random() * 800000) + 100000,
      }));
      setRfps(enhancedData);
    } catch (error) {
      console.error('Failed to load RFPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedRFP) return;
    try {
      await apiClient.updateRFP(selectedRFP.id, { financeReview: reviewText });
      await loadRFPs();
      setSelectedRFP(null);
      setReviewText('');
    } catch (error) {
      console.error('Failed to save review:', error);
    }
  };

  const calculateROI = (revenue: number, cost: number) => {
    return cost > 0 ? ((revenue - cost) / cost * 100).toFixed(1) : '0';
  };

  const totalValue = rfps.reduce((sum, rfp) => sum + (rfp.value || 0), 0);
  const totalCost = rfps.reduce((sum, rfp) => sum + (rfp.estimatedCost || 0), 0);
  const totalRevenue = rfps.reduce((sum, rfp) => sum + (rfp.projectedRevenue || 0), 0);
  const avgROI = rfps.length > 0 ? rfps.reduce((sum, rfp) => sum + parseFloat(calculateROI(rfp.projectedRevenue || 0, rfp.estimatedCost || 0)), 0) / rfps.length : 0;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
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
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          {t('finance_review')}
        </h1>
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            {t('financial_calculator')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">{t('total_contract_value')}</p>
              <p className="text-2xl font-bold text-green-800">${totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">{t('total_cost')}</p>
              <p className="text-2xl font-bold text-blue-800">${totalCost.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">{t('projected_revenue')}</p>
              <p className="text-2xl font-bold text-purple-800">${totalRevenue.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">{t('avg_roi')}</p>
              <p className="text-2xl font-bold text-orange-800">{avgROI.toFixed(1)}%</p>
            </div>
            <PieChart className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: t('overview'), icon: DollarSign },
          { id: 'analysis', label: t('financial_analysis'), icon: BarChart3 },
          { id: 'budget', label: t('budget_planning'), icon: Calculator },
          { id: 'roi', label: t('roi_projections'), icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('rfp_financial_reviews')}</h2>
          <div className="grid gap-4">
            {rfps.map((rfp) => (
              <div key={rfp.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{rfp.title}</h3>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-600">{t('contract_value')}</p>
                        <p className="font-semibold text-green-600">${rfp.value?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{t('estimated_cost')}</p>
                        <p className="font-semibold text-blue-600">${rfp.estimatedCost?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{t('projected_roi')}</p>
                        <p className="font-semibold text-purple-600">
                          {calculateROI(rfp.projectedRevenue || 0, rfp.estimatedCost || 0)}%
                        </p>
                      </div>
                    </div>
                    {rfp.financeReview && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {t('financial_review_completed')}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{rfp.financeReview}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRFP(rfp);
                      setReviewText(rfp.financeReview || '');
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    {rfp.financeReview ? t('edit_review') : t('add_review')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('financial_analysis')}</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-4">{t('profitability_matrix')}</h3>
              <div className="space-y-3">
                {rfps.slice(0, 5).map((rfp) => (
                  <div key={rfp.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{rfp.title.substring(0, 20)}...</span>
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      parseFloat(calculateROI(rfp.projectedRevenue || 0, rfp.estimatedCost || 0)) > 50
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    )}>
                      {calculateROI(rfp.projectedRevenue || 0, rfp.estimatedCost || 0)}% ROI
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-4">{t('cost_benefit_analysis')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>{t('total_investment')}</span>
                  <span className="font-semibold">${totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('expected_returns')}</span>
                  <span className="font-semibold text-green-600">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">{t('net_profit')}</span>
                  <span className="font-semibold text-green-600">${(totalRevenue - totalCost).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('budget_planning')}</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { category: 'Development', amount: 150000, percentage: 30 },
              { category: 'Marketing', amount: 100000, percentage: 20 },
              { category: 'Operations', amount: 125000, percentage: 25 },
              { category: 'Support', amount: 75000, percentage: 15 },
              { category: 'Contingency', amount: 50000, percentage: 10 },
            ].map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium">{item.category}</h4>
                <p className="text-2xl font-bold text-green-600">${item.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{item.percentage}% of budget</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'roi' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('roi_projections')}</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-4">{t('roi_distribution')}</h3>
              <div className="space-y-3">
                {[
                  { range: '0-25%', count: 2, color: 'red' },
                  { range: '25-50%', count: 3, color: 'yellow' },
                  { range: '50-100%', count: 4, color: 'green' },
                  { range: '100%+', count: 1, color: 'blue' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item.range}</span>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-4 h-4 rounded',
                        item.color === 'red' ? 'bg-red-500' :
                        item.color === 'yellow' ? 'bg-yellow-500' :
                        item.color === 'green' ? 'bg-green-500' : 'bg-blue-500'
                      )}></div>
                      <span className="text-sm font-medium">{item.count} RFPs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-4">{t('break_even_analysis')}</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">8.5 months</p>
                  <p className="text-sm text-gray-600">{t('average_break_even_period')}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('initial_investment')}</span>
                    <span>$500K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('monthly_revenue')}</span>
                    <span>$58K</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                    <span>{t('monthly_profit')}</span>
                    <span className="text-green-600">$12K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedRFP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {t('finance_review')} - {selectedRFP.title}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-gray-600">{t('contract_value')}</p>
                  <p className="font-semibold">${selectedRFP.value?.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-gray-600">{t('estimated_cost')}</p>
                  <p className="font-semibold">${selectedRFP.estimatedCost?.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-gray-600">{t('projected_roi')}</p>
                  <p className="font-semibold text-green-600">
                    {calculateROI(selectedRFP.projectedRevenue || 0, selectedRFP.estimatedCost || 0)}%
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('financial_assessment')}</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={t('enter_financial_review_details')}
                  className="w-full p-3 border rounded-lg h-40 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('profitability_rating')}</label>
                  <select className="w-full p-2 border rounded" aria-label={t('profitability_rating')}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Excellent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('risk_assessment')}</label>
                  <select className="w-full p-2 border rounded" aria-label={t('risk_assessment')}>
                    <option>Low Risk</option>
                    <option>Medium Risk</option>
                    <option>High Risk</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleReview}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {t('save_review')}
              </button>
              <button
                onClick={() => {
                  setSelectedRFP(null);
                  setReviewText('');
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceReview;
