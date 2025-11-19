// Vercel API Route - User Registration
// /api/auth/register.js

const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Hash token for secure storage
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Generate verification token
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = async (req, res) => {
  // CORS headers - SECURITY: Use environment variable for allowed origins
  const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Validation
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
          error: 'Email, password, firstName, and lastName are required'
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          error: 'Password must be at least 8 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Default role for new users
      const userRole = role || 'sales_rep';

      // Create new user with is_active = false until email is verified
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, name, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, false, NOW(), NOW())
         RETURNING id, email, name, role`,
        [email.toLowerCase(), passwordHash, `${firstName} ${lastName}`, userRole]
      );

      const user = result.rows[0];

      // Generate email verification token
      const verificationToken = generateVerificationToken();
      const tokenHash = hashToken(verificationToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store verification token
      await pool.query(
        `INSERT INTO email_verification_tokens (user_id, email, token_hash, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [user.id, email.toLowerCase(), tokenHash, expiresAt]
      );

      // Check JWT_SECRET
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          error: 'Server configuration error: JWT_SECRET not set'
        });
      }

      // Generate JWT token (even though user is not yet active)
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
      );

      // Send verification email
      const EmailService = require('../services/EmailService');
      try {
        await EmailService.sendVerificationEmail(email, verificationToken);
      } catch (emailError) {
        console.error('Email send error (non-blocking):', emailError);
        // Don't fail registration if email fails - token is logged
      }
      // For development, also log the token
      if (process.env.NODE_ENV === 'development') {
        console.log(`Email verification token for ${email}: ${verificationToken}`);
      }

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: 'Registration successful. Please check your email to verify your account.',
        // In development only:
        ...(process.env.NODE_ENV === 'development' && { verificationToken }),
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Registration failed'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
