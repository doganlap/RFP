// Enterprise RFP Platform API Server
// Node.js + Express + PostgreSQL

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const AWS = require('aws-sdk');
const Redis = require('redis');
const WebSocket = require('ws');
const http = require('http');

// Import services
const authService = require('./services/AuthService');
const RFPService = require('./services/RFPService');
const TaskService = require('./services/TaskService');
const notificationService = require('./services/NotificationService');
const AuditService = require('./services/AuditService');
const IntegrationService = require('./services/IntegrationService');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Environment configuration
const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = requireEnv('JWT_SECRET');
const AWS_REGION = requireEnv('AWS_REGION');
const AWS_S3_BUCKET = requireEnv('AWS_S3_BUCKET');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/rfp_platform',
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis connection for caching and sessions
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// AWS S3 for file storage
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
});

// WebSocket server for real-time features
const wss = new WebSocket.Server({ server });

// Initialize services
const rfpService = new RFPService(pool);
const taskService = new TaskService(pool);
const auditService = new AuditService(pool);
const integrationService = new IntegrationService(pool);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"]
    }
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000, // requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await authService.getUserById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid token or user inactive.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Authorization middleware
const authorize = (permission) => {
  return (req, res, next) => {
    if (!authService.hasPermission(req.user, permission)) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.',
        required_permission: permission
      });
    }
    next();
  };
};

