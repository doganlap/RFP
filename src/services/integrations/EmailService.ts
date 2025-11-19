/**
 * Email Integration Service
 * Office 365 (Microsoft Graph) and Gmail API connectors
 */

export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  body: string;
  bodyType: 'text' | 'html';
  receivedAt: string;
  attachments?: EmailAttachment[];
  rfpId?: string;
  labels?: string[];
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  content?: string; // Base64 encoded
}

export interface EmailDraft {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyType?: 'text' | 'html';
  attachments?: EmailAttachment[];
  rfpId?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Office 365 / Microsoft Graph Email Service
 */
export class Office365Service {
  private accessToken: string;
  private graphBaseUrl: string = 'https://graph.microsoft.com/v1.0';

  constructor() {
    this.accessToken = process.env.OFFICE365_ACCESS_TOKEN || '';
  }

  /**
   * Authenticate with Microsoft Graph using OAuth 2.0
   */
  async authenticate(clientId: string, clientSecret: string, tenantId: string): Promise<void> {
    try {
      const response = await fetch(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'https://graph.microsoft.com/.default',
            grant_type: 'client_credentials'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Office 365 authentication failed');
      }

      const data = await response.json();
      this.accessToken = data.access_token;

      console.log('Office 365 authenticated successfully');
    } catch (error) {
      console.error('Office 365 authentication error:', error);
      throw error;
    }
  }

