import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import type { Express } from 'express';

export function mountSwagger(app: Express) {
  const options = {
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'RFP Autonomous Analytics API',
        version: '0.2.0'
      },
      servers: [{ url: 'http://localhost:' + (process.env.PORT || '8080') }],
    },
    apis: ['./src/index.ts'], // JSDoc annotations
  };
  const spec = swaggerJSDoc(options);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
  app.get('/openapi.json', (_req, res) => res.json(spec));
}
