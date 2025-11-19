// Vercel API Route - Analytics and Insights
// /api/analysis/analytics.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Get overall statistics
      const statsResult = await pool.query(`
        SELECT
          COUNT(*) as total_rfps,
          COUNT(CASE WHEN status = 'won' THEN 1 END) as won,
          COUNT(CASE WHEN status = 'lost' THEN 1 END) as lost,
          COUNT(CASE WHEN status = 'no-decision' THEN 1 END) as no_decision,
          SUM(CAST(value AS NUMERIC)) as total_value,
          AVG(CAST(value AS NUMERIC)) as avg_value
        FROM rfps WHERE is_archived = false
      `);

      // Get win rate
      const winRateResult = await pool.query(`
        SELECT
          COUNT(CASE WHEN status = 'won' THEN 1 END) * 100.0 /
          NULLIF(COUNT(*), 0) as win_rate
        FROM rfps WHERE status IN ('won', 'lost', 'no-decision')
      `);

      // Get top loss reasons
      const lossReasonsResult = await pool.query(`
        SELECT
          (wla.reasons->>0)::text as reason,
          COUNT(*) as count
        FROM win_loss_analysis wla
        WHERE wla.outcome = 'lost'
        AND wla.reasons IS NOT NULL
        GROUP BY reason
        ORDER BY count DESC
        LIMIT 10
      `);

      // Get RFP by stage
      const stageResult = await pool.query(`
        SELECT
          stage,
          COUNT(*) as count,
          AVG(CAST(value AS NUMERIC)) as avg_value
        FROM rfps
        WHERE is_archived = false
        GROUP BY stage
        ORDER BY stage
      `);

      res.status(200).json({
        success: true,
        data: {
          statistics: statsResult.rows[0],
          winRate: parseFloat(winRateResult.rows[0]?.win_rate || 0).toFixed(2),
          topLossReasons: lossReasonsResult.rows,
          byStage: stageResult.rows
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
