// RFP Service - handles RFP operations
class RFPService {
  constructor(pool) {
    this.pool = pool;
  }

  async getRFPs(tenantId, filters = {}) {
    const query = 'SELECT * FROM rfps WHERE tenant_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [tenantId]);
    return result.rows;
  }

  async getRFPById(id, tenantId) {
    const query = 'SELECT * FROM rfps WHERE id = $1 AND tenant_id = $2';
    const result = await this.pool.query(query, [id, tenantId]);
    return result.rows[0];
  }

  async createRFP(tenantId, rfpData) {
    const query = `
      INSERT INTO rfps (
        tenant_id, rfp_number, title, client_id, status,
        estimated_value, currency, submission_deadline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await this.pool.query(query, [
      tenantId,
      rfpData.rfpNumber,
      rfpData.title,
      rfpData.clientId,
      rfpData.status || 'intake',
      rfpData.estimatedValue,
      rfpData.currency || 'USD',
      rfpData.submissionDeadline
    ]);
    return result.rows[0];
  }

  async updateRFP(id, tenantId, rfpData) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.keys(rfpData).forEach((key) => {
      updates.push(`${key} = $${paramCount}`);
      values.push(rfpData[key]);
      paramCount++;
    });

    values.push(id);
    values.push(tenantId);

    const query = `
      UPDATE rfps
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount} AND tenant_id = $${paramCount + 1}
      RETURNING *
    `;
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = RFPService;
