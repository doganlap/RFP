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
  Award,
  Users,
  AlertCircle,
  Sparkles,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  const valueProps = [
    {
      icon: <Rocket className="w-12 h-12" />,
      titleEn: 'Faster Bid Preparation',
      titleAr: 'تحضير أسرع للعروض',
      metric: '-60%',
      metricLabel: 'وقت أقل',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Target className="w-12 h-12" />,
      titleEn: 'Higher Win Rates',
      titleAr: 'معدل فوز أعلى',
      metric: '+51%',
      metricLabel: 'زيادة في الفوز',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      titleEn: 'Real-time Analytics',
      titleAr: 'تحليلات فورية',
      metric: '100%',
      metricLabel: 'رؤية كاملة',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Bot className="w-12 h-12" />,
      titleEn: 'AI Automation',
      titleAr: 'أتمتة ذكية',
      metric: '+85%',
      metricLabel: 'إنتاجية',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const phases = [
    {
      phase: '١',
      level: 'L1-L2',
      titleEn: 'Co-Pilot',
      titleAr: 'مساعد ذكي',
      status: 'الآن • Now',
      icon: <Bot className="w-16 h-16" />,
      features: ['AI Suggestions', 'اقتراحات ذكية', 'Analytics', 'تحليلات فورية'],
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      phase: '٢',
      level: 'L2-L3',
      titleEn: 'Semi-Auto',
      titleAr: 'شبه آلي',
      status: 'Q1-Q2 2025',
      icon: <Target className="w-16 h-16" />,
      features: ['Auto-Assignment', 'تعيين تلقائي', 'AI Drafts', 'مسودات ذكية'],
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      phase: '٣',
      level: 'L3',
      titleEn: 'Autonomous',
      titleAr: 'مستقل تماماً',
      status: 'Q3-Q4 2025',
      icon: <Rocket className="w-16 h-16" />,
      features: ['Self-Learning', 'تعلم ذاتي', 'Zero-Touch', 'تلقائي كامل'],
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    }
  ];

  const metrics = [
    { labelEn: 'Time Saved', labelAr: 'وقت موفر', value: '60%', icon: <Clock className="w-8 h-8" />, color: 'from-blue-500 to-blue-600' },
    { labelEn: 'Win Rate', labelAr: 'معدل الفوز', value: '68%', icon: <TrendingUp className="w-8 h-8" />, color: 'from-green-500 to-green-600' },
    { labelEn: 'Productivity', labelAr: 'إنتاجية', value: '+85%', icon: <Users className="w-8 h-8" />, color: 'from-purple-500 to-purple-600' },
    { labelEn: 'Compliance', labelAr: 'امتثال', value: '100%', icon: <Shield className="w-8 h-8" />, color: 'from-orange-500 to-orange-600' },
    { labelEn: 'Revenue', labelAr: 'إيرادات', value: '+35%', icon: <Award className="w-8 h-8" />, color: 'from-pink-500 to-pink-600' }
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
              className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${prop.color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
              <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-r ${prop.color} text-white mb-6 shadow-lg`}>
                {prop.icon}
              </div>
              <div className="text-center">
                <div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
                  {prop.metric}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {prop.metricLabel}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {prop.titleEn}
                </h3>
                <p className="text-base font-semibold text-gray-700 dark:text-gray-300" dir="rtl">
                  {prop.titleAr}
                </p>
              </div>
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
                className={`relative rounded-3xl p-10 shadow-2xl text-white ${phase.color} transform hover:scale-105 transition-all`}
              >
                <div className="text-center">
                  <div className="mb-4 flex justify-center">{phase.icon}</div>
                  <div className="text-6xl font-black mb-2">{phase.phase}</div>
                  <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-bold mb-4 inline-block">
                    {phase.level}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {phase.titleEn}
                  </h3>
                  <p className="text-xl font-semibold mb-4" dir="rtl">
                    {phase.titleAr}
                  </p>
                  <div className="text-sm opacity-90 mb-6">
                    {phase.status}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {phase.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-xs font-medium"
                        dir={idx % 2 === 0 ? 'ltr' : 'rtl'}
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Practical Scenario */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4 text-center">
            التحول المؤسسي
          </h2>
          <p className="text-xl text-center text-blue-100 mb-12">
            Enterprise Transformation Journey
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-red-300/30 transform hover:scale-105 transition-all">
              <div className="mb-4 flex justify-center">
                <AlertCircle className="w-16 h-16 text-red-300" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                قبل
              </h3>
              <p className="text-sm text-blue-100 mb-2">Before</p>
              <div className="text-7xl font-black text-red-300 mb-2">15</div>
              <p className="text-lg font-semibold">أيام</p>
              <p className="text-sm text-blue-200">Days of chaos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-yellow-300/50 transform scale-110 hover:scale-115 transition-all shadow-2xl">
              <div className="mb-4 flex justify-center">
                <Sparkles className="w-16 h-16 text-yellow-300" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                مع {t('app_title')}
              </h3>
              <p className="text-sm text-blue-100 mb-2">With AI Power</p>
              <div className="text-7xl font-black text-yellow-300 mb-2">5</div>
              <p className="text-lg font-semibold">أيام</p>
              <p className="text-sm text-blue-200">Days to excellence</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-green-300/50 transform hover:scale-105 transition-all">
              <div className="mb-4 flex justify-center">
                <Trophy className="w-16 h-16 text-green-300" />
              </div>
              <h3 className="text-2xl font-bold mb-3">
                النتيجة
              </h3>
              <p className="text-sm text-blue-100 mb-2">Result</p>
              <div className="text-7xl font-black text-green-300 mb-2">72%</div>
              <p className="text-lg font-semibold">فوز</p>
              <p className="text-sm text-blue-200">Win probability</p>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center hover:shadow-2xl transition-all transform hover:scale-110 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5`}></div>
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${metric.color} text-white mb-4 shadow-lg relative z-10`}>
                  {metric.icon}
                </div>
                <div className="text-5xl font-black bg-gradient-to-r text-transparent bg-clip-text from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-3 relative z-10">
                  {metric.value}
                </div>
                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 relative z-10">
                  {metric.labelEn}
                </div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 relative z-10" dir="rtl">
                  {metric.labelAr}
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
