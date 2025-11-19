// Vercel API Route - Authentication
// /api/auth/login.js

const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const RateLimitService = require('../services/RateLimitService');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      // SECURITY: Check JWT_SECRET is configured
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          success: false,
          error: 'Server configuration error: JWT_SECRET not set'
        });
      }

      const { email, password } = req.body;
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // SECURITY: Check rate limiting
      const isRateLimited = await RateLimitService.isRateLimited(email, ipAddress);
      if (isRateLimited) {
        await RateLimitService.recordAttempt(
          email,
          ipAddress,
          false,
          'rate_limited',
          userAgent
        );
        const remainingAttempts = await RateLimitService.getRemainingAttempts(email, ipAddress);
        return res.status(429).json({
          error: 'Too many login attempts. Please try again later.',
          remainingAttempts,
        });
      }

      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        await RateLimitService.recordAttempt(
          email,
          ipAddress,
          false,
          'invalid_credentials',
          userAgent
        );
        const remainingAttempts = await RateLimitService.getRemainingAttempts(email, ipAddress);
        return res.status(401).json({
          error: 'Invalid credentials',
          remainingAttempts,
        });
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        await RateLimitService.recordAttempt(
          email,
          ipAddress,
          false,
          'invalid_password',
          userAgent
        );
        const remainingAttempts = await RateLimitService.getRemainingAttempts(email, ipAddress);
        return res.status(401).json({
          error: 'Invalid credentials',
          remainingAttempts,
        });
      }

      // Record successful login
      await RateLimitService.recordAttempt(
        email,
        ipAddress,
        true,
        null,
        userAgent
      );

      // Clear failed attempts on successful login
      await RateLimitService.clearAttempts(email, ipAddress);

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
      );

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
