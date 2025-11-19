// Vercel API Route - Task Management
// /api/tasks/index.js

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

  // GET - Fetch tasks for RFP
  if (req.method === 'GET') {
    try {
      const { rfpId, status } = req.query;

      if (!rfpId) {
        return res.status(400).json({ error: 'rfpId is required' });
      }

      let query = 'SELECT * FROM tasks WHERE rfp_id = $1';
      const params = [rfpId];

      if (status) {
        query += ' AND status = $2';
        params.push(status);
      }

      query += ' ORDER BY due_date ASC';

      const result = await pool.query(query, params);
      res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST - Create task
  else if (req.method === 'POST') {
    try {
      const { rfpId, title, description, assignedTo, dueDate, priority, status } = req.body;

      if (!rfpId || !title) {
        return res.status(400).json({ error: 'rfpId and title are required' });
      }

      const result = await pool.query(
        `INSERT INTO tasks (rfp_id, title, description, assigned_to, due_date, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [rfpId, title, description || null, assignedTo || null, dueDate || null, priority || 'medium', status || 'todo']
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT - Update task
  else if (req.method === 'PUT') {
    try {
      const { id, title, description, assignedTo, dueDate, priority, status } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      const result = await pool.query(
        `UPDATE tasks
         SET title = $1, description = $2, assigned_to = $3, due_date = $4, priority = $5, status = $6, updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [title, description, assignedTo, dueDate, priority, status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE - Delete task
  else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
      res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