  /**
   * Send email via Microsoft Graph
   */
  async sendEmail(draft: EmailDraft): Promise<EmailSendResult> {
    try {
      const message = {
        subject: draft.subject,
        body: {
          contentType: draft.bodyType === 'html' ? 'HTML' : 'Text',
          content: draft.body
        },
        toRecipients: draft.to.map(email => ({
          emailAddress: { address: email }
        })),
        ccRecipients: draft.cc?.map(email => ({
          emailAddress: { address: email }
        })) || [],
        bccRecipients: draft.bcc?.map(email => ({
          emailAddress: { address: email }
        })) || [],
        attachments: await this.prepareAttachments(draft.attachments || [])
      };

      const response = await fetch(`${this.graphBaseUrl}/me/sendMail`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          saveToSentItems: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to send email');
      }

      return {
        success: true,
        messageId: 'sent-via-graph'
      };
    } catch (error) {
      console.error('Office 365 send email error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get emails from inbox
   */
  async getEmails(filter?: {
    search?: string;
    from?: string;
    subject?: string;
    maxResults?: number;
  }): Promise<EmailMessage[]> {
    try {
      let url = `${this.graphBaseUrl}/me/messages?$top=${filter?.maxResults || 50}`;

      const filters: string[] = [];
      if (filter?.from) filters.push(`from/emailAddress/address eq '${filter.from}'`);
      if (filter?.subject) filters.push(`contains(subject, '${filter.subject}')`);

      if (filters.length > 0) {
        url += `&$filter=${filters.join(' and ')}`;
      }

      if (filter?.search) {
        url += `&$search="${filter.search}"`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Office 365 emails');
      }

      const data = await response.json();

      return data.value.map((msg: any) => ({
        id: msg.id,
        subject: msg.subject,
        from: msg.from.emailAddress.address,
        to: msg.toRecipients.map((r: any) => r.emailAddress.address),
        cc: msg.ccRecipients?.map((r: any) => r.emailAddress.address),
        body: msg.body.content,
        bodyType: msg.body.contentType.toLowerCase() === 'html' ? 'html' : 'text',
        receivedAt: msg.receivedDateTime,
        attachments: msg.hasAttachments ? await this.getAttachments(msg.id) : []
      }));
    } catch (error) {
      console.error('Office 365 get emails error:', error);
      throw error;
    }
  }

  /**
   * Get email attachments
   */
  private async getAttachments(messageId: string): Promise<EmailAttachment[]> {
    try {
      const response = await fetch(
        `${this.graphBaseUrl}/me/messages/${messageId}/attachments`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch attachments');
      }

      const data = await response.json();

      return data.value.map((att: any) => ({
        id: att.id,
        filename: att.name,
        mimeType: att.contentType,
        size: att.size,
        content: att.contentBytes // Base64 encoded
      }));
    } catch (error) {
      console.error('Get attachments error:', error);
      return [];
    }
  }

  /**
   * Prepare attachments for sending
   */
  private async prepareAttachments(attachments: EmailAttachment[]): Promise<any[]> {
    return attachments.map(att => ({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: att.filename,
      contentType: att.mimeType,
      contentBytes: att.content
    }));
  }

  /**
   * Create email draft
   */
  async createDraft(draft: EmailDraft): Promise<string> {
    try {
      const message = {
        subject: draft.subject,
        body: {
          contentType: draft.bodyType === 'html' ? 'HTML' : 'Text',
          content: draft.body
        },
        toRecipients: draft.to.map(email => ({
          emailAddress: { address: email }
        }))
      };

      const response = await fetch(`${this.graphBaseUrl}/me/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new Error('Failed to create draft');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Create draft error:', error);
      throw error;
    }
  }
}

/**
 * Gmail API Service
 */
export class GmailService {
  private accessToken: string;
  private apiBaseUrl: string = 'https://gmail.googleapis.com/gmail/v1';

  constructor() {
    this.accessToken = process.env.GMAIL_ACCESS_TOKEN || '';
  }

  /**
   * Authenticate with Gmail using OAuth 2.0
   */
  async authenticate(clientId: string, clientSecret: string, refreshToken: string): Promise<void> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error('Gmail authentication failed');
      }

      const data = await response.json();
      this.accessToken = data.access_token;

      console.log('Gmail authenticated successfully');
    } catch (error) {
      console.error('Gmail authentication error:', error);
      throw error;
    }
  }

  /**
   * Send email via Gmail API
   */
  async sendEmail(draft: EmailDraft): Promise<EmailSendResult> {
    try {
      const email = this.createMimeMessage(draft);
      const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await fetch(`${this.apiBaseUrl}/users/me/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: encodedEmail
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to send email');
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.id
      };
    } catch (error) {
      console.error('Gmail send email error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get emails from Gmail
   */
  async getEmails(filter?: {
    search?: string;
    from?: string;
    subject?: string;
    maxResults?: number;
  }): Promise<EmailMessage[]> {
    try {
      const queries: string[] = [];
      if (filter?.from) queries.push(`from:${filter.from}`);
      if (filter?.subject) queries.push(`subject:${filter.subject}`);
      if (filter?.search) queries.push(filter.search);

      const query = queries.length > 0 ? queries.join(' ') : '';
      const maxResults = filter?.maxResults || 50;

      const listResponse = await fetch(
        `${this.apiBaseUrl}/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!listResponse.ok) {
        throw new Error('Failed to list Gmail messages');
      }

      const listData = await listResponse.json();

      if (!listData.messages || listData.messages.length === 0) {
        return [];
      }

      // Fetch full message details
      const messages = await Promise.all(
        listData.messages.map((msg: any) => this.getMessage(msg.id))
      );

      return messages.filter(msg => msg !== null) as EmailMessage[];
    } catch (error) {
      console.error('Gmail get emails error:', error);
      throw error;
    }
  }

  /**
   * Get single message details
   */
  private async getMessage(messageId: string): Promise<EmailMessage | null> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/users/me/messages/${messageId}?format=full`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const headers = data.payload.headers;

      const getHeader = (name: string) => {
        const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
        return header?.value || '';
      };

      let body = '';
      let bodyType: 'text' | 'html' = 'text';

      if (data.payload.body.data) {
        body = atob(data.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      } else if (data.payload.parts) {
        const htmlPart = data.payload.parts.find((p: any) => p.mimeType === 'text/html');
        const textPart = data.payload.parts.find((p: any) => p.mimeType === 'text/plain');

        if (htmlPart?.body?.data) {
          body = atob(htmlPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          bodyType = 'html';
        } else if (textPart?.body?.data) {
          body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          bodyType = 'text';
        }
      }

      return {
        id: data.id,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To').split(',').map((e: string) => e.trim()),
        cc: getHeader('Cc') ? getHeader('Cc').split(',').map((e: string) => e.trim()) : undefined,
        body,
        bodyType,
        receivedAt: new Date(parseInt(data.internalDate)).toISOString(),
        labels: data.labelIds
      };
    } catch (error) {
      console.error('Get message error:', error);
      return null;
    }
  }

  /**
   * Create MIME email message
   */
  private createMimeMessage(draft: EmailDraft): string {
    const boundary = '===============' + Date.now() + '==';
    const lines: string[] = [];

    lines.push('MIME-Version: 1.0');
    lines.push(`To: ${draft.to.join(', ')}`);
    if (draft.cc) lines.push(`Cc: ${draft.cc.join(', ')}`);
    if (draft.bcc) lines.push(`Bcc: ${draft.bcc.join(', ')}`);
    lines.push(`Subject: ${draft.subject}`);
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    lines.push('');
    lines.push(`--${boundary}`);
    lines.push(`Content-Type: ${draft.bodyType === 'html' ? 'text/html' : 'text/plain'}; charset="UTF-8"`);
    lines.push('Content-Transfer-Encoding: 7bit');
    lines.push('');
    lines.push(draft.body);

    // Add attachments if any
    if (draft.attachments) {
      for (const attachment of draft.attachments) {
        lines.push(`--${boundary}`);
        lines.push(`Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`);
        lines.push('Content-Transfer-Encoding: base64');
        lines.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
        lines.push('');
        lines.push(attachment.content || '');
      }
    }

    lines.push(`--${boundary}--`);

    return lines.join('\r\n');
  }

  /**
   * Create email draft
   */
  async createDraft(draft: EmailDraft): Promise<string> {
    try {
      const email = this.createMimeMessage(draft);
      const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await fetch(`${this.apiBaseUrl}/users/me/drafts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: {
            raw: encodedEmail
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create Gmail draft');
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Create Gmail draft error:', error);
      throw error;
    }
  }
}

/**
 * Unified Email Service
 */
export class EmailService {
  private office365: Office365Service;
  private gmail: GmailService;
  private activeProvider: 'office365' | 'gmail';

  constructor(provider: 'office365' | 'gmail' = 'office365') {
    this.office365 = new Office365Service();
    this.gmail = new GmailService();
    this.activeProvider = provider;
  }

  /**
   * Send email using active provider
   */
  async sendEmail(draft: EmailDraft): Promise<EmailSendResult> {
    if (this.activeProvider === 'office365') {
      return this.office365.sendEmail(draft);
    } else {
      return this.gmail.sendEmail(draft);
    }
  }

  /**
   * Get emails using active provider
   */
  async getEmails(filter?: {
    search?: string;
    from?: string;
    subject?: string;
    maxResults?: number;
  }): Promise<EmailMessage[]> {
    if (this.activeProvider === 'office365') {
      return this.office365.getEmails(filter);
    } else {
      return this.gmail.getEmails(filter);
    }
  }

  /**
   * Send RFP notification email
   */
  async sendRFPNotification(params: {
    to: string[];
    rfpId: string;
    rfpTitle: string;
    action: string;
    message: string;
    linkUrl?: string;
  }): Promise<EmailSendResult> {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { margin-top: 20px; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>RFP Platform Notification</h2>
          </div>
          <div class="content">
            <h3>${params.action}</h3>
            <p><strong>RFP:</strong> ${params.rfpTitle}</p>
            <p><strong>RFP ID:</strong> ${params.rfpId}</p>
            <p>${params.message}</p>
            ${params.linkUrl ? `<a href="${params.linkUrl}" class="button">View RFP</a>` : ''}
          </div>
          <div class="footer">
            <p>This is an automated notification from the RFP Platform.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: params.to,
      subject: `${params.action} - ${params.rfpTitle}`,
      body: htmlBody,
      bodyType: 'html',
      rfpId: params.rfpId
    });
  }

  /**
   * Extract RFP-related emails
   */
  async getRFPEmails(rfpId: string): Promise<EmailMessage[]> {
    return this.getEmails({
      search: `RFP-${rfpId}`,
      maxResults: 100
    });
  }

  /**
   * Switch email provider
   */
  setProvider(provider: 'office365' | 'gmail'): void {
    this.activeProvider = provider;
  }
}

export default EmailService;
