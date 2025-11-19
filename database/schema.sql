-- Enterprise RFP Platform Database Schema
-- PostgreSQL 14+ with UUID extension
-- @mssql-ignore

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tenants table for multi-tenant architecture
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table with RBAC
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'admin', 'sales_rep', 'sales_manager', 'presales_lead',
        'solution_architect', 'pricing_finance', 'legal_contracts',
        'compliance_grc', 'pmo'
    )),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    external_id VARCHAR(255), -- For SSO integration
    provider VARCHAR(50) DEFAULT 'local', -- local, azure_ad, okta, etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for session management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens for secure password recovery
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email verification tokens for new registrations
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login attempt tracking for rate limiting and security
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    success BOOLEAN DEFAULT false,
    failure_reason VARCHAR(100),
    user_agent TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Account deactivation audit trail
CREATE TABLE account_deactivations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deactivated_by_user_id UUID REFERENCES users(id),
    reason VARCHAR(500),
    deactivated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reactivated_at TIMESTAMP WITH TIME ZONE,
    deleted_data_at TIMESTAMP WITH TIME ZONE
);

-- Documents table for RFP and proposal file management
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    document_type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (document_type IN (
        'general', 'rfp_document', 'proposal', 'presentation', 'technical_spec',
        'pricing_sheet', 'contract', 'compliance', 'support_doc'
    )),
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    checksum VARCHAR(255),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    search_text TSVECTOR,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document access audit log
CREATE TABLE document_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL CHECK (action IN ('view', 'download', 'upload', 'delete', 'share')),
    ip_address INET,
    user_agent TEXT,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    size VARCHAR(50), -- SMB, Mid-Market, Enterprise
    contact_info JSONB,
    relationship_manager_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFPs table - main entity
CREATE TABLE rfps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rfp_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id),
    status VARCHAR(50) NOT NULL DEFAULT 'intake' CHECK (status IN (
        'intake', 'go_no_go', 'planning', 'solutioning', 'pricing',
        'proposal_build', 'approvals', 'submission', 'post_bid',
        'won', 'lost', 'abandoned'
    )),
    estimated_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    submission_deadline TIMESTAMP WITH TIME ZONE,
    duration_months INTEGER,
    category VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),

    -- Team assignments
    sales_rep_id UUID REFERENCES users(id),
    sales_manager_id UUID REFERENCES users(id),
    presales_lead_id UUID REFERENCES users(id),
    solution_architect_id UUID REFERENCES users(id),

    -- Go/No-Go scoring
    go_no_go_score DECIMAL(3,1),
    go_no_go_decision VARCHAR(20) CHECK (go_no_go_decision IN ('go', 'no_go', 'pending')),
    go_no_go_notes TEXT,
    go_no_go_completed_at TIMESTAMP WITH TIME ZONE,

    -- Strategy and analysis
    solution_summary TEXT,
    pricing_strategy TEXT,
    win_themes TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source_crm_id VARCHAR(255) -- To link back to CRM Opportunity/Deal ID
);

-- Win/Loss Analysis table
CREATE TABLE win_loss_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('won', 'lost')),
    primary_reason TEXT NOT NULL,
    secondary_reasons TEXT[],
    competitors TEXT[],
    feedback TEXT,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analyzed_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration: Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL, -- e.g., 'rfp', 'task', 'document'
    resource_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For threading
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration: Mentions table
CREATE TABLE mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaboration: Discussions table
CREATE TABLE discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration Logs table
CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    integration_name VARCHAR(100) NOT NULL, -- e.g., 'Salesforce', 'Gmail', 'Slack'
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    endpoint TEXT,
    status_code INTEGER,
    request_payload JSONB,
    response_payload JSONB,
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DocuSign Signature Tracking table
CREATE TABLE docusign_envelopes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rfp_id UUID NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
    document_id UUID, -- Link to a document table if it exists
    envelope_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'sent', 'delivered', 'completed'
    signer_email VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index creation for performance
CREATE INDEX idx_rfps_status ON rfps(status);
CREATE INDEX idx_rfps_client_id ON rfps(client_id);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_comments_resource ON comments(resource_type, resource_id);
CREATE INDEX idx_mentions_user_id ON mentions(user_id);
CREATE INDEX idx_discussions_rfp_id ON discussions(rfp_id);
CREATE INDEX idx_documents_rfp_id ON documents(rfp_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_search ON documents USING GIN(search_text);
CREATE INDEX idx_document_access_logs_document_id ON document_access_logs(document_id);
CREATE INDEX idx_document_access_logs_user_id ON document_access_logs(user_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rfps_updated_at BEFORE UPDATE ON rfps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for development
INSERT INTO tenants (id, name, domain) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Demo Corporation', 'demo.com'),
    ('550e8400-e29b-41d4-a716-446655440001', 'JPMorgan Chase', 'jpmorgan.com');

INSERT INTO users (id, tenant_id, email, name, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'admin@demo.com', 'System Admin', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'sales@demo.com', 'John Sales', 'sales_rep'),
    ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'manager@demo.com', 'Jane Manager', 'sales_manager'),
    ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'presales@demo.com', 'Sarah PreSales', 'presales_lead');

INSERT INTO clients (id, tenant_id, name, industry, size) VALUES
    ('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'JPMorgan Chase & Co.', 'Financial Services', 'Enterprise'),
    ('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', 'Goldman Sachs', 'Investment Banking', 'Enterprise'),
    ('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', 'Bank of America', 'Banking', 'Enterprise');
