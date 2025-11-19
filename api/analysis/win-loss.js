// Vercel API Route - Win/Loss Analysis
// /api/analysis/win-loss.js

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

  // GET - Fetch win/loss record
  if (req.method === 'GET') {
    try {
      const { rfpId } = req.query;

      if (!rfpId) {
        return res.status(400).json({ error: 'rfpId is required' });
      }

      const result = await pool.query(
        'SELECT * FROM win_loss_analysis WHERE rfp_id = $1',
        [rfpId]
      );

      res.status(200).json({
        success: true,
        data: result.rows[0] || null
      });
    } catch (error) {
      console.error('Error fetching win/loss analysis:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST - Create/update win/loss record
  else if (req.method === 'POST') {
    try {
      const { rfpId, outcome, reasons, analysis, completedBy } = req.body;

      if (!rfpId || !outcome) {
        return res.status(400).json({ error: 'rfpId and outcome are required' });
      }

      // Check if record exists
      const existing = await pool.query(
        'SELECT id FROM win_loss_analysis WHERE rfp_id = $1',
        [rfpId]
      );

      let result;
      if (existing.rows.length > 0) {
        // Update
        result = await pool.query(
          `UPDATE win_loss_analysis
           SET outcome = $1, reasons = $2, analysis = $3, completed_by = $4, updated_at = NOW()
           WHERE rfp_id = $5
           RETURNING *`,
          [outcome, JSON.stringify(reasons || []), analysis || null, completedBy || null, rfpId]
        );
      } else {
        // Create
        result = await pool.query(
          `INSERT INTO win_loss_analysis (rfp_id, outcome, reasons, analysis, completed_by)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [rfpId, outcome, JSON.stringify(reasons || []), analysis || null, completedBy || null]
        );
      }

      res.status(existing.rows.length > 0 ? 200 : 201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error saving win/loss analysis:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
