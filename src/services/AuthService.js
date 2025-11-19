// Enterprise Authentication Service
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthService {
  constructor() {
    const clientSecret = import.meta.env.VITE_AUTH_JWT_SECRET;
    if (!clientSecret) {
      throw new Error('VITE_AUTH_JWT_SECRET is required for AuthService initialization.');
    }
    this.jwtSecret = clientSecret;
    this.jwtExpiry = import.meta.env.VITE_AUTH_JWT_EXPIRY || '24h';
  }

  // User Roles and Permissions
  static ROLES = {
    ADMIN: 'admin',
    SALES_REP: 'sales_rep',
    SALES_MANAGER: 'sales_manager',
    PRESALES_LEAD: 'presales_lead',
    SOLUTION_ARCHITECT: 'solution_architect',
    PRICING_FINANCE: 'pricing_finance',
    LEGAL_CONTRACTS: 'legal_contracts',
    COMPLIANCE_GRC: 'compliance_grc',
    PMO: 'pmo'
  };

  static PERMISSIONS = {
    // RFP Permissions
    'rfp.read': ['admin', 'sales_rep', 'sales_manager', 'presales_lead', 'solution_architect', 'pricing_finance', 'legal_contracts', 'compliance_grc', 'pmo'],
    'rfp.create': ['admin', 'sales_rep', 'sales_manager'],
    'rfp.edit': ['admin', 'sales_rep', 'sales_manager', 'presales_lead'],
    'rfp.delete': ['admin', 'sales_manager'],
    
    // Go/No-Go Permissions
    'go_no_go.submit': ['admin', 'sales_rep', 'sales_manager'],
    'go_no_go.approve': ['admin', 'sales_manager'],
    
    // Team Management
    'team.assign': ['admin', 'sales_manager', 'presales_lead'],
    'team.view': ['admin', 'sales_manager', 'presales_lead', 'pmo'],
    
    // Solution Development
    'solution.plan': ['admin', 'presales_lead', 'solution_architect'],
    'boq.edit': ['admin', 'solution_architect'],
    'arch.review': ['admin', 'solution_architect', 'presales_lead'],
    'compliance.map': ['admin', 'solution_architect', 'compliance_grc'],
    
    // Pricing
    'pricing.model': ['admin', 'pricing_finance'],
    'discount.request': ['admin', 'pricing_finance', 'sales_manager'],
    'pricing.approve': ['admin', 'pricing_finance'],
    
    // Legal
    'legal.clauses': ['admin', 'legal_contracts'],
    'deviation.register': ['admin', 'legal_contracts'],
    'legal.approve': ['admin', 'legal_contracts'],
    
    // Compliance
    'compliance.review': ['admin', 'compliance_grc'],
    'evidence.attach': ['admin', 'compliance_grc', 'solution_architect'],
    'compliance.approve': ['admin', 'compliance_grc'],
    
    // Approvals
    'approval.tech.sign': ['admin', 'presales_lead'],
    'approval.finance.sign': ['admin', 'pricing_finance'],
    'approval.legal.sign': ['admin', 'legal_contracts'],
    'approval.grc.sign': ['admin', 'compliance_grc'],
    
    // Proposal
    'proposal.view': ['admin', 'sales_rep', 'sales_manager', 'presales_lead', 'solution_architect', 'pricing_finance', 'legal_contracts', 'compliance_grc'],
    'proposal.edit': ['admin', 'presales_lead', 'solution_architect'],
    'proposal.tech_signoff': ['admin', 'presales_lead'],
    
    // Clarifications
    'clarification.raise': ['admin', 'sales_rep', 'presales_lead', 'solution_architect'],
    'clarification.answer': ['admin', 'sales_rep', 'sales_manager'],
    
    // Tasks
    'task.create': ['admin', 'sales_manager', 'presales_lead', 'pmo'],
    'task.assign': ['admin', 'sales_manager', 'presales_lead', 'pmo'],
    'task.view': ['admin', 'sales_rep', 'sales_manager', 'presales_lead', 'solution_architect', 'pricing_finance', 'legal_contracts', 'compliance_grc', 'pmo'],
    
    // SLA & Monitoring
    'sla.view': ['admin', 'sales_manager', 'presales_lead', 'pmo'],
    'sla.override': ['admin', 'pmo'],
    'kpi.view': ['admin', 'sales_manager', 'presales_lead', 'pmo'],
    'report.publish': ['admin', 'pmo'],
    
    // Admin
    'user.manage': ['admin'],
    'system.configure': ['admin']
  };

  // Generate JWT Token
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: this.getUserPermissions(user.role),
      tenant_id: user.tenant_id
    };
    
    return jwt.sign(payload, this.jwtSecret, { 
      expiresIn: this.jwtExpiry,
      issuer: 'rfp-platform',
      audience: 'rfp-users'
    });
  }

  // Verify JWT Token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Hash Password
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify Password
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Get User Permissions
  getUserPermissions(role) {
    const permissions = [];
    for (const [permission, allowedRoles] of Object.entries(AuthService.PERMISSIONS)) {
      if (allowedRoles.includes(role)) {
        permissions.push(permission);
      }
    }
    return permissions;
  }

  // Check Permission
  hasPermission(user, permission) {
    return user.permissions && user.permissions.includes(permission);
  }

  // Multi-tenant Authorization
  canAccessResource(user, resource) {
    // Check if user belongs to the same tenant as the resource
    return user.tenant_id === resource.tenant_id;
  }

  // SSO Integration (Azure AD example)
  async authenticateWithAzureAD(accessToken) {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Azure AD authentication failed');
      }
      
      const azureUser = await response.json();
      
      // Map Azure AD user to our user model
      const user = {
        id: azureUser.id,
        email: azureUser.mail || azureUser.userPrincipalName,
        name: azureUser.displayName,
        role: this.mapAzureRoleToAppRole(azureUser),
        tenant_id: this.extractTenantFromEmail(azureUser.mail),
        provider: 'azure_ad',
        external_id: azureUser.id
      };
      
      return this.generateToken(user);
    } catch (error) {
      throw new Error(`SSO authentication failed: ${error.message}`);
    }
  }

  // Map Azure AD roles to application roles
  mapAzureRoleToAppRole(azureUser) {
    // This would typically be configured in your Azure AD app registration
    const roleMapping = {
      'RFP_Admin': AuthService.ROLES.ADMIN,
      'Sales_Rep': AuthService.ROLES.SALES_REP,
      'Sales_Manager': AuthService.ROLES.SALES_MANAGER,
      'PreSales_Lead': AuthService.ROLES.PRESALES_LEAD,
      'Solution_Architect': AuthService.ROLES.SOLUTION_ARCHITECT,
      'Finance_Analyst': AuthService.ROLES.PRICING_FINANCE,
      'Legal_Counsel': AuthService.ROLES.LEGAL_CONTRACTS,
      'Compliance_Officer': AuthService.ROLES.COMPLIANCE_GRC,
      'PMO_Manager': AuthService.ROLES.PMO
    };
    
    // Default to sales_rep if no specific role found
    return roleMapping[azureUser.jobTitle] || AuthService.ROLES.SALES_REP;
  }

  // Extract tenant ID from email domain
  extractTenantFromEmail(email) {
    if (!email) return 'default';
    const domain = email.split('@')[1];
    // Map domains to tenant IDs
    const tenantMapping = {
      'jpmorgan.com': 'jpmorgan',
      'goldmansachs.com': 'goldman',
      'bankofamerica.com': 'bofa',
      'wellsfargo.com': 'wells'
    };
    return tenantMapping[domain] || 'default';
  }

  // Session Management
  async createSession(user, deviceInfo) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      user_id: user.id,
      device_info: deviceInfo,
      ip_address: deviceInfo.ip,
      user_agent: deviceInfo.userAgent,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      is_active: true
    };
    
    // Store session in database/Redis
    await this.storeSession(session);
    return sessionId;
  }

  generateSessionId() {
    return require('crypto').randomBytes(32).toString('hex');
  }

  async storeSession(session) {
    // Implementation would store in Redis or database
    console.log('Session stored:', session.id);
  }

  // Audit Logging
  async logAuthEvent(event, user, details = {}) {
    const auditLog = {
      event_type: event,
      user_id: user?.id,
      user_email: user?.email,
      tenant_id: user?.tenant_id,
      ip_address: details.ip_address,
      user_agent: details.user_agent,
      timestamp: new Date(),
      details: details
    };
    
    // Store audit log
    await this.storeAuditLog(auditLog);
  }

  async storeAuditLog(auditLog) {
    // Implementation would store in database
    console.log('Audit log:', auditLog);
  }
}

export default AuthService;
