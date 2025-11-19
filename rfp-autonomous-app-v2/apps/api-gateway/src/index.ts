import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { mountSwagger } from './swagger.js';
import { embed } from './embedding.js';
import { ensureCollection, upsertQdrant, searchQdrant } from './qdrant.js';
import { z } from 'zod';
import { pool } from './db.js';
import { rfpQueue, registerWorker } from './queue.js';
import type { ParsedRFP, ValidationResult, ScoreResult, DecisionResult } from './types.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Swagger
mountSwagger(app);

const PARSER_URL = process.env.PARSER_URL || 'http://localhost:8000';
const VALIDATOR_URL = process.env.VALIDATOR_URL || 'http://localhost:8001';
const SCORING_URL = process.env.SCORING_URL || 'http://localhost:7002';
const DECISION_URL = process.env.DECISION_URL || 'http://localhost:7003';

// ---- Routes ----
const UploadSchema = z.object({
  name: z.string().min(2),
  deadline: z.string().optional(),
  documentUrl: z.string().url().optional(),
});


/**
 * @openapi
 * /api/rfps/upload:
 *   post:
 *     summary: Upload/queue a new RFP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               deadline: { type: string, format: date-time }
 *               documentUrl: { type: string, format: uri }
 *     responses:
 *       200: { description: Queued }
 */

