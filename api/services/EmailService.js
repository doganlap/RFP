// Email Service - SendGrid Integration
// api/services/EmailService.js

const sgMail = require('@sendgrid/mail');

class EmailService {
  constructor() {
    // Initialize SendGrid if API key is provided
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.enabled = true;
    } else {
      console.warn('⚠️  SendGrid API key not configured. Email sending disabled.');
      this.enabled = false;
    }
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email, verificationToken) {
    if (!this.enabled) {
      console.log(`[DEV] Would send verification email to ${email}`);
      return true;
    }

    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@rfpplatform.com',
        subject: 'Verify Your Email Address',
        html: `
          <h2>Welcome to RFP Platform!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <p>
            <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p><code>${verificationUrl}</code></p>
          <p>This link expires in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        `,
        text: `
Welcome to RFP Platform!

Please verify your email by visiting this link:
${verificationUrl}

This link expires in 24 hours.

If you didn't create this account, please ignore this email.
        `,
      };

      await sgMail.send(msg);
      console.log(`✓ Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, resetToken) {
    if (!this.enabled) {
      console.log(`[DEV] Would send password reset email to ${email}`);
      return true;
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@rfpplatform.com',
        subject: 'Reset Your Password',
        html: `
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p>
            <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p><code>${resetUrl}</code></p>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email or contact support.</p>
        `,
        text: `
Password Reset Request

Please reset your password by visiting this link:
${resetUrl}

This link expires in 1 hour.

If you didn't request a password reset, please ignore this email.
        `,
      };

      await sgMail.send(msg);
      console.log(`✓ Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  /**
   * Send login notification email
   */
  async sendLoginNotification(email, device, ipAddress) {
    if (!this.enabled) {
      console.log(`[DEV] Would send login notification to ${email}`);
      return true;
    }

    try {
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@rfpplatform.com',
        subject: 'New Login to Your Account',
        html: `
          <h2>New Login Detected</h2>
          <p>Your account was accessed with the following details:</p>
          <ul>
            <li><strong>Device:</strong> ${device || 'Unknown'}</li>
            <li><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p>If this wasn't you, please change your password immediately or contact support.</p>
        `,
        text: `
New Login Detected

Your account was accessed with the following details:
- Device: ${device || 'Unknown'}
- IP Address: ${ipAddress || 'Unknown'}
- Time: ${new Date().toLocaleString()}

If this wasn't you, please change your password immediately.
        `,
      };

      await sgMail.send(msg);
      console.log(`✓ Login notification sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send login notification:', error);
      // Don't throw - notifications shouldn't block login
      return false;
    }
  }

  /**
   * Send account deactivation confirmation email
   */
  async sendAccountDeactivationEmail(email, reactivationUrl) {
    if (!this.enabled) {
      console.log(`[DEV] Would send deactivation confirmation to ${email}`);
      return true;
    }

    try {
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@rfpplatform.com',
        subject: 'Account Deactivation Confirmation',
        html: `
          <h2>Account Deactivated</h2>
          <p>Your RFP Platform account has been successfully deactivated.</p>
          <p>You can reactivate your account at any time by logging in with your credentials.</p>
          <p>If you have any questions, please contact our support team.</p>
        `,
        text: `
Account Deactivated

Your RFP Platform account has been successfully deactivated.

You can reactivate your account at any time by logging in.
        `,
      };

      await sgMail.send(msg);
      console.log(`✓ Deactivation confirmation sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send deactivation email:', error);
      return false;
    }
  }

  /**
   * Send rate limit warning email
   */
  async sendRateLimitWarning(email, attemptCount) {
    if (!this.enabled) {
      console.log(`[DEV] Would send rate limit warning to ${email}`);
      return true;
    }

    try {
      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@rfpplatform.com',
        subject: 'Security Alert: Multiple Login Attempts',
        html: `
          <h2>Security Alert</h2>
          <p>We detected ${attemptCount} failed login attempts on your account.</p>
          <p>Your account is temporarily locked for security reasons. Please try again after 15 minutes.</p>
          <p>If these attempts were made by you, your password may be compromised. Please change it immediately.</p>
        `,
        text: `
Security Alert

We detected ${attemptCount} failed login attempts on your account.

Your account is temporarily locked for security reasons. Please try again after 15 minutes.

If these attempts were made by you, your password may be compromised.
        `,
      };

      await sgMail.send(msg);
      console.log(`✓ Rate limit warning sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send rate limit warning:', error);
      return false;
    }
  }

  /**
   * Send document shared notification
   */
  async sendDocumentSharedEmail(recipientEmail, senderName, documentName, shareUrl) {
    if (!this.enabled) {
      console.log(`[DEV] Would send document share notification to ${recipientEmail}`);
      return true;
    }

    try {
      const msg = {
        to: recipientEmail,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@rfpplatform.com',
        subject: `${senderName} shared a document with you`,
        html: `
          <h2>Document Shared</h2>
          <p>${senderName} has shared the document <strong>${documentName}</strong> with you on RFP Platform.</p>
          <p>
            <a href="${shareUrl}" style="background-color: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Document
            </a>
          </p>
          <p>If you don't have a RFP Platform account, you can create one to view the document.</p>
        `,
        text: `
Document Shared

${senderName} has shared the document "${documentName}" with you.

Visit this link to view it:
${shareUrl}
        `,
      };

      await sgMail.send(msg);
      console.log(`✓ Document share notification sent to ${recipientEmail}`);
      return true;
    } catch (error) {
      console.error('Failed to send document share email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
