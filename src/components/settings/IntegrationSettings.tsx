// src/components/settings/IntegrationSettings.tsx
import React, { useState } from 'react';
import SalesforceService from '../../services/integrations/SalesforceService';
import HubSpotService from '../../services/integrations/HubSpotService';
import Office365Service from '../../services/integrations/Office365Service';
import GmailService from '../../services/integrations/GmailService';
import SlackService from '../../services/integrations/SlackService';
import TeamsService from '../../services/integrations/TeamsService';
import DocuSignService from '../../services/integrations/DocuSignService';

interface IntegrationStatus {
  name: string;
  isConnected: boolean;
  lastSync?: string;
  icon: string;
  description: string;
}

const IntegrationSettings: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      name: 'Salesforce',
      isConnected: false,
      icon: '☁️',
      description: 'Sync opportunities and account data',
    },
    {
      name: 'HubSpot',
      isConnected: false,
      icon: '🎯',
      description: 'Manage deals and contacts',
    },
    {
      name: 'Office 365',
      isConnected: false,
      icon: '📧',
      description: 'Send emails through Microsoft',
    },
    {
      name: 'Gmail',
      isConnected: false,
      icon: '📬',
      description: 'Send emails through Google',
    },
    {
      name: 'Slack',
      isConnected: false,
      icon: '💬',
      description: 'Receive notifications in Slack',
    },
    {
      name: 'Microsoft Teams',
      isConnected: false,
      icon: '👥',
      description: 'Receive notifications in Teams',
    },
    {
      name: 'DocuSign',
      isConnected: false,
      icon: '✍️',
      description: 'Request and track signatures',
    },
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState(false);

  const handleConnectClick = (integrationName: string) => {
    setSelectedIntegration(integrationName);
    setConfigForm({});
  };

  const handleConfigChange = (key: string, value: string) => {
    setConfigForm({ ...configForm, [key]: value });
  };

  const handleConnect = async () => {
    if (!selectedIntegration || Object.values(configForm).some((v) => !v)) {
      alert('Please fill all required fields');
      return;
    }

    setConnecting(true);
    try {
      switch (selectedIntegration) {
        case 'Salesforce':
          await SalesforceService.setConfig({
            clientId: configForm.clientId,
            clientSecret: configForm.clientSecret,
            instanceUrl: configForm.instanceUrl,
            redirectUri: configForm.redirectUri,
          });
          // In production, handle OAuth flow
          alert('Salesforce configuration saved. Please complete OAuth authentication.');
          break;

        case 'HubSpot':
          await HubSpotService.setConfig({
            apiKey: configForm.apiKey,
            portalId: configForm.portalId,
          });
          const hubspotConnected = await HubSpotService.connect();
          if (hubspotConnected) {
            updateIntegrationStatus('HubSpot', true);
            alert('Connected to HubSpot successfully');
          }
          break;

        case 'Office 365':
          await Office365Service.setConfig({
            clientId: configForm.clientId,
            clientSecret: configForm.clientSecret,
            tenantId: configForm.tenantId,
            redirectUri: configForm.redirectUri,
          });
          alert('Office 365 configuration saved. Please complete OAuth authentication.');
          break;

        case 'Gmail':
          await GmailService.setConfig({
            clientId: configForm.clientId,
            clientSecret: configForm.clientSecret,
            redirectUri: configForm.redirectUri,
          });
          alert('Gmail configuration saved. Please complete OAuth authentication.');
          break;

        case 'Slack':
          await SlackService.setConfig({
            botToken: configForm.botToken,
            appId: configForm.appId,
            signingSecret: configForm.signingSecret,
          });
          const slackConnected = await SlackService.connect();
          if (slackConnected) {
            updateIntegrationStatus('Slack', true);
            alert('Connected to Slack successfully');
          }
          break;

        case 'Microsoft Teams':
          await TeamsService.setConfig({
            webhookUrl: configForm.webhookUrl,
          });
          const teamsConnected = await TeamsService.connect();
          if (teamsConnected) {
            updateIntegrationStatus('Microsoft Teams', true);
            alert('Connected to Teams successfully');
          }
          break;

        case 'DocuSign':
          await DocuSignService.setConfig({
            clientId: configForm.clientId,
            clientSecret: configForm.clientSecret,
            accountId: configForm.accountId,
            redirectUri: configForm.redirectUri,
            userId: configForm.userId,
          });
          alert('DocuSign configuration saved. Please complete OAuth authentication.');
          break;
      }

      setSelectedIntegration(null);
      setConfigForm({});
    } catch (error) {
      console.error('Failed to connect integration:', error);
      alert('Failed to connect. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const updateIntegrationStatus = (name: string, isConnected: boolean) => {
    setIntegrations(
      integrations.map((integration) =>
        integration.name === name
          ? {
              ...integration,
              isConnected,
              lastSync: isConnected ? new Date().toLocaleString() : undefined,
            }
          : integration
      )
    );
  };

  const getConfigFields = (integrationName: string): Array<{ name: string; label: string; type: string }> => {
    const fieldsMap: Record<string, Array<{ name: string; label: string; type: string }>> = {
      Salesforce: [
        { name: 'clientId', label: 'Client ID', type: 'text' },
        { name: 'clientSecret', label: 'Client Secret', type: 'password' },
        { name: 'instanceUrl', label: 'Instance URL', type: 'url' },
        { name: 'redirectUri', label: 'Redirect URI', type: 'url' },
      ],
      HubSpot: [
        { name: 'apiKey', label: 'API Key', type: 'password' },
        { name: 'portalId', label: 'Portal ID', type: 'text' },
      ],
      'Office 365': [
        { name: 'clientId', label: 'Client ID', type: 'text' },
        { name: 'clientSecret', label: 'Client Secret', type: 'password' },
        { name: 'tenantId', label: 'Tenant ID', type: 'text' },
        { name: 'redirectUri', label: 'Redirect URI', type: 'url' },
      ],
      Gmail: [
        { name: 'clientId', label: 'Client ID', type: 'text' },
        { name: 'clientSecret', label: 'Client Secret', type: 'password' },
        { name: 'redirectUri', label: 'Redirect URI', type: 'url' },
      ],
      Slack: [
        { name: 'botToken', label: 'Bot Token', type: 'password' },
        { name: 'appId', label: 'App ID', type: 'text' },
        { name: 'signingSecret', label: 'Signing Secret', type: 'password' },
      ],
      'Microsoft Teams': [
        { name: 'webhookUrl', label: 'Webhook URL', type: 'url' },
      ],
      DocuSign: [
        { name: 'clientId', label: 'Client ID', type: 'text' },
        { name: 'clientSecret', label: 'Client Secret', type: 'password' },
        { name: 'accountId', label: 'Account ID', type: 'text' },
        { name: 'redirectUri', label: 'Redirect URI', type: 'url' },
        { name: 'userId', label: 'User ID', type: 'text' },
      ],
    };
    return fieldsMap[integrationName] || [];
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Integration Settings</h1>

      {/* Integration Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className={`border rounded-lg p-4 ${
              integration.isConnected ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-2xl">{integration.icon}</p>
                <p className="font-semibold text-lg">{integration.name}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  integration.isConnected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {integration.isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

            {integration.lastSync && (
              <p className="text-xs text-gray-500 mb-3">Last sync: {integration.lastSync}</p>
            )}

            <button
              onClick={() => handleConnectClick(integration.name)}
              className={`w-full px-3 py-2 rounded text-sm font-medium ${
                integration.isConnected
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {integration.isConnected ? 'Reconfigure' : 'Connect'}
            </button>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Connect {selectedIntegration}</h2>

            <div className="space-y-4 mb-6">
              {getConfigFields(selectedIntegration).map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={configForm[field.name] || ''}
                    onChange={(e) => handleConfigChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label}`}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
              <button
                onClick={() => {
                  setSelectedIntegration(null);
                  setConfigForm({});
                }}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationSettings;
