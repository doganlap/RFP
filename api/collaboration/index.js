// Vercel API Route - Collaboration
// /api/collaboration/index.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET - Fetch collaborators for RFP
  if (req.method === 'GET') {
    try {
      const { rfpId } = req.query;

      if (!rfpId) {
        return res.status(400).json({ error: 'rfpId is required' });
      }

      const result = await pool.query(
        `SELECT c.*, u.email, u.name FROM collaborators c
         JOIN users u ON c.user_id = u.id
         WHERE c.rfp_id = $1 AND c.is_active = true`,
        [rfpId]
      );

      res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST - Add collaborator
  else if (req.method === 'POST') {
    try {
      const { rfpId, userId, role } = req.body;

      if (!rfpId || !userId) {
        return res.status(400).json({ error: 'rfpId and userId are required' });
      }

      const result = await pool.query(
        `INSERT INTO collaborators (rfp_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (rfp_id, user_id) DO UPDATE SET is_active = true, updated_at = NOW()
         RETURNING *`,
        [rfpId, userId, role || 'viewer']
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error adding collaborator:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE - Remove collaborator
  else if (req.method === 'DELETE') {
    try {
      const { rfpId, userId } = req.query;

      if (!rfpId || !userId) {
        return res.status(400).json({ error: 'rfpId and userId are required' });
      }

      await pool.query(
        `UPDATE collaborators SET is_active = false, updated_at = NOW()
         WHERE rfp_id = $1 AND user_id = $2`,
        [rfpId, userId]
      );

      res.status(200).json({ success: true, message: 'Collaborator removed' });
    } catch (error) {
      console.error('Error removing collaborator:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