// Audit middleware
const auditMiddleware = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      // Log the action after response
      auditService.logAction({
        user_id: req.user?.id,
        action: action,
        resource_type: req.route?.path?.split('/')[1] || 'unknown',
        resource_id: req.params.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        request_data: req.body,
        response_status: res.statusCode
      });

      originalSend.call(this, data);
    };
    next();
  };
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'RFP Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/*',
      rfps: '/api/rfps/*',
      tasks: '/api/tasks/*',
      clarifications: '/api/clarifications/*',
      documents: '/api/documents/*',
      analytics: '/api/analytics/*'
    }
  });
});

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await authService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    const token = authService.generateToken(user);
    const sessionId = await authService.createSession(user, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    await auditService.logAction({
      user_id: user.id,
      action: 'login',
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      token,
      sessionId,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: authService.getUserPermissions(user.role)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SSO Login (Azure AD)
app.post('/api/auth/sso/azure', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const token = await authService.authenticateWithAzureAD(accessToken);

    res.json({ token });
  } catch (error) {
    console.error('SSO login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Logout
app.post('/api/auth/logout', authenticate, async (req, res) => {
  try {
    const sessionId = req.header('X-Session-ID');
    if (sessionId) {
      await authService.invalidateSession(sessionId);
    }

    await auditService.logAction({
      user_id: req.user.id,
      action: 'logout',
      ip_address: req.ip
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      permissions: authService.getUserPermissions(req.user.role),
      tenant_id: req.user.tenant_id
    }
  });
});

// ==================== RFP ROUTES ====================

// Get all RFPs (with pagination and filtering)
app.get('/api/rfps', authenticate, authorize('rfp.read'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, client_id, assigned_to } = req.query;

    const rfps = await rfpService.getRFPs({
      tenant_id: req.user.tenant_id,
      page: parseInt(page),
      limit: parseInt(limit),
      filters: { status, client_id, assigned_to }
    });

    res.json(rfps);
  } catch (error) {
    console.error('Get RFPs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single RFP
app.get('/api/rfps/:id', authenticate, authorize('rfp.read'), async (req, res) => {
  try {
    const rfp = await rfpService.getRFPById(req.params.id, req.user.tenant_id);

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    res.json(rfp);
  } catch (error) {
    console.error('Get RFP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new RFP
app.post('/api/rfps', authenticate, authorize('rfp.create'), auditMiddleware('rfp_create'), async (req, res) => {
  try {
    const rfpData = {
      ...req.body,
      tenant_id: req.user.tenant_id,
      created_by: req.user.id
    };

    const rfp = await rfpService.createRFP(rfpData);

    // Send notifications to relevant team members
    await notificationService.notifyRFPCreated(rfp, req.user);

    res.status(201).json(rfp);
  } catch (error) {
    console.error('Create RFP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update RFP
app.put('/api/rfps/:id', authenticate, authorize('rfp.edit'), auditMiddleware('rfp_update'), async (req, res) => {
  try {
    const rfp = await rfpService.updateRFP(req.params.id, req.body, req.user);

    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    res.json(rfp);
  } catch (error) {
    console.error('Update RFP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transition RFP state
app.post('/api/rfps/:id/transition', authenticate, auditMiddleware('rfp_transition'), async (req, res) => {
  try {
    const { to_state, notes } = req.body;

    const result = await rfpService.transitionState(req.params.id, to_state, req.user, notes);

    // Send real-time update to connected clients
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'rfp_state_changed',
          rfp_id: req.params.id,
          from_state: result.from_state,
          to_state: to_state,
          user: req.user.name
        }));
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Transition RFP error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== TASK ROUTES ====================

// Get tasks for RFP
app.get('/api/rfps/:rfpId/tasks', authenticate, authorize('task.view'), async (req, res) => {
  try {
    const tasks = await taskService.getTasksByRFP(req.params.rfpId, req.user.tenant_id);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create task
app.post('/api/rfps/:rfpId/tasks', authenticate, authorize('task.create'), async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      rfp_id: req.params.rfpId,
      created_by: req.user.id
    };

    const task = await taskService.createTask(taskData);

    // Notify assignee
    if (task.assignee_id) {
      await notificationService.notifyTaskAssigned(task);
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task
app.put('/api/tasks/:id', authenticate, async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== DOCUMENT ROUTES ====================

// Upload document
app.post('/api/rfps/:rfpId/documents', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to S3
    const s3Key = `rfps/${req.params.rfpId}/documents/${Date.now()}-${req.file.originalname}`;

    const uploadResult = await s3.upload({
      Bucket: AWS_S3_BUCKET,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ServerSideEncryption: 'AES256'
    }).promise();

    // Calculate checksum
    const crypto = require('crypto');
    const checksum = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    // Save document record to PostgreSQL
    const documentResult = await pool.query(
      `INSERT INTO documents
       (tenant_id, rfp_id, filename, original_filename, file_size, mime_type,
        storage_path, document_type, checksum, uploaded_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING id, tenant_id, rfp_id, filename, original_filename, file_size,
                 mime_type, storage_path, document_type, version, checksum,
                 uploaded_by, created_at, updated_at`,
      [
        req.user.tenant_id,
        req.params.rfpId,
        s3Key,
        req.file.originalname,
        req.file.size,
        req.file.mimetype,
        uploadResult.Location,
        req.body.document_type || 'general',
        checksum,
        req.user.id
      ]
    );

    const document = documentResult.rows[0];

    // Log the upload
    await pool.query(
      `INSERT INTO document_access_logs
       (document_id, user_id, action, ip_address, user_agent, accessed_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        document.id,
        req.user.id,
        'upload',
        req.ip,
        req.get('User-Agent')
      ]
    );

    res.status(201).json(document);
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get document
app.get('/api/documents/:id', authenticate, async (req, res) => {
  try {
    const documentResult = await pool.query(
      `SELECT * FROM documents WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, req.user.tenant_id]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = documentResult.rows[0];

    // Check permission
    const canAccess =
      document.is_public ||
      document.uploaded_by === req.user.id ||
      req.user.role === 'admin';

    if (!canAccess) {
      // Check if user is assigned to the RFP
      const rfpAccessResult = await pool.query(
        `SELECT id FROM rfps
         WHERE id = $1 AND tenant_id = $2 AND (
           sales_rep_id = $3 OR sales_manager_id = $3 OR
           presales_lead_id = $3 OR solution_architect_id = $3
         )`,
        [document.rfp_id, req.user.tenant_id, req.user.id]
      );

      if (rfpAccessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Log the access
    await pool.query(
      `INSERT INTO document_access_logs
       (document_id, user_id, action, ip_address, user_agent, accessed_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        document.id,
        req.user.id,
        'view',
        req.ip,
        req.get('User-Agent')
      ]
    );

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download document
app.get('/api/documents/:id/download', authenticate, async (req, res) => {
  try {
    const documentResult = await pool.query(
      `SELECT * FROM documents WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, req.user.tenant_id]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = documentResult.rows[0];

    // Check permission
    const canAccess =
      document.is_public ||
      document.uploaded_by === req.user.id ||
      req.user.role === 'admin';

    if (!canAccess) {
      const rfpAccessResult = await pool.query(
        `SELECT id FROM rfps
         WHERE id = $1 AND tenant_id = $2 AND (
           sales_rep_id = $3 OR sales_manager_id = $3 OR
           presales_lead_id = $3 OR solution_architect_id = $3
         )`,
        [document.rfp_id, req.user.tenant_id, req.user.id]
      );

      if (rfpAccessResult.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Log the download
    await pool.query(
      `INSERT INTO document_access_logs
       (document_id, user_id, action, ip_address, user_agent, accessed_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        document.id,
        req.user.id,
        'download',
        req.ip,
        req.get('User-Agent')
      ]
    );

    // Generate signed URL
    const signedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: AWS_S3_BUCKET,
      Key: document.filename,
      Expires: 3600,
      ResponseContentDisposition: `attachment; filename="${document.original_filename}"`
    });

    res.json({
      downloadUrl: signedUrl,
      filename: document.original_filename,
      fileSize: document.file_size,
      mimeType: document.mime_type
    });
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search documents
app.get('/api/rfps/:rfpId/documents/search', authenticate, async (req, res) => {
  try {
    const { q, type, dateFrom, dateTo } = req.query;

    let sql = `SELECT id, rfp_id, original_filename, document_type, file_size,
                      mime_type, uploaded_by, created_at
               FROM documents
               WHERE rfp_id = $1 AND tenant_id = $2`;
    const params = [req.params.rfpId, req.user.tenant_id];
    let paramIndex = 3;

    // Full-text search
    if (q) {
      sql += ` AND original_filename ILIKE '%' || $${paramIndex} || '%'`;
      params.push(q);
      paramIndex++;
    }

    // Filter by type
    if (type) {
      sql += ` AND document_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    // Date range
    if (dateFrom) {
      sql += ` AND created_at >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }
    if (dateTo) {
      sql += ` AND created_at <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT 100`;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete document (soft delete)
app.delete('/api/documents/:id', authenticate, async (req, res) => {
  try {
    const documentResult = await pool.query(
      `SELECT * FROM documents WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, req.user.tenant_id]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = documentResult.rows[0];

    // Check permission - only uploader or admin can delete
    if (document.uploaded_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Soft delete: update deleted_at timestamp
    const deleteResult = await pool.query(
      `UPDATE documents
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING id, original_filename, status`,
      [req.params.id]
    );

    // Log the deletion
    await pool.query(
      `INSERT INTO document_access_logs
       (document_id, user_id, action, ip_address, user_agent, accessed_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        req.params.id,
        req.user.id,
        'delete',
        req.ip,
        req.get('User-Agent')
      ]
    );

    res.json({
      success: true,
      message: 'Document deleted successfully',
      document: deleteResult.rows[0]
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ANALYTICS ROUTES ====================

// Get dashboard analytics
app.get('/api/analytics/dashboard', authenticate, authorize('kpi.view'), async (req, res) => {
  try {
    const analytics = await rfpService.getDashboardAnalytics(req.user.tenant_id);
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== WEBSOCKET HANDLING ====================

wss.on('connection', (ws, req) => {
  console.log('WebSocket client connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join_rfp':
          ws.rfpId = data.rfp_id;
          ws.send(JSON.stringify({ type: 'joined', rfp_id: data.rfp_id }));
          break;

        case 'typing':
          // Broadcast typing indicator to other clients in the same RFP
          wss.clients.forEach(client => {
            if (client !== ws && client.rfpId === ws.rfpId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'user_typing',
                user: data.user,
                rfp_id: data.rfp_id
              }));
            }
          });
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large' });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV
  });
});

app.get('/health/detailed', async (req, res) => {
  try {
    const health = {
      status: 'unknown',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV,
      services: {}
    };

    // Check database
    try {
      await pool.query('SELECT NOW()');
      health.services.database = { status: 'healthy' };
    } catch (error) {
      health.services.database = { status: 'unhealthy', error: error.message };
    }

    // Check Redis
    try {
      await redis.ping();
      health.services.redis = { status: 'healthy' };
    } catch (error) {
      health.services.redis = { status: 'unhealthy', error: error.message };
    }

    // Check S3
    try {
      await s3.headBucket({ Bucket: AWS_S3_BUCKET }).promise();
      health.services.s3 = { status: 'healthy' };
    } catch (error) {
      health.services.s3 = { status: 'unhealthy', error: error.message };
    }

    // Determine overall status
    const allHealthy = Object.values(health.services).every(service => service.status === 'healthy');
    health.status = allHealthy ? 'healthy' : 'degraded';

    const statusCode = allHealthy ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');

  server.close(() => {
    console.log('HTTP server closed');
    pool.end();
    redis.quit();
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 RFP Platform API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
