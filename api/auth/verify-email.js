// Vercel API Route - Verify Email
// /api/auth/verify-email.js

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
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Verification token required' });
      }

      const tokenHash = hashToken(token);

      // Find and validate token
      const result = await pool.query(
        `SELECT evt.id, evt.user_id, evt.verified_at, evt.expires_at
         FROM email_verification_tokens evt
         WHERE evt.token_hash = $1`,
        [tokenHash]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid verification token' });
      }

      const tokenRecord = result.rows[0];

      // Check if already verified
      if (tokenRecord.verified_at) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      // Check if expired
      if (new Date(tokenRecord.expires_at) < new Date()) {
        return res.status(401).json({ error: 'Verification token has expired' });
      }

      // Mark as verified and activate user
      await pool.query('BEGIN');

      try {
        // Mark token as verified
        await pool.query(
          'UPDATE email_verification_tokens SET verified_at = NOW() WHERE id = $1',
          [tokenRecord.id]
        );

        // Activate user
        await pool.query(
          `UPDATE users SET is_active = true, updated_at = NOW()
           WHERE id = $1`,
          [tokenRecord.user_id]
        );

        await pool.query('COMMIT');

        res.status(200).json({
          success: true,
          message: 'Email verified successfully',
        });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
