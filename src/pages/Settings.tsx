import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Integrations from '../components/settings/Integrations';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Database, Key, Zap } from 'lucide-react';
import { cn } from '../utils/cn';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User, description: t('manage_personal_info') },
    { id: 'integrations', label: t('integrations'), icon: SettingsIcon, description: t('connect_external_services') },
    { id: 'notifications', label: t('notifications'), icon: Bell, description: t('configure_alerts') },
    { id: 'security', label: t('security'), icon: Shield, description: t('manage_security_settings') },
    { id: 'appearance', label: t('appearance'), icon: Palette, description: t('customize_interface') },
    { id: 'preferences', label: t('preferences'), icon: Globe, description: t('set_user_preferences') },
    { id: 'data', label: t('data_management'), icon: Database, description: t('manage_data_settings') },
    { id: 'api', label: t('api_keys'), icon: Key, description: t('manage_api_access') },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{t('profile_settings')}</h3>
                <p className="text-gray-600">{t('manage_personal_information')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('full_name')}</label>
                  <input
                    type="text"
                    placeholder={t('enter_full_name')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('email')}</label>
                  <input
                    type="email"
                    placeholder={t('enter_email_address')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('job_title')}</label>
                  <input
                    type="text"
                    placeholder={t('enter_job_title')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('department')}</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option>{t('select_department')}</option>
                    <option>{t('engineering')}</option>
                    <option>{t('sales')}</option>
                    <option>{t('legal')}</option>
                    <option>{t('finance')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('phone')}</label>
                  <input
                    type="tel"
                    placeholder={t('enter_phone_number')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('timezone')}</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option>UTC-8 (PST)</option>
                    <option>UTC-5 (EST)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC+1 (CET)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                {t('update_profile')}
              </button>
              <button className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                {t('cancel')}
              </button>
            </div>
          </div>
        );

      case 'integrations':
        return <Integrations />;

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('notification_settings')}</h3>
              <p className="text-gray-600">{t('configure_notification_preferences')}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t('email_notifications')}
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span>{t('task_assignments')}</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>{t('deadline_reminders')}</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>{t('project_updates')}</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>{t('weekly_reports')}</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {t('push_notifications')}
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span>{t('urgent_tasks')}</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>{t('mentions')}</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>{t('system_alerts')}</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4">{t('notification_schedule')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quiet_hours_start')}</label>
                    <input type="time" className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('quiet_hours_end')}</label>
                    <input type="time" className="w-full p-2 border rounded" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                {t('save_notification_settings')}
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('security_settings')}</h3>
              <p className="text-gray-600">{t('manage_account_security')}</p>
            </div>

            <div className="grid gap-6">
              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4">{t('change_password')}</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('current_password')}</label>
                    <input
                      type="password"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('new_password')}</label>
                    <input
                      type="password"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('confirm_new_password')}</label>
                    <input
                      type="password"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    {t('update_password')}
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4">{t('two_factor_auth')}</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('enable_2fa')}</p>
                    <p className="text-sm text-gray-600">{t('add_extra_security')}</p>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    {t('enable')}
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4">{t('active_sessions')}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-600">Chrome on Windows • Active now</p>
                    </div>
                    <span className="text-green-600 text-sm">{t('current')}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Mobile App</p>
                      <p className="text-sm text-gray-600">iOS • Last active 2 hours ago</p>
                    </div>
                    <button className="text-red-600 text-sm hover:text-red-700">{t('revoke')}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('appearance_settings')}</h3>
              <p className="text-gray-600">{t('customize_app_appearance')}</p>
            </div>

            <div className="grid gap-6">
              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4">{t('theme')}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <label className="relative">
                    <input type="radio" name="theme" value="light" className="sr-only peer" />
                    <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                      <div className="w-full h-16 bg-white border rounded mb-2"></div>
                      <p className="text-center font-medium">{t('light')}</p>
                    </div>
                  </label>
                  <label className="relative">
                    <input type="radio" name="theme" value="dark" className="sr-only peer" />
                    <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50">
                      <div className="w-full h-16 bg-gray-900 border rounded mb-2"></div>
                      <p className="text-center font-medium">{t('dark')}</p>
                    </div>
                  </label>
                  <label className="relative">
                    <input type="radio" name="theme" value="auto" className="sr-only peer" defaultChecked />
                    <div className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg cursor-pointer">
                      <div className="w-full h-16 bg-gradient-to-r from-white to-gray-900 border rounded mb-2"></div>
                      <p className="text-center font-medium">{t('auto')}</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4">{t('language')}</h4>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option>English</option>
                  <option>العربية</option>
                  <option>Français</option>
                  <option>Español</option>
                </select>
              </div>

              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4">{t('layout')}</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span>{t('compact_mode')}</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>{t('sidebar_collapsed')}</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>{t('show_animations')}</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                {t('save_appearance_settings')}
              </button>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('user_preferences')}</h3>
              <p className="text-gray-600">{t('configure_personal_preferences')}</p>
            </div>

            <div className="grid gap-6">
              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4">{t('default_views')}</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('dashboard_layout')}</label>
                    <select className="w-full p-2 border rounded">
                      <option>{t('grid_view')}</option>
                      <option>{t('list_view')}</option>
                      <option>{t('card_view')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('items_per_page')}</label>
                    <select className="w-full p-2 border rounded">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                      <option>100</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4">{t('workflow_preferences')}</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span>{t('auto_save_drafts')}</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>{t('confirm_before_delete')}</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>{t('show_tooltips')}</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                {t('save_preferences')}
              </button>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('data_management')}</h3>
              <p className="text-gray-600">{t('manage_data_storage')}</p>
            </div>

            <div className="grid gap-6">
              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4">{t('data_usage')}</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('storage_used')}</span>
                      <span>2.4 GB of 10 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('documents')}</span>
                      <span>1,234 files</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border">
                <h4 className="font-semibold mb-4">{t('data_export')}</h4>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    {t('export_all_data')}
                  </button>
                  <button className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                    {t('export_project_data')}
                  </button>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h4 className="font-semibold mb-4 text-red-800">{t('danger_zone')}</h4>
                <div className="space-y-3">
                  <button className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                    {t('delete_all_data')}
                  </button>
                  <p className="text-sm text-red-600">{t('delete_all_data_warning')}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{t('api_keys')}</h3>
              <p className="text-gray-600">{t('manage_api_access')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">{t('api_keys')}</h4>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                  {t('generate_new_key')}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Production API Key</p>
                    <p className="text-sm text-gray-600">Created 2 days ago • Last used today</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-600 text-sm hover:text-blue-700">{t('view')}</button>
                    <button className="text-red-600 text-sm hover:text-red-700">{t('revoke')}</button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Development API Key</p>
                    <p className="text-sm text-gray-600">Created 1 week ago • Last used yesterday</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-600 text-sm hover:text-blue-700">{t('view')}</button>
                    <button className="text-red-600 text-sm hover:text-red-700">{t('revoke')}</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <h4 className="font-semibold mb-4">{t('api_rate_limits')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('requests_per_minute')}</label>
                  <input type="number" defaultValue="1000" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('requests_per_hour')}</label>
                  <input type="number" defaultValue="50000" className="w-full p-2 border rounded" />
                </div>
              </div>
              <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                {t('update_limits')}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <SettingsIcon className="w-8 h-8 text-indigo-600" />
          </div>
          {t('settings')}
        </h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
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
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Description */}
      <div className="bg-indigo-50 p-4 rounded-lg">
        <p className="text-indigo-800">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Settings;
