// src/services/NotificationService.ts
import SlackService from './integrations/SlackService';
import TeamsService from './integrations/TeamsService';
import Office365Service, { EmailMessage } from './integrations/Office365Service';
import GmailService from './integrations/GmailService';

export interface NotificationPayload {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  context?: Record<string, any>;
}

class NotificationService {
  async notifySlack(channel: string, payload: NotificationPayload): Promise<boolean> {
    try {
      if (!SlackService.isConnected()) return false;
      return await SlackService.sendNotification(channel, payload.title, payload.message);
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      return false;
    }
  }

  async notifyTeams(payload: NotificationPayload): Promise<boolean> {
    try {
      if (!TeamsService.isConnected()) return false;
      const facts = payload.context
        ? Object.entries(payload.context).map(([name, value]) => ({
            name,
            value: String(value),
          }))
        : undefined;
      return await TeamsService.sendNotification(payload.title, payload.message, facts);
    } catch (error) {
      console.error('Failed to send Teams notification:', error);
      return false;
    }
  }

  async notifyEmail(to: string[], payload: NotificationPayload): Promise<boolean> {
    try {
      // Try Office 365 first, then Gmail
      let sent = false;

      if (Office365Service.isConnected()) {
        const emailMessage: EmailMessage = {
          to,
          subject: payload.title,
          body: payload.message,
          htmlBody: `<h3>${payload.title}</h3><p>${payload.message}</p>`,
        };
        sent = await Office365Service.sendEmail(emailMessage);
      }

      if (!sent && GmailService.isConnected()) {
        const emailMessage = {
          to,
          subject: payload.title,
          body: payload.message,
        };
        sent = await GmailService.sendEmail(emailMessage);
      }

      return sent;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  async notifyAll(channels: string[], payload: NotificationPayload): Promise<boolean> {
    const results = [];

    // Send to Slack
    if (channels.includes('slack')) {
      results.push(await this.notifySlack('#general', payload));
    }

    // Send to Teams
    if (channels.includes('teams')) {
      results.push(await this.notifyTeams(payload));
    }

    // Send to Email
    if (channels.includes('email')) {
      results.push(await this.notifyEmail(['user@example.com'], payload));
    }

    return results.some((r) => r);
  }
}

export default new NotificationService();
