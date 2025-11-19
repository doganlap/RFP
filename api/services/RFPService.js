// RFP Service - handles RFP operations
const crypto = require('crypto');

class RFPService {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Paginated list of RFPs with optional filters
   */
  async getRFPs({ tenant_id, page = 1, limit = 20, filters = {} }) {
    const where = ['r.tenant_id = $1'];
    const params = [tenant_id];
    let paramIndex = params.length + 1;

    if (filters.status) {
      where.push(`r.status = $${paramIndex++}`);
      params.push(filters.status);
    }

    if (filters.client_id) {
      where.push(`r.client_id = $${paramIndex++}`);
      params.push(filters.client_id);
    }

    const offset = (page - 1) * limit;
    const query = `
      SELECT r.*, c.name AS client_name
      FROM rfps r
      LEFT JOIN clients c ON c.id = r.client_id
      WHERE ${where.join(' AND ')}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex}
    `;

    params.push(limit, offset);

    const [rowsResult, countResult] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query(
        `SELECT COUNT(*) FROM rfps r WHERE ${where.join(' AND ')}`,
        params.slice(0, params.length - 2) // remove limit/offset
      )
    ]);

    return {
      items: rowsResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit
    };
  }

  /**
   * Get single RFP with client metadata
   */
  async getRFPById(id, tenantId) {
    const query = `
      SELECT r.*, c.name AS client_name
      FROM rfps r
      LEFT JOIN clients c ON c.id = r.client_id
      WHERE r.id = $1 AND r.tenant_id = $2
      LIMIT 1
    `;
    const result = await this.pool.query(query, [id, tenantId]);
    return result.rows[0];
  }

  /**
   * Create new RFP. Missing supporting entities (client) are created on the fly.
   */
  async createRFP(rfpData) {
    const clientId = await this.ensureClient(
      rfpData.tenant_id,
      rfpData.client_id,
      rfpData.clientName || rfpData.client
    );

    const result = await this.pool.query(
      `
        INSERT INTO rfps (
          tenant_id,
          rfp_number,
          title,
          client_id,
          status,
          estimated_value,
          currency,
          submission_deadline,
          duration_months,
          category,
          priority,
          metadata,
          tags,
          source_crm_id,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, NOW(), NOW()
        )
        RETURNING *
      `,
      [
        rfpData.tenant_id,
        rfpData.rfp_number || this.generateRfpNumber(),
        rfpData.title,
        clientId,
        rfpData.status || 'intake',
        rfpData.estimatedValue || 0,
        rfpData.currency || 'USD',
        rfpData.submissionDeadline || null,
        rfpData.durationMonths || 12,
        rfpData.category || 'General',
        rfpData.priority || 'medium',
        rfpData.metadata || {},
        rfpData.tags || [],
        rfpData.sourceCrmId || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Update RFP
   */
  async updateRFP(id, updates, user) {
    const normalizedUpdates = await this.normalizeUpdates(user.tenant_id, updates);

    if (!Object.keys(normalizedUpdates).length) {
      return this.getRFPById(id, user.tenant_id);
    }

    const setFragments = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(normalizedUpdates).forEach(([key, value]) => {
      setFragments.push(`${key} = $${paramIndex++}`);
      values.push(value);
    });

    values.push(id, user.tenant_id);

    const result = await this.pool.query(
      `
        UPDATE rfps
        SET ${setFragments.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex}
        RETURNING *
      `,
      values
    );

    return result.rows[0];
  }

  /**
   * Move RFP between workflow stages
   */
  async transitionState(id, toState, user, notes) {
    const existing = await this.getRFPById(id, user.tenant_id);
    if (!existing) {
      throw new Error('RFP not found');
    }

    if (existing.status === toState) {
      return {
        from_state: existing.status,
        to_state: toState,
        rfp: existing
      };
    }

    const result = await this.pool.query(
      `
        UPDATE rfps
        SET status = $1, updated_at = NOW(), metadata = metadata || jsonb_build_object('lastTransitionNote', $4)
        WHERE id = $2 AND tenant_id = $3
        RETURNING *
      `,
      [toState, id, user.tenant_id, notes || null]
    );

    if (!result.rows.length) {
      throw new Error('RFP not found');
    }

    return {
      from_state: existing.status,
      to_state: toState,
      rfp: result.rows[0]
    };
  }

  /**
   * High-level dashboard stats
   */
  async getDashboardAnalytics(tenantId) {
    const [totals, statusCounts, valueSummary] = await Promise.all([
      this.pool.query(
        'SELECT COUNT(*)::int AS total, MIN(created_at) AS oldest_created_at FROM rfps WHERE tenant_id = $1',
        [tenantId]
      ),
      this.pool.query(
        `SELECT status, COUNT(*)::int AS count
         FROM rfps
         WHERE tenant_id = $1
         GROUP BY status`,
        [tenantId]
      ),
      this.pool.query(
        `SELECT
            COALESCE(SUM(estimated_value), 0)::numeric AS total_value,
            COALESCE(AVG(estimated_value), 0)::numeric AS avg_value
         FROM rfps
         WHERE tenant_id = $1`,
        [tenantId]
      )
    ]);

    const byStatus = statusCounts.rows.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    return {
      totalRfps: totals.rows[0].total || 0,
      byStatus,
      oldestRfpCreatedAt: totals.rows[0].oldest_created_at,
      totalPipelineValue: Number(valueSummary.rows[0].total_value),
      averageDealSize: Number(valueSummary.rows[0].avg_value)
    };
  }

  async ensureClient(tenantId, clientId, clientName) {
    if (clientId) {
      return clientId;
    }

    if (!clientName) {
      throw new Error('Client information is required');
    }

    const existing = await this.pool.query(
      `SELECT id FROM clients WHERE tenant_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1`,
      [tenantId, clientName]
    );

    if (existing.rows.length) {
      return existing.rows[0].id;
    }

    const created = await this.pool.query(
      `
        INSERT INTO clients (tenant_id, name, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        RETURNING id
      `,
      [tenantId, clientName]
    );

    return created.rows[0].id;
  }

  async normalizeUpdates(tenantId, updates = {}) {
    const mapped = {};
    const fieldMap = {
      title: 'title',
      status: 'status',
      estimatedValue: 'estimated_value',
      estimated_value: 'estimated_value',
      currency: 'currency',
      submissionDeadline: 'submission_deadline',
      submission_deadline: 'submission_deadline',
      duration: 'duration_months',
      durationMonths: 'duration_months',
      duration_months: 'duration_months',
      category: 'category',
      priority: 'priority',
      goNoGoScore: 'go_no_go_score',
      go_no_go_score: 'go_no_go_score',
      goNoGoDecision: 'go_no_go_decision',
      go_no_go_decision: 'go_no_go_decision',
      solutionSummary: 'solution_summary',
      pricingStrategy: 'pricing_strategy',
      winThemes: 'win_themes',
      metadata: 'metadata',
      tags: 'tags',
      sourceCrmId: 'source_crm_id'
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) continue;

      if (key === 'client_id' || key === 'clientId' || key === 'client' || key === 'clientName') {
        mapped.client_id = await this.ensureClient(
          tenantId,
          updates.client_id || updates.clientId,
          updates.client || updates.clientName
        );
        continue;
      }

      const mappedKey = fieldMap[key];
      if (mappedKey) {
        mapped[mappedKey] = value;
      }
    }

    if (updates.duration && !updates.durationMonths) {
      const match = updates.duration.match(/(\d+)/);
      if (match) {
        mapped.duration_months = parseInt(match[1], 10);
      }
    }

    return mapped;
  }

  generateRfpNumber() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `RFP-${now.getFullYear()}${month}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  }
}

module.exports = RFPService;
