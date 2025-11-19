// Vercel API Route - RFP Management
// /api/rfp/list.js

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
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM rfps WHERE is_archived = false';
      const params = [];

      if (status) {
        query += ' AND status = $1';
        params.push(status);
      }

      query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const result = await pool.query(query, params);
      const countResult = await pool.query('SELECT COUNT(*) FROM rfps WHERE is_archived = false');

      res.status(200).json({
        success: true,
        data: result.rows,
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
      });
    } catch (error) {
      console.error('Error fetching RFPs:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
