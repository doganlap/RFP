// Vercel API Route - RFP Detail and Operations
// /api/rfp/detail.js

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

  const { id } = req.query;

  // GET - Fetch RFP detail
  if (req.method === 'GET') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      const result = await pool.query(
        'SELECT * FROM rfps WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'RFP not found' });
      }

      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error fetching RFP:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT - Update RFP
  else if (req.method === 'PUT') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      const { title, description, customer, value, status, stage, notes } = req.body;

      const result = await pool.query(
        `UPDATE rfps
         SET title = $1, description = $2, customer = $3, value = $4,
             status = $5, stage = $6, notes = $7, updated_at = NOW()
         WHERE id = $8
         RETURNING *`,
        [title, description, customer, value, status, stage, notes, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'RFP not found' });
      }

      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error updating RFP:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE - Delete RFP
  else if (req.method === 'DELETE') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      const result = await pool.query(
        'UPDATE rfps SET is_archived = true, updated_at = NOW() WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'RFP not found' });
      }

      res.status(200).json({ success: true, message: 'RFP deleted' });
    } catch (error) {
      console.error('Error deleting RFP:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
