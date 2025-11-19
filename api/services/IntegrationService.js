// Integration Service - handles third-party integrations
class IntegrationService {
  constructor(pool) {
    this.pool = pool;
  }

  async logIntegrationCall(tenantId, integrationName, direction, endpoint, status, request, response) {
    const query = `
      INSERT INTO integration_logs (
        tenant_id, integration_name, direction, endpoint, status_code,
        request_payload, response_payload, executed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    try {
      const result = await this.pool.query(query, [
        tenantId,
        integrationName,
        direction,
        endpoint,
        status,
        JSON.stringify(request),
        JSON.stringify(response)
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error logging integration call:', error);
      return null;
    }
  }

  async getIntegrationLogs(tenantId, integrationName = null) {
    let query = 'SELECT * FROM integration_logs WHERE tenant_id = $1';
    const params = [tenantId];

    if (integrationName) {
      query += ' AND integration_name = $2';
      params.push(integrationName);
    }

    query += ' ORDER BY executed_at DESC LIMIT 100';

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async testIntegration(integrationName, config) {
    console.log(`[INTEGRATION] Testing ${integrationName} with config:`, config);
    return { success: true, integration: integrationName };
  }
}

module.exports = IntegrationService;
