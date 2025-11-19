// Enterprise Document Management Service
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import mammoth from 'mammoth';

export class DocumentService {
  constructor() {
    // AWS S3 Configuration
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.bucketName = process.env.AWS_S3_BUCKET || 'rfp-platform-documents';
    this.cdnUrl = process.env.AWS_CLOUDFRONT_URL;
  }

  // Upload document to S3 with encryption
  async uploadDocument(rfpId, file, metadata = {}) {
    try {
      const fileId = uuidv4();
      const timestamp = Date.now();
      const fileExtension = this.getFileExtension(file.originalname);
      const s3Key = `rfps/${rfpId}/documents/${timestamp}-${fileId}.${fileExtension}`;
      
      // Calculate file checksum
      const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
      
      // Upload to S3 with server-side encryption
      const uploadParams = {
        Bucket: this.bucketName,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ServerSideEncryption: 'AES256',
        Metadata: {
          'original-filename': file.originalname,
          'uploaded-by': metadata.uploadedBy || 'system',
          'rfp-id': rfpId,
          'document-type': metadata.documentType || 'general',
          'checksum': checksum
        },
        Tagging: `Environment=${process.env.NODE_ENV}&RFP=${rfpId}&Type=${metadata.documentType || 'general'}`
      };

      const uploadResult = await this.s3.upload(uploadParams).promise();
      
      // Create document record
      const documentRecord = {
        id: fileId,
        rfp_id: rfpId,
        filename: s3Key,
        original_filename: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype,
        storage_path: uploadResult.Location,
        document_type: metadata.documentType || 'general',
        version: 1,
        checksum: checksum,
        uploaded_by: metadata.uploadedBy,
        metadata: {
          s3_etag: uploadResult.ETag,
          s3_version_id: uploadResult.VersionId,
          ...metadata
        }
      };

      return documentRecord;
    } catch (error) {
      console.error('Document upload error:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  // Download document from S3
  async downloadDocument(documentId, userId) {
    try {
      // Get document record from database (would be implemented)
      const document = await this.getDocumentById(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }

      // Check permissions (would be implemented)
      await this.checkDownloadPermission(document, userId);

      // Generate signed URL for secure download
      const signedUrl = await this.s3.getSignedUrlPromise('getObject', {
        Bucket: this.bucketName,
        Key: document.filename,
        Expires: 3600, // 1 hour
        ResponseContentDisposition: `attachment; filename="${document.original_filename}"`
      });

      // Log download activity
      await this.logDocumentAccess(documentId, userId, 'download');

      return {
        downloadUrl: signedUrl,
        filename: document.original_filename,
        fileSize: document.file_size,
        mimeType: document.mime_type
      };
    } catch (error) {
      console.error('Document download error:', error);
      throw new Error(`Failed to download document: ${error.message}`);
    }
  }

  // Generate PDF proposal from template
  async generateProposal(rfpId, templateData, proposalData) {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      // Collect PDF data
      doc.on('data', chunk => chunks.push(chunk));
      
      return new Promise((resolve, reject) => {
        doc.on('end', async () => {
          try {
            const pdfBuffer = Buffer.concat(chunks);
            
            // Upload generated PDF
            const proposalFile = {
              buffer: pdfBuffer,
              originalname: `RFP-${rfpId}-Proposal-v${proposalData.version}.pdf`,
              mimetype: 'application/pdf',
              size: pdfBuffer.length
            };

            const uploadResult = await this.uploadDocument(rfpId, proposalFile, {
              documentType: 'proposal',
              version: proposalData.version,
              generatedBy: proposalData.generatedBy,
              templateId: templateData.id
            });

            resolve(uploadResult);
          } catch (error) {
            reject(error);
          }
        });

        // Generate PDF content
        this.buildProposalPDF(doc, proposalData);
        doc.end();
      });
    } catch (error) {
      console.error('Proposal generation error:', error);
      throw new Error(`Failed to generate proposal: ${error.message}`);
    }
  }

  // Build PDF content for proposal
  buildProposalPDF(doc, proposalData) {
    // Cover Page
    doc.fontSize(24).text('PROPOSAL', 50, 50);
    doc.fontSize(18).text(proposalData.title, 50, 100);
    doc.fontSize(14).text(`Client: ${proposalData.client}`, 50, 140);
    doc.fontSize(12).text(`RFP ID: ${proposalData.rfpId}`, 50, 160);
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, 50, 180);
    doc.fontSize(12).text(`Version: ${proposalData.version}`, 50, 200);

    // Executive Summary
    doc.addPage();
    doc.fontSize(16).text('EXECUTIVE SUMMARY', 50, 50);
    doc.fontSize(12).text(proposalData.executiveSummary || 'Executive summary content...', 50, 80, {
      width: 500,
      align: 'justify'
    });

    // Technical Solution
    doc.addPage();
    doc.fontSize(16).text('TECHNICAL SOLUTION', 50, 50);
    doc.fontSize(12).text(proposalData.technicalSolution || 'Technical solution details...', 50, 80, {
      width: 500,
      align: 'justify'
    });

    // Commercial Terms
    doc.addPage();
    doc.fontSize(16).text('COMMERCIAL TERMS', 50, 50);
    
    if (proposalData.pricing) {
      doc.fontSize(14).text('Pricing Summary', 50, 80);
      doc.fontSize(12).text(`Total Contract Value: $${proposalData.pricing.totalValue?.toLocaleString()}`, 50, 110);
      doc.fontSize(12).text(`Payment Terms: ${proposalData.pricing.paymentTerms}`, 50, 130);
      doc.fontSize(12).text(`Contract Duration: ${proposalData.pricing.duration}`, 50, 150);
    }

    // Compliance & Certifications
    doc.addPage();
    doc.fontSize(16).text('COMPLIANCE & CERTIFICATIONS', 50, 50);
    
    if (proposalData.compliance) {
      proposalData.compliance.forEach((item, index) => {
        doc.fontSize(12).text(`• ${item}`, 50, 80 + (index * 20));
      });
    }

    // Team & Experience
    doc.addPage();
    doc.fontSize(16).text('TEAM & EXPERIENCE', 50, 50);
    
    if (proposalData.team) {
      proposalData.team.forEach((member, index) => {
        doc.fontSize(14).text(member.name, 50, 80 + (index * 60));
        doc.fontSize(12).text(member.role, 50, 100 + (index * 60));
        doc.fontSize(10).text(member.experience, 50, 115 + (index * 60), { width: 500 });
      });
    }
  }

  // Convert Word document to text
  async convertWordToText(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error('Word conversion error:', error);
      throw new Error(`Failed to convert Word document: ${error.message}`);
    }
  }

