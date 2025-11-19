import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const app = express();
app.use(express.json());

const options = {
  definition: { openapi: '3.0.3', info: { title: 'Decision API', version: '0.2.0' } },
  apis: ['./src/index.js']
};
const spec = swaggerJSDoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
app.get('/openapi.json', (_req,res)=>res.json(spec));

/**
 * @openapi
 * /decide:
 *   post:
 *     summary: Bid/No-Bid/Review decision from total score
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               total: { type: number }
 *     responses:
 *       200: { description: Decision }
 */
app.post('/decide', (req, res) => {
  const total = Number(req.body?.total || 0);
  let decision = 'REVIEW';
  let rationale = 'Needs human review';
  if (total >= 0.7) { decision = 'BID'; rationale = 'High expected win probability'; }
  else if (total < 0.5) { decision = 'NO_BID'; rationale = 'Low strategic fit vs. effort'; }
  res.json({ decision, rationale });
});

const PORT = process.env.PORT || 7003;
app.listen(PORT, () => console.log(`decision on ${PORT}`));
