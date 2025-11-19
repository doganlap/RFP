// Vercel API Route - Request Password Reset
// /api/auth/forgot-password.js

const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Hash token for secure storage
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Generate reset token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Find user by email
      const userResult = await pool.query(
        'SELECT id FROM users WHERE email = $1 LIMIT 1',
        [email.toLowerCase()]
      );

      // NOTE: We don't reveal whether email exists (security best practice)
      if (userResult.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'If an account exists with that email, a password reset link has been sent',
        });
      }

      const userId = userResult.rows[0].id;

      // Generate reset token
      const resetToken = generateResetToken();
      const tokenHash = hashToken(resetToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store token in database
      await pool.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, ip_address)
         VALUES ($1, $2, $3, $4)`,
        [userId, tokenHash, expiresAt, req.headers['x-forwarded-for'] || req.connection.remoteAddress]
      );

      // Send password reset email
      const EmailService = require('../services/EmailService');
      try {
        await EmailService.sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        console.error('Email send error (non-blocking):', emailError);
        // Don't fail request if email fails - token is logged
      }
      // For development, also log the token
      if (process.env.NODE_ENV === 'development') {
        console.log(`Password reset token for ${email}: ${resetToken}`);
      }

      res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent',
        // In development only:
        ...(process.env.NODE_ENV === 'development' && { resetToken }),
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