app.post('/api/rfps/upload', async (req, res) => {
  try {
    const body = UploadSchema.parse(req.body);
    const { rows } = await pool.query(
      'INSERT INTO rfps (name, deadline, document_url, status) VALUES ($1, $2, $3, $4) RETURNING id',
      [body.name, body.deadline ?? null, body.documentUrl ?? null, 'QUEUED']
    );
    const id = rows[0].id;
    await rfpQueue.add('process', { rfpId: id });
    res.json({ id, status: 'QUEUED' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});


/**
 * @openapi
 * /api/rfps/{id}/analysis:
 *   get:
 *     summary: Get latest analysis for an RFP
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Latest analysis or PENDING }
 */
app.get('/api/rfps/:id/analysis', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { rows } = await pool.query('SELECT * FROM rfp_analysis WHERE rfp_id=$1 ORDER BY id DESC LIMIT 1', [id]);
  if (!rows.length) return res.json({ status: 'PENDING' });
  res.json(rows[0]);
});


/**
 * @openapi
 * /api/rfps/dashboard/summary:
 *   get:
 *     summary: Dashboard summary (counts by decision)
 *     responses:
 *       200: { description: Summary }
 */
app.get('/api/rfps/dashboard/summary', async (_req, res) => {
  const q1 = pool.query('SELECT COUNT(*) as total FROM rfps');
  const q2 = pool.query("SELECT COUNT(*) as analyzed FROM rfp_analysis");
  const q3 = pool.query("SELECT decision, COUNT(*) FROM rfp_analysis GROUP BY decision");
  const [a, b, c] = await Promise.all([q1, q2, q3]);
  res.json({
    totalRFPs: Number(a.rows[0].total || 0),
    analyzed: Number(b.rows[0].analyzed || 0),
    byDecision: c.rows.reduce((acc: any, r: any) => { acc[r.decision || 'UNKNOWN'] = Number(r.count); return acc; }, {}),
  });
});


/**
 * @openapi
 * /api/clauses/index:
 *   post:
 *     summary: Index clauses for semantic search
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rfpId: { type: integer }
 *               clauses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     section: { type: string }
 *                     text: { type: string }
 *     responses:
 *       200: { description: Indexed }
 */
app.post('/api/clauses/index', async (req, res) => {
  const { rfpId, clauses } = req.body || {};
  if (!rfpId || !Array.isArray(clauses)) return res.status(400).json({ error: 'rfpId and clauses[] required' });
  const dim = parseInt(process.env.EMBED_DIM || '384', 10);
  const useQdrant = process.env.USE_QDRANT === '1';
  if (useQdrant) await ensureCollection(dim);
  // insert to pg + (optionally) qdrant
  for (const c of clauses) {
    const v = embed(String(c.text), dim);
    await pool.query(
      'INSERT INTO rfp_clauses (rfp_id, section, text, embedding) VALUES ($1,$2,$3,$4)',
      [rfpId, c.section || null, c.text, v]
    );
    if (useQdrant) {
      await upsertQdrant([{ id: `${rfpId}-${Math.random()}`, vector: v, payload: { rfpId, section: c.section, text: c.text } }]);
    }
  }
  res.json({ indexed: clauses.length, engine: useQdrant ? 'qdrant' : 'pgvector' });
});

/**
 * @openapi
 * /api/search/clauses:
 *   post:
 *     summary: Semantic search over indexed clauses
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query: { type: string }
 *               rfpId: { type: integer, nullable: true }
 *               topK: { type: integer, default: 5 }
 *     responses:
 *       200: { description: Search results }
 */
app.post('/api/search/clauses', async (req, res) => {
  const { query, rfpId, topK = 5 } = req.body || {};
  if (!query) return res.status(400).json({ error: 'query is required' });
  const dim = parseInt(process.env.EMBED_DIM || '384', 10);
  const qvec = embed(String(query), dim);

  // Qdrant path
  if (process.env.USE_QDRANT === '1') {
    const filter = rfpId ? { must: [{ key: 'rfpId', match: { value: rfpId } }] } : undefined;
    const results = await searchQdrant(qvec, topK, filter);
    return res.json({ engine: 'qdrant', results });
  }

  // pgvector path
  // Convert JS array to pgvector literal like '[a,b,c]'
  const literal = '[' + qvec.map(x => Number(x).toFixed(6)).join(',') + ']';
  let sql = "SELECT id, rfp_id, section, text, 1 - (embedding <=> $1) AS score FROM rfp_clauses";
  const params: any[] = [literal];
  if (rfpId) { sql += " WHERE rfp_id = $2"; params.push(rfpId); }
  sql += " ORDER BY embedding <-> $1 ASC LIMIT " + Number(topK);
  const { rows } = await pool.query(sql, params);
  res.json({ engine: 'pgvector', results: rows });
});

// ---- Orchestrator Worker ----
registerWorker(async (job) => {
  const { rfpId } = job.data as { rfpId: number };
  // get basic RFP
  const { rows } = await pool.query('SELECT * FROM rfps WHERE id=$1', [rfpId]);
  if (!rows.length) return;
  const rfp = rows[0];

  // 1) Parse
  const parsed = await axios.post<ParsedRFP>(`${PARSER_URL}/parse`, {
    rfpId, name: rfp.name, documentUrl: rfp.document_url
  }).then(r => r.data);

  
  // 1.5) Extract naive clauses from sections and index (one sentence per line)
  const clauses: Array<{section: string, text: string}> = [];
  Object.entries(parsed.sections || {}).forEach(([section, content]: any) => {
    String(content).split(/(?<=[.!؟])\s+/).forEach((sent: string) => {
      if (sent && sent.length > 3) clauses.push({ section, text: sent.trim() });
    });
  });
  if (clauses.length) {
    await axios.post(`${process.env.USE_QDRANT==='1' ? 'http://localhost:'+ (process.env.PORT||'8080') : 'http://localhost:'+ (process.env.PORT||'8080')}/api/clauses/index`, {
      rfpId, clauses
    });
  }

  // 2) Validate
  const validation = await axios.post<ValidationResult>(`${VALIDATOR_URL}/validate`, parsed).then(r => r.data);

  // 3) Score
  const score = await axios.post<ScoreResult>(`${SCORING_URL}/score`, {
    evaluationCriteria: parsed.evaluationCriteria
  }).then(r => r.data);

  // 4) Decide
  const decision = await axios.post<DecisionResult>(`${DECISION_URL}/decide`, { total: score.total }).then(r => r.data);

  // Persist analysis
  await pool.query(
    'INSERT INTO rfp_analysis (rfp_id, parsed, validation, score, decision, rationale) VALUES ($1, $2, $3, $4, $5, $6)',
    [rfpId, parsed, validation, score.total, decision.decision, decision.rationale]
  );
  await pool.query('UPDATE rfps SET status=$1, updated_at=now() WHERE id=$2', ['ANALYZED', rfpId]);
});

const port = parseInt(process.env.PORT || '8080', 10);
app.listen(port, () => {
  console.log(`api-gateway listening on ${port}`);
});
