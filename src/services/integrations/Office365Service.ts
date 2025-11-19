// src/services/integrations/Office365Service.ts

export interface Office365Config {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
}

export interface EmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: Array<{ fileName: string; content: string }>;
}

class Office365Service {
  private config: Office365Config | null = null;
  private accessToken: string | null = null;
  private readonly graphUrl = 'https://graph.microsoft.com/v1.0';

  async setConfig(config: Office365Config): Promise<void> {
    this.config = config;
    console.log('Office 365 configuration updated');
  }

  async connect(authCode: string): Promise<boolean> {
    try {
      if (!this.config) throw new Error('Office 365 configuration not set');

      const response = await fetch(
        `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            code: authCode,
            redirect_uri: this.config.redirectUri,
            grant_type: 'authorization_code',
            scope: 'Mail.Send',
          }).toString(),
        }
      );

      const data = await response.json();
      this.accessToken = data.access_token;
      console.log('Connected to Office 365');
      return true;
    } catch (error) {
      console.error('Failed to connect to Office 365:', error);
      return false;
    }
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      if (!this.accessToken) throw new Error('Not connected to Office 365');

      const response = await fetch(`${this.graphUrl}/me/sendMail`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject: message.subject,
            body: {
              contentType: message.htmlBody ? 'HTML' : 'Text',
              content: message.htmlBody || message.body,
            },
            toRecipients: message.to.map((email) => ({
              emailAddress: { address: email },
            })),
            ccRecipients: (message.cc || []).map((email) => ({
              emailAddress: { address: email },
            })),
            bccRecipients: (message.bcc || []).map((email) => ({
              emailAddress: { address: email },
            })),
          },
        }),
      });

      console.log(`Email sent to ${message.to.join(', ')} via Office 365`);
      return response.ok;
    } catch (error) {
      console.error('Failed to send email via Office 365:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return !!this.accessToken;
  }
}

export default new Office365Service();
