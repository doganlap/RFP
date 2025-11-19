// Auth Service - handles authentication and JWT tokens
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  constructor() {
    // SECURITY: Fail fast if JWT_SECRET is not set in production
    if (!process.env.JWT_SECRET) {
      throw new Error('FATAL: JWT_SECRET environment variable is not set. Authentication cannot proceed.');
    }
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiry = process.env.JWT_EXPIRY || '7d';
  }

  // Generate JWT token
  generateToken(userId, tenantId, role) {
    return jwt.sign(
      { userId, tenantId, role },
      this.jwtSecret,
      { expiresIn: this.jwtExpiry }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  // Hash password
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Verify password
  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

module.exports = new AuthService();
