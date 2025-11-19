// Vercel API Route - Reset Password with Token
// /api/auth/reset-password.js

const { Pool } = require('pg');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const tokenHash = hashToken(token);

      // Find and validate token
      const tokenResult = await pool.query(
        `SELECT prt.id, prt.user_id, prt.expires_at, prt.used_at
         FROM password_reset_tokens prt
         WHERE prt.token_hash = $1`,
        [tokenHash]
      );

      if (tokenResult.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid reset token' });
      }

      const tokenRecord = tokenResult.rows[0];

      // Check if already used
      if (tokenRecord.used_at) {
        return res.status(401).json({ error: 'Reset token has already been used' });
      }

      // Check if expired
      if (new Date(tokenRecord.expires_at) < new Date()) {
        return res.status(401).json({ error: 'Reset token has expired' });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password and mark token as used
      await pool.query('BEGIN');

      try {
        // Mark token as used
        await pool.query(
          'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1',
          [tokenRecord.id]
        );

        // Update user password
        await pool.query(
          `UPDATE users
           SET password_hash = $1, password_changed_at = NOW(), updated_at = NOW()
           WHERE id = $2`,
          [passwordHash, tokenRecord.user_id]
        );

        // Invalidate all existing sessions for security
        await pool.query(
          `UPDATE user_sessions
           SET is_active = false
           WHERE user_id = $1 AND expires_at > NOW()`,
          [tokenRecord.user_id]
        );

        await pool.query('COMMIT');

        res.status(200).json({
          success: true,
          message: 'Password reset successfully. Please log in with your new password.',
        });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
