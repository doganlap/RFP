// src/services/integrations/GmailService.ts

export interface GmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface EmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
}

class GmailService {
  private config: GmailConfig | null = null;
  private accessToken: string | null = null;
  private readonly googleUrl = 'https://www.googleapis.com';

  async setConfig(config: GmailConfig): Promise<void> {
    this.config = config;
    console.log('Gmail configuration updated');
  }

  async connect(authCode: string): Promise<boolean> {
    try {
      if (!this.config) throw new Error('Gmail configuration not set');

      const response = await fetch(`${this.googleUrl}/oauth2/v4/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code: authCode,
          redirect_uri: this.config.redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      console.log('Connected to Gmail');
      return true;
    } catch (error) {
      console.error('Failed to connect to Gmail:', error);
      return false;
    }
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      if (!this.accessToken) throw new Error('Not connected to Gmail');

      const emailContent = this.createMimeMessage(message);
      const encodedMessage = btoa(emailContent);

      const response = await fetch(
        `${this.googleUrl}/gmail/v1/users/me/messages/send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            raw: encodedMessage,
          }),
        }
      );

      console.log(`Email sent to ${message.to.join(', ')} via Gmail`);
      return response.ok;
    } catch (error) {
      console.error('Failed to send email via Gmail:', error);
      return false;
    }
  }

  private createMimeMessage(message: EmailMessage): string {
    const headers = [
      `From: me`,
      `To: ${message.to.join(', ')}`,
      ...(message.cc ? [`Cc: ${message.cc.join(', ')}`] : []),
      ...(message.bcc ? [`Bcc: ${message.bcc.join(', ')}`] : []),
      `Subject: ${message.subject}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      `MIME-Version: 1.0`,
    ];

    return headers.join('\r\n') + '\r\n\r\n' + message.body;
  }

  isConnected(): boolean {
    return !!this.accessToken;
  }
}

export default new GmailService();
