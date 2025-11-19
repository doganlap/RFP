// src/services/DocumentSignatureService.ts
import DocuSignService, { SignatureRequest, DocuSignSigner, DocuSignDocument } from './integrations/DocuSignService';

export interface SignatureTracking {
  id: string;
  documentName: string;
  signers: Array<{
    email: string;
    name: string;
    status: 'pending' | 'signed' | 'declined';
  }>;
  status: 'sent' | 'in-progress' | 'completed' | 'declined';
  sentAt: Date;
  completedAt?: Date;
}

class DocumentSignatureService {
  async requestSignatures(
    documentBase64: string,
    documentName: string,
    signers: Array<{ email: string; name: string }>,
    subject: string,
    message: string
  ): Promise<string | null> {
    try {
      if (!DocuSignService.isConnected()) {
        console.log('DocuSign not connected');
        return null;
      }

      const signatureRequest: SignatureRequest = {
        signers: signers as DocuSignSigner[],
        documents: [
          {
            documentBase64,
            name: documentName,
            fileExtension: this.getFileExtension(documentName),
            documentId: '1',
          } as DocuSignDocument,
        ],
        subject,
        message,
      };

      return await DocuSignService.requestSignature(signatureRequest);
    } catch (error) {
      console.error('Failed to request signatures:', error);
      return null;
    }
  }

  async trackSignatureStatus(envelopeId: string): Promise<string | null> {
    try {
      if (!DocuSignService.isConnected()) {
        console.log('DocuSign not connected');
        return null;
      }

      return await DocuSignService.getEnvelopeStatus(envelopeId);
    } catch (error) {
      console.error('Failed to track signature status:', error);
      return null;
    }
  }

  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts[parts.length - 1] || 'pdf';
  }
}

export default new DocumentSignatureService();
