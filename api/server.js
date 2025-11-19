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
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

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
  region: process.env.AWS_REGION || 'us-east-1'
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
      Bucket: process.env.AWS_S3_BUCKET || 'rfp-platform-documents',
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ServerSideEncryption: 'AES256'
    }).promise();

    // Save document record
    const document = await rfpService.createDocument({
      rfp_id: req.params.rfpId,
      filename: s3Key,
      original_filename: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      storage_path: uploadResult.Location,
      uploaded_by: req.user.id,
      document_type: req.body.document_type || 'general'
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Upload document error:', error);
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
