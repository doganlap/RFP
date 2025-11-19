// Rate Limiting Service for Login Attempts
// /api/services/RateLimitService.js

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

class RateLimitService {
  // Maximum login attempts before lockout
  static MAX_ATTEMPTS = 5;

  // Time window in minutes
  static TIME_WINDOW = 15;

  // Lockout duration in minutes
  static LOCKOUT_DURATION = 30;

  /**
   * Check if an IP/email is rate limited
   */
  static async isRateLimited(email, ipAddress) {
    const timeAgo = new Date(Date.now() - this.TIME_WINDOW * 60 * 1000);

    const result = await pool.query(
      `SELECT COUNT(*) as attempt_count
       FROM login_attempts
       WHERE (email = $1 OR ip_address = $2::inet)
       AND attempted_at > $3
       AND success = false
       ORDER BY attempted_at DESC`,
      [email.toLowerCase(), ipAddress, timeAgo]
    );

    const attemptCount = parseInt(result.rows[0].attempt_count, 10);
    return attemptCount >= this.MAX_ATTEMPTS;
  }

  /**
   * Record a login attempt
   */
  static async recordAttempt(email, ipAddress, success, failureReason = null, userAgent = null) {
    await pool.query(
      `INSERT INTO login_attempts (email, ip_address, success, failure_reason, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        email.toLowerCase(),
        ipAddress,
        success,
        failureReason,
        userAgent,
      ]
    );
  }

  /**
   * Get remaining attempts for an email/IP
   */
  static async getRemainingAttempts(email, ipAddress) {
    const timeAgo = new Date(Date.now() - this.TIME_WINDOW * 60 * 1000);

    const result = await pool.query(
      `SELECT COUNT(*) as attempt_count
       FROM login_attempts
       WHERE (email = $1 OR ip_address = $2::inet)
       AND attempted_at > $3
       AND success = false`,
      [email.toLowerCase(), ipAddress, timeAgo]
    );

    const attemptCount = parseInt(result.rows[0].attempt_count, 10);
    return Math.max(0, this.MAX_ATTEMPTS - attemptCount);
  }

  /**
   * Clear login attempts for successful login
   */
  static async clearAttempts(email, ipAddress) {
    await pool.query(
      `DELETE FROM login_attempts
       WHERE (email = $1 OR ip_address = $2::inet)
       AND success = false`,
      [email.toLowerCase(), ipAddress]
    );
  }

  /**
   * Get login history for a user
   */
  static async getLoginHistory(userId, limit = 10) {
    const result = await pool.query(
      `SELECT la.attempted_at, la.ip_address, la.user_agent, la.success, la.failure_reason
       FROM login_attempts la
       WHERE la.email = (SELECT email FROM users WHERE id = $1)
       ORDER BY la.attempted_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }
}

module.exports = RateLimitService;
