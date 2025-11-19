import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const app = express();
app.use(express.json());

const options = {
  definition: { openapi: '3.0.3', info: { title: 'Scoring API', version: '0.2.0' } },
  apis: ['./src/index.js']
};
const spec = swaggerJSDoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
app.get('/openapi.json', (_req,res)=>res.json(spec));

/**
 * @openapi
 * /score:
 *   post:
 *     summary: Compute weighted score (Fit/Complexity/Competitive)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               evaluationCriteria:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     criterion: { type: string }
 *                     weight: { type: number }
 *     responses:
 *       200: { description: Score }
 */
app.post('/score', (req, res) => {
  const weights = req.body?.evaluationCriteria || [];
  const fit = 0.76, complexity = 0.55, competitive = 0.62;
  const wFit = (weights.find(c=>c.criterion==='Fit')?.weight ?? 0.4);
  const wComp = (weights.find(c=>c.criterion==='Complexity')?.weight ?? 0.3);
  const wCompetitive = (weights.find(c=>c.criterion==='Competitive')?.weight ?? 0.3);
  const total = fit*wFit + complexity*wComp + competitive*wCompetitive;
  res.json({ fit, complexity, competitive, total: Number(total.toFixed(4)) });
});

const PORT = process.env.PORT || 7002;
app.listen(PORT, () => console.log(`scoring on ${PORT}`));
