// src/services/integrations/SlackService.ts

export interface SlackConfig {
  botToken: string;
  appId: string;
  signingSecret: string;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  threadTs?: string;
}

class SlackService {
  private config: SlackConfig | null = null;
  private readonly slackUrl = 'https://slack.com/api';

  async setConfig(config: SlackConfig): Promise<void> {
    this.config = config;
    console.log('Slack configuration updated');
  }

  async connect(): Promise<boolean> {
    try {
      if (!this.config) throw new Error('Slack configuration not set');

      const response = await fetch(`${this.slackUrl}/auth.test`, {
        headers: { Authorization: `Bearer ${this.config.botToken}` },
      });

      const data = await response.json();
      console.log('Connected to Slack');
      return data.ok;
    } catch (error) {
      console.error('Failed to connect to Slack:', error);
      return false;
    }
  }

  async sendMessage(message: SlackMessage): Promise<boolean> {
    try {
      if (!this.config) throw new Error('Slack configuration not set');

      const response = await fetch(`${this.slackUrl}/chat.postMessage`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: message.channel,
          text: message.text,
          blocks: message.blocks,
          thread_ts: message.threadTs,
        }),
      });

      const data = await response.json();
      console.log(`Message sent to #${message.channel} in Slack`);
      return data.ok;
    } catch (error) {
      console.error('Failed to send Slack message:', error);
      return false;
    }
  }

  async sendNotification(channel: string, title: string, message: string): Promise<boolean> {
    return this.sendMessage({
      channel,
      text: `${title}\n${message}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: title,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
      ],
    });
  }

  isConnected(): boolean {
    return !!this.config?.botToken;
  }
}

export default new SlackService();
