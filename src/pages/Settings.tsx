import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Integrations from '../components/settings/Integrations';
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'integrations', label: t('integrations'), icon: SettingsIcon },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'security', label: t('security'), icon: Shield },
    { id: 'appearance', label: t('appearance'), icon: Palette },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('profile_settings')}</h3>
            <div className="grid gap-4">
              <input type="text" placeholder={t('full_name')} className="p-2 border rounded" />
              <input type="email" placeholder={t('email')} className="p-2 border rounded" />
              <input type="text" placeholder={t('role')} className="p-2 border rounded" />
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {t('update_profile')}
              </button>
            </div>
          </div>
        );
      case 'integrations':
        return <Integrations />;
      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('notification_settings')}</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                {t('email_notifications')}
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                {t('push_notifications')}
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                {t('task_reminders')}
              </label>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {t('save_settings')}
            </button>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('security_settings')}</h3>
            <div className="grid gap-4">
              <input type="password" placeholder={t('current_password')} className="p-2 border rounded" />
              <input type="password" placeholder={t('new_password')} className="p-2 border rounded" />
              <input type="password" placeholder={t('confirm_password')} className="p-2 border rounded" />
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {t('change_password')}
              </button>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('appearance_settings')}</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="radio" name="theme" value="light" className="mr-2" />
                {t('light_theme')}
              </label>
              <label className="flex items-center">
                <input type="radio" name="theme" value="dark" className="mr-2" />
                {t('dark_theme')}
              </label>
              <label className="flex items-center">
                <input type="radio" name="theme" value="auto" className="mr-2" defaultChecked />
                {t('auto_theme')}
              </label>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {t('save_settings')}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <SettingsIcon className="w-6 h-6" />
        {t('settings')}
      </h1>

      <div className="flex gap-6">
        <div className="w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
