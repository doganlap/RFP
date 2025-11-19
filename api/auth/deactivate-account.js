// Vercel API Route - Deactivate Account
// /api/auth/deactivate-account.js

const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

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
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        return res.status(400).json({ error: 'Authentication token required' });
      }

      // Verify and decode token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const userId = decoded.userId;
      const { password, reason, deleteData } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Password confirmation required' });
      }

      // Verify password
      const userResult = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password_hash);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Deactivate account and record in audit trail
      await pool.query('BEGIN');

      try {
        // Record deactivation
        await pool.query(
          `INSERT INTO account_deactivations (user_id, reason)
           VALUES ($1, $2)`,
          [userId, reason || null]
        );

        // Deactivate user
        await pool.query(
          `UPDATE users
           SET is_active = false, updated_at = NOW()
           WHERE id = $1`,
          [userId]
        );

        // Invalidate all sessions
        await pool.query(
          `UPDATE user_sessions
           SET is_active = false
           WHERE user_id = $1`,
          [userId]
        );

        // Optional: Mark for data deletion if requested
        if (deleteData) {
          await pool.query(
            `UPDATE account_deactivations
             SET deleted_data_at = NOW()
             WHERE user_id = $1 AND deleted_data_at IS NULL
             ORDER BY deactivated_at DESC LIMIT 1`,
            [userId]
          );
        }

        await pool.query('COMMIT');

        res.status(200).json({
          success: true,
          message: 'Account deactivated successfully',
          deleteDataScheduled: deleteData ? true : false,
        });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Account deactivation error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
