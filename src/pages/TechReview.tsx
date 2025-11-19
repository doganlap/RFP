import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/ApiClient';
import { Code, Edit, CheckCircle, Cpu, Shield, Zap, Database } from 'lucide-react';
import { cn } from '../utils/cn';

interface RFP {
  id: string;
  title: string;
  status: string;
  techReview?: string;
  client?: string;
  complexity?: 'Low' | 'Medium' | 'High';
  techStack?: string[];
  estimatedHours?: number;
}

const TechReview: React.FC = () => {
  const { t } = useTranslation();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'feasibility' | 'architecture' | 'security'>('overview');

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      const data = await apiClient.getRFPs();
      // Mock additional technical data
      const rfpArray = Array.isArray(data) ? data : data.items || [];
      const enhancedData = rfpArray.map((rfp: RFP, index: number) => ({
        ...rfp,
        complexity: ['Low', 'Medium', 'High'][index % 3] as 'Low' | 'Medium' | 'High',
        techStack: [
          ['React', 'Node.js', 'PostgreSQL'],
          ['Vue.js', 'Python', 'MongoDB'],
          ['Angular', 'Java', 'MySQL'],
          ['React Native', 'Express', 'Redis'],
          ['Next.js', 'TypeScript', 'AWS']
        ][index % 5],
        estimatedHours: Math.floor(Math.random() * 500) + 100,
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
      await apiClient.updateRFP(selectedRFP.id, { techReview: reviewText });
      await loadRFPs();
      setSelectedRFP(null);
      setReviewText('');
    } catch (error) {
      console.error('Failed to save review:', error);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const totalRFPs = rfps.length;
  const completedReviews = rfps.filter(rfp => rfp.techReview).length;
  const avgComplexity = rfps.length > 0 ? rfps.reduce((sum, rfp) => {
    const score = rfp.complexity === 'Low' ? 1 : rfp.complexity === 'Medium' ? 2 : 3;
    return sum + score;
  }, 0) / rfps.length : 0;

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
            <Code className="w-8 h-8 text-blue-600" />
          </div>
          {t('tech_review')}
        </h1>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            {t('tech_assessment_tool')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">{t('total_rfps')}</p>
              <p className="text-2xl font-bold text-blue-800">{totalRFPs}</p>
            </div>
            <Code className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">{t('reviews_completed')}</p>
              <p className="text-2xl font-bold text-green-800">{completedReviews}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">{t('avg_complexity')}</p>
              <p className="text-2xl font-bold text-purple-800">{avgComplexity.toFixed(1)}</p>
            </div>
            <Zap className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">{t('security_risks')}</p>
              <p className="text-2xl font-bold text-orange-800">
                {rfps.filter(rfp => rfp.complexity === 'High').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: t('overview'), icon: Code },
          { id: 'feasibility', label: t('technical_feasibility'), icon: Cpu },
          { id: 'architecture', label: t('system_architecture'), icon: Database },
          { id: 'security', label: t('security_assessment'), icon: Shield },
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
          <h2 className="text-xl font-semibold">{t('rfp_technical_reviews')}</h2>
          <div className="grid gap-4">
            {rfps.map((rfp) => (
              <div key={rfp.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{rfp.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getComplexityColor(rfp.complexity || 'Medium'))}>
                        {rfp.complexity} Complexity
                      </span>
                      <span className="text-sm text-gray-600">
                        Est. Hours: {rfp.estimatedHours}
                      </span>
                    </div>
                    {rfp.techStack && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {rfp.techStack.map((tech, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {rfp.techReview && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {t('technical_review_completed')}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">{rfp.techReview}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRFP(rfp);
                      setReviewText(rfp.techReview || '');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    {rfp.techReview ? t('edit_review') : t('add_review')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'feasibility' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('technical_feasibility')}</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { metric: 'Feasibility Score', value: '85%', status: 'Good' },
              { metric: 'Resource Availability', value: '90%', status: 'Excellent' },
              { metric: 'Timeline Feasibility', value: '75%', status: 'Acceptable' },
            ].map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium">{item.metric}</h4>
                <p className="text-2xl font-bold text-blue-600">{item.value}</p>
                <p className="text-sm text-gray-600">{item.status}</p>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">{t('feasibility_analysis')}</h3>
            <div className="space-y-3">
              {rfps.slice(0, 3).map((rfp) => (
                <div key={rfp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{rfp.title.substring(0, 30)}...</span>
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-1 rounded text-xs font-medium',
                      rfp.complexity === 'Low' ? 'bg-green-100 text-green-800' :
                      rfp.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {rfp.complexity}
                    </span>
                    <span className="text-sm text-gray-600">{rfp.estimatedHours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('system_architecture')}</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-4">{t('architecture_patterns')}</h3>
              <div className="space-y-3">
                {[
                  { pattern: 'Microservices', usage: '60%', projects: 3 },
                  { pattern: 'Monolithic', usage: '25%', projects: 1 },
                  { pattern: 'Serverless', usage: '15%', projects: 1 },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{item.pattern}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">{item.usage}</span>
                      <p className="text-xs text-gray-500">{item.projects} projects</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-4">{t('technology_stack')}</h3>
              <div className="space-y-2">
                {[
                  { tech: 'React', count: 4 },
                  { tech: 'Node.js', count: 3 },
                  { tech: 'Python', count: 2 },
                  { tech: 'AWS', count: 3 },
                  { tech: 'PostgreSQL', count: 2 },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm">{item.tech}</span>
                    <span className="text-sm font-medium">{item.count} RFPs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('security_assessment')}</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { level: 'Low Risk', count: 3, color: 'green' },
              { level: 'Medium Risk', count: 2, color: 'yellow' },
              { level: 'High Risk', count: 1, color: 'red' },
            ].map((item, index) => (
              <div key={index} className={cn('p-4 rounded-lg text-center',
                item.color === 'green' ? 'bg-green-50 border-green-200' :
                item.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              )}>
                <h4 className="font-medium">{item.level}</h4>
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-sm text-gray-600">RFPs</p>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">{t('security_requirements')}</h3>
            <div className="space-y-3">
              {[
                { requirement: 'Data Encryption', status: 'Implemented' },
                { requirement: 'Access Control', status: 'In Progress' },
                { requirement: 'Audit Logging', status: 'Pending' },
                { requirement: 'Compliance Standards', status: 'Review Required' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{item.requirement}</span>
                  <span className={cn('px-2 py-1 rounded text-xs font-medium',
                    item.status === 'Implemented' ? 'bg-green-100 text-green-800' :
                    item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  )}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedRFP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              {t('tech_review')} - {selectedRFP.title}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-gray-600">{t('complexity')}</p>
                  <p className={cn('font-semibold', getComplexityColor(selectedRFP.complexity || 'Medium'))}>
                    {selectedRFP.complexity}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-gray-600">{t('estimated_hours')}</p>
                  <p className="font-semibold">{selectedRFP.estimatedHours}h</p>
                </div>
              </div>
              {selectedRFP.techStack && (
                <div>
                  <p className="text-sm font-medium mb-2">{t('technology_stack')}</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRFP.techStack.map((tech, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">{t('technical_assessment')}</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={t('enter_technical_review_details')}
                  className="w-full p-3 border rounded-lg h-40 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('feasibility_rating')}</label>
                  <select className="w-full p-2 border rounded" aria-label={t('feasibility_rating')}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Excellent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('security_level')}</label>
                  <select className="w-full p-2 border rounded" aria-label={t('security_level')}>
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

export default TechReview;
