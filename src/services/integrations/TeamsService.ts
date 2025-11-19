// src/services/integrations/TeamsService.ts

export interface TeamsConfig {
  webhookUrl: string;
  appId?: string;
  appPassword?: string;
}

export interface TeamsMessage {
  title: string;
  text: string;
  channel?: string;
  sections?: Array<{
    activityTitle?: string;
    activitySubtitle?: string;
    facts?: Array<{ name: string; value: string }>;
  }>;
}

class TeamsService {
  private config: TeamsConfig | null = null;
  private readonly graphUrl = 'https://graph.microsoft.com/v1.0';

  async setConfig(config: TeamsConfig): Promise<void> {
    this.config = config;
    console.log('Microsoft Teams configuration updated');
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.config) throw new Error('Teams configuration not set');

      const response = await this.sendMessage({
        title: 'Teams Connection Test',
        text: 'Successfully connected to Microsoft Teams',
      });

      console.log('Connected to Microsoft Teams');
      return response;
    } catch (error) {
      console.error('Failed to connect to Teams:', error);
      return false;
    }
  }

  async sendMessage(message: TeamsMessage): Promise<boolean> {
    try {
      if (!this.config) throw new Error('Teams configuration not set');

      const payload = {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: message.title,
        themeColor: '0078D4',
        title: message.title,
        sections: [
          {
            activityTitle: message.title,
            text: message.text,
            ...(message.sections && message.sections.length > 0 && {
              facts: message.sections[0].facts,
            }),
          },
        ],
      };

      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log(`Message sent to Teams: ${message.title}`);
      return response.ok;
    } catch (error) {
      console.error('Failed to send Teams message:', error);
      return false;
    }
  }

  async sendNotification(
    title: string,
    message: string,
    facts?: Array<{ name: string; value: string }>
  ): Promise<boolean> {
    return this.sendMessage({
      title,
      text: message,
      sections: facts ? [{ facts }] : undefined,
    });
  }

  isConnected(): boolean {
    return !!this.config?.webhookUrl;
  }
}

export default new TeamsService();
