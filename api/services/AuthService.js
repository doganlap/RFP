// Auth Service - handles authentication and JWT tokens
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'dev-secret-key';
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
