import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Rocket,
  Target,
  BarChart3,
  Bot,
  Clock,
  TrendingUp,
  Shield,
  CheckCircle,
  Zap,
  Award,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  const valueProps = [
    {
      icon: <Rocket className="w-8 h-8" />,
      title: 'Faster Bid Preparation',
      description: 'Cut RFP response time by 60% with AI-assisted content generation and automated workflow routing',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Higher Win Rates',
      description: 'Increase win rate from 45% to 68% with data-driven insights, competitor analysis, and win/loss analytics',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Real-time Visibility & KPIs',
      description: 'Executive dashboards with live metrics: active RFPs, revenue targets, team performance, and agency goals',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'AI-Powered Collaboration',
      description: 'Automated task assignment, SME coordination, compliance checks, and intelligent document analysis',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const phases = [
    {
      phase: 'Phase 1',
      title: 'Assist & Insights',
      status: 'Now',
      items: [
        'AI-suggested responses and content templates',
        'Manual task assignment with automated notifications',
        'Win/loss analytics and KPI dashboards',
        'Multi-language support (Arabic/English)'
      ],
      color: 'bg-blue-500'
    },
    {
      phase: 'Phase 2',
      title: 'Semi-Autonomous Workflows',
      status: 'Q1-Q2 2025',
      items: [
        'Auto-assignment based on expertise and workload',
        'AI-generated first draft with compliance verification',
        'Predictive win probability scoring',
        'Automated pricing optimization'
      ],
      color: 'bg-purple-500'
    },
    {
      phase: 'Phase 3',
      title: 'Autonomous Bid Management',
      status: 'Q3-Q4 2025',
      items: [
        'Self-optimizing bid strategies from historical data',
        'Auto-escalation of critical deadlines and risks',
        'Closed-loop learning from won/lost bids',
        'Zero-touch proposal generation'
      ],
      color: 'bg-green-500'
    }
  ];

  const metrics = [
    { label: 'Time to Prepare Proposals', value: '-60%', icon: <Clock className="w-6 h-6" /> },
    { label: 'Win Rate Improvement', value: '+51%', icon: <TrendingUp className="w-6 h-6" /> },
    { label: 'Team Productivity', value: '+85%', icon: <Users className="w-6 h-6" /> },
    { label: 'Compliance Traceability', value: '100%', icon: <Shield className="w-6 h-6" /> },
    { label: 'Revenue Growth', value: '+35%', icon: <Award className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/30">
                {t('app_title')} Excellence
              </span>
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                L2 → L3 AI
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              من الفوضى إلى التميز
              <br />
              <span className="text-blue-200">From Chaos to Excellence</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              AI-Powered RFP Response & Bid Management Console
            </p>
            <p className="text-lg mb-12 text-blue-50 max-w-2xl mx-auto">
              Win More. Work Less. Automate Everything.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={ROUTES.DASHBOARD}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-blue-50 transition-all transform hover:scale-105"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-white/20 transition-all">
                Watch 2-Min Demo
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-900"></div>
      </div>

      {/* Core Value Props */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Core Value for Enterprise
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Transform your RFP process with AI-powered intelligence
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {valueProps.map((prop, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${prop.color} text-white mb-6`}>
                {prop.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {prop.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="bg-white dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Roadmap to AI Autonomy
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              From Assistant to Autonomous in 12 months
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {phases.map((phase, index) => (
              <div
                key={index}
                className="relative bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 shadow-lg"
              >
                <div className={`absolute top-0 left-0 right-0 h-2 ${phase.color} rounded-t-2xl`}></div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {phase.phase}
                  </span>
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full">
                    {phase.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {phase.title}
                </h3>
                <ul className="space-y-3">
                  {phase.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Practical Scenario */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Real Enterprise Transformation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-red-300">❌</span> Before
              </h3>
              <p className="text-blue-100">
                15 days coordinating between teams. Email chains, missed requirements, rushed submission 2 hours before deadline.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" /> With {t('app_title')}
              </h3>
              <p className="text-blue-100">
                AI extracts 120 requirements instantly. Real-time collaboration. Automated compliance checks. 72% win probability predicted.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" /> Result
              </h3>
              <p className="text-blue-100">
                Completed in 5 days. Submitted 48 hours early. Quality score +40%. Won with highest technical score.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="bg-gray-100 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Impact Metrics
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Measurable transformation across your organization
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-4">
                  {metric.icon}
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Autonomy Badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white shadow-2xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-2xl font-bold">
                L2
              </div>
              <ArrowRight className="w-8 h-8" />
              <div className="px-6 py-3 bg-white/30 backdrop-blur-sm rounded-full text-2xl font-bold">
                L3
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              AI Autonomy Commitment
            </h2>
            <p className="text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
              Current Level: <strong>L2 – Co-Pilot</strong> (Advisory + Execute with Approvals)
            </p>
            <p className="text-lg text-blue-50 max-w-3xl mx-auto">
              <strong>Target: L3 – Autonomous Bid Intelligence by Q4 2025</strong>
              <br />
              Upgrade to fully autonomous bid preparation for standard RFPs, self-learning win strategies,
              and zero-touch proposal generation with continuous quality improvement.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white dark:bg-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your RFP Process?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
            Join leading enterprises that have already accelerated their bid management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to={ROUTES.DASHBOARD}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
              Schedule Consultation
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              ISO 27001 Compliant
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              GDPR Ready
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              99.9% Uptime SLA
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Enterprise Security
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