  // Extract text from PDF (would require pdf-parse library)
  async extractPDFText(buffer) {
    try {
      // Implementation would use pdf-parse library
      // const pdf = require('pdf-parse');
      // const data = await pdf(buffer);
      // return data.text;
      return 'PDF text extraction not implemented';
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract PDF text: ${error.message}`);
    }
  }

  // Document versioning
  async createDocumentVersion(documentId, file, userId, notes = '') {
    try {
      const originalDocument = await this.getDocumentById(documentId);
      
      if (!originalDocument) {
        throw new Error('Original document not found');
      }

      // Upload new version
      const newVersion = await this.uploadDocument(originalDocument.rfp_id, file, {
        documentType: originalDocument.document_type,
        uploadedBy: userId,
        parentDocumentId: documentId,
        versionNotes: notes
      });

      // Update version number
      newVersion.version = originalDocument.version + 1;
      newVersion.parent_document_id = documentId;

      return newVersion;
    } catch (error) {
      console.error('Document versioning error:', error);
      throw new Error(`Failed to create document version: ${error.message}`);
    }
  }

  // Digital signature placeholder
  async signDocument(documentId, userId, signatureData) {
    try {
      // This would integrate with DocuSign, Adobe Sign, or similar service
      const signature = {
        document_id: documentId,
        signer_id: userId,
        signature_data: signatureData,
        signed_at: new Date(),
        signature_hash: crypto.createHash('sha256').update(JSON.stringify(signatureData)).digest('hex')
      };

      // Store signature record
      await this.storeSignature(signature);

      return signature;
    } catch (error) {
      console.error('Document signing error:', error);
      throw new Error(`Failed to sign document: ${error.message}`);
    }
  }

  // Bulk document operations
  async bulkUpload(rfpId, files, metadata = {}) {
    try {
      const uploadPromises = files.map(file => 
        this.uploadDocument(rfpId, file, metadata)
      );

      const results = await Promise.allSettled(uploadPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
      const failed = results.filter(r => r.status === 'rejected').map(r => r.reason);

      return {
        successful,
        failed,
        totalCount: files.length,
        successCount: successful.length,
        failureCount: failed.length
      };
    } catch (error) {
      console.error('Bulk upload error:', error);
      throw new Error(`Failed to bulk upload documents: ${error.message}`);
    }
  }

  // Document search and indexing
  async searchDocuments(rfpId, query, filters = {}) {
    try {
      // This would integrate with Elasticsearch or similar search engine
      const searchParams = {
        rfp_id: rfpId,
        query: query,
        document_type: filters.documentType,
        date_range: filters.dateRange,
        file_type: filters.fileType
      };

      // Placeholder implementation
      const results = await this.performDocumentSearch(searchParams);
      
      return results;
    } catch (error) {
      console.error('Document search error:', error);
      throw new Error(`Failed to search documents: ${error.message}`);
    }
  }

  // Utility methods
  getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  isAllowedFileType(mimetype) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    return allowedTypes.includes(mimetype);
  }

  // Placeholder methods (would be implemented with database)
  async getDocumentById(documentId) {
    // Database query implementation
    return null;
  }

  async checkDownloadPermission(document, userId) {
    // Permission check implementation
    return true;
  }

  async logDocumentAccess(documentId, userId, action) {
    // Audit log implementation
    console.log(`Document ${action}: ${documentId} by user ${userId}`);
  }

  async storeSignature(signature) {
    // Database storage implementation
    console.log('Signature stored:', signature);
  }

  async performDocumentSearch(searchParams) {
    // Search implementation
    return [];
  }
}

export default DocumentService;
