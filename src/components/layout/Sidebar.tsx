/**
 * Enterprise Sidebar Component
 */
import React from 'react';
import { ROUTES } from '../../config/routes';
import { useAppStore } from '../../store';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import {
  Home,
  FileText,
  Settings,
  Users,
  BarChart3,
  Shield,
  DollarSign,
  Code,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  current?: boolean;
}

export const Sidebar: React.FC = () => {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const { t } = useTranslation();

  const navigation: NavItem[] = [
    { name: t('dashboard'), href: ROUTES.DASHBOARD, icon: Home, current: true },
    { name: t('rfps'), href: ROUTES.RFP.LIST, icon: FileText },
    { name: t('analytics_dashboard'), href: ROUTES.ANALYSIS.DASHBOARD, icon: BarChart3 },
    { name: t('win_loss_analysis'), href: ROUTES.ANALYSIS.WIN_LOSS, icon: BarChart3 },
    { name: t('legal_review'), href: ROUTES.SME_GENERAL.LEGAL, icon: Shield },
    { name: t('finance_review'), href: ROUTES.SME_GENERAL.FINANCE, icon: DollarSign },
    { name: t('tech_review'), href: ROUTES.SME_GENERAL.TECH, icon: Code },
    { name: t('team'), href: ROUTES.TEAM, icon: Users },
    { name: t('settings'), href: ROUTES.SETTINGS.ROOT, icon: Settings },
  ];

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900 transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12 12 0 0012 21.054a12 12 0 008.618-15.07z"
              />
            </svg>
          </div>
          {sidebarOpen && (
            <span className="text-lg font-bold text-white">{t('rfp_platform')}</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className={cn(
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  item.current
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )}
                />
                {sidebarOpen && <span className="ml-3">{item.name}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-green-500" />
          {sidebarOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{t('online')}</p>
              <p className="text-xs text-gray-400">{t('all_systems_operational')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
