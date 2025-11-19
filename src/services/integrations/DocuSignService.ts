// src/services/integrations/DocuSignService.ts

export interface DocuSignConfig {
  clientId: string;
  clientSecret: string;
  accountId: string;
  redirectUri: string;
  userId: string;
}

export interface DocuSignSigner {
  email: string;
  name: string;
  recipientId?: string;
  clientUserId?: string;
}

export interface DocuSignDocument {
  documentBase64: string;
  name: string;
  fileExtension: string;
  documentId: string;
}

export interface SignatureRequest {
  signers: DocuSignSigner[];
  documents: DocuSignDocument[];
  subject: string;
  message: string;
}

class DocuSignService {
  private config: DocuSignConfig | null = null;
  private accessToken: string | null = null;
  private readonly baseUrl = 'https://demo.docusign.net/restapi';

  async setConfig(config: DocuSignConfig): Promise<void> {
    this.config = config;
    console.log('DocuSign configuration updated');
  }

  async connect(authCode: string): Promise<boolean> {
    try {
      if (!this.config) throw new Error('DocuSign configuration not set');

      const response = await fetch('https://account-d.docusign.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code: authCode,
          redirect_uri: this.config.redirectUri,
        }).toString(),
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      console.log('Connected to DocuSign');
      return true;
    } catch (error) {
      console.error('Failed to connect to DocuSign:', error);
      return false;
    }
  }

  async requestSignature(request: SignatureRequest): Promise<string | null> {
    try {
      if (!this.accessToken || !this.config) return null;

      const payload = {
        emailSubject: request.subject,
        emailBlurb: request.message,
        documents: request.documents.map((doc) => ({
          documentBase64: doc.documentBase64,
          name: doc.name,
          fileExtension: doc.fileExtension,
          documentId: doc.documentId,
        })),
        recipients: {
          signers: request.signers.map((signer, index) => ({
            email: signer.email,
            name: signer.name,
            recipientId: (index + 1).toString(),
            clientUserId: signer.clientUserId || `${index + 1}`,
            tabs: {
              signHereTabs: [
                {
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '100',
                  yPosition: '100',
                },
              ],
            },
          })),
        },
        status: 'sent',
      };

      const response = await fetch(
        `${this.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log(
        `Signature request sent to ${request.signers.map((s) => s.email).join(', ')} for ${request.documents[0].name}`
      );
      return data.envelopeId;
    } catch (error) {
      console.error('Failed to request signature via DocuSign:', error);
      return null;
    }
  }

  async getEnvelopeStatus(envelopeId: string): Promise<string | null> {
    try {
      if (!this.accessToken || !this.config) return null;

      const response = await fetch(
        `${this.baseUrl}/v2.1/accounts/${this.config.accountId}/envelopes/${envelopeId}`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Failed to get envelope status:', error);
      return null;
    }
  }

  isConnected(): boolean {
    return !!this.accessToken;
  }
}

export default new DocuSignService();
