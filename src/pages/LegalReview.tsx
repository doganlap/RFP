import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/ApiClient';
import { Shield, Plus, Edit, CheckCircle, AlertTriangle, FileText, Scale, Gavel } from 'lucide-react';
import { cn } from '../utils/cn';

interface RFP {
  id: string;
  title: string;
  status: string;
  legalReview?: string;
  value?: number;
  client?: string;
}

interface ComplianceItem {
  id: string;
  category: string;
  requirement: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_attention';
  notes?: string;
}

const LegalReview: React.FC = () => {
  const { t } = useTranslation();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'compliance' | 'contracts' | 'risks'>('overview');
  const [complianceItems] = useState<ComplianceItem[]>([
    { id: '1', category: 'Data Protection', requirement: 'GDPR Compliance', status: 'approved', notes: 'All data handling procedures reviewed' },
    { id: '2', category: 'Contract Law', requirement: 'Standard Terms Review', status: 'needs_attention', notes: 'IP clauses need revision' },
    { id: '3', category: 'Intellectual Property', requirement: 'Patent Clearance', status: 'pending', notes: 'Awaiting patent search results' },
    { id: '4', category: 'Regulatory', requirement: 'Industry Compliance', status: 'approved', notes: 'All regulatory requirements met' },
  ]);

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      const data = await apiClient.getRFPs();
      const rfpArray = Array.isArray(data) ? data : data.items || [];
      setRfps(rfpArray);
    } catch (error) {
      console.error('Failed to load RFPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedRFP) return;
    try {
      await apiClient.updateRFP(selectedRFP.id, { legalReview: reviewText });
      await loadRFPs();
      setSelectedRFP(null);
      setReviewText('');
    } catch (error) {
      console.error('Failed to save review:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'needs_attention': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      case 'needs_attention': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

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
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          {t('legal_review')}
        </h1>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('new_contract_template')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">{t('total_rfps')}</p>
              <p className="text-2xl font-bold text-blue-800">{rfps.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">{t('approved')}</p>
              <p className="text-2xl font-bold text-green-800">
                {rfps.filter(rfp => rfp.legalReview).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">{t('pending_review')}</p>
              <p className="text-2xl font-bold text-yellow-800">
                {rfps.filter(rfp => !rfp.legalReview).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">{t('high_risk')}</p>
              <p className="text-2xl font-bold text-purple-800">
                {complianceItems.filter(item => item.status === 'needs_attention').length}
              </p>
            </div>
            <Scale className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: t('overview'), icon: FileText },
          { id: 'compliance', label: t('compliance_checklist'), icon: CheckCircle },
          { id: 'contracts', label: t('contract_templates'), icon: Gavel },
          { id: 'risks', label: t('risk_assessment'), icon: AlertTriangle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
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
          <h2 className="text-xl font-semibold">{t('rfp_legal_reviews')}</h2>
          <div className="grid gap-4">
            {rfps.map((rfp) => (
              <div key={rfp.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{rfp.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Client: {rfp.client || 'N/A'}</span>
                      <span>Value: ${rfp.value?.toLocaleString() || 'N/A'}</span>
                      <span>Status: {rfp.status}</span>
                    </div>
                    {rfp.legalReview && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {t('legal_review_completed')}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{rfp.legalReview}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRFP(rfp);
                      setReviewText(rfp.legalReview || '');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    {rfp.legalReview ? t('edit_review') : t('add_review')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('compliance_checklist')}</h2>
          <div className="grid gap-4">
            {complianceItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-full', getStatusColor(item.status))}>
                      {getStatusIcon(item.status)}
                    </div>
                    <div>
                      <h4 className="font-medium">{item.category}</h4>
                      <p className="text-sm text-gray-600">{item.requirement}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(item.status))}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {item.notes && (
                      <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">{item.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('contract_templates')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Standard MSA', description: 'Master Service Agreement template' },
              { name: 'NDA Template', description: 'Non-Disclosure Agreement' },
              { name: 'SOW Template', description: 'Statement of Work template' },
              { name: 'IP Agreement', description: 'Intellectual Property agreement' },
            ].map((template, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <Gavel className="w-8 h-8 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
                <button className="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                  {t('use_template')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('risk_assessment')}</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { level: 'Low', count: 12, color: 'green' },
              { level: 'Medium', count: 8, color: 'yellow' },
              { level: 'High', count: 3, color: 'red' },
            ].map((risk, index) => (
              <div key={index} className={cn('p-4 rounded-lg text-center',
                risk.color === 'green' ? 'bg-green-50 border-green-200' :
                risk.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              )}>
                <h4 className="font-medium">{risk.level} Risk</h4>
                <p className="text-2xl font-bold">{risk.count}</p>
                <p className="text-sm text-gray-600">RFPs</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedRFP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t('legal_review')} - {selectedRFP.title}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('legal_assessment')}</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={t('enter_legal_review_details')}
                  className="w-full p-3 border rounded-lg h-40 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('risk_level')}</label>
                  <select className="w-full p-2 border rounded" aria-label={t('risk_level')}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('compliance_status')}</label>
                  <select className="w-full p-2 border rounded" aria-label={t('compliance_status')}>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Needs Revision</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleReview}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
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

export default LegalReview;
