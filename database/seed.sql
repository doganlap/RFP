-- Seed data for Enterprise RFP Platform
-- This file seeds the database with sample data for testing and development

-- Seed tenants
INSERT INTO tenants (id, name, domain, settings, subscription_plan, is_active, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'ACME Corporation', 'acme.com', '{"logo": "https://example.com/acme.png"}'::jsonb, 'enterprise', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Tech Startup Inc', 'techstartup.io', '{"logo": "https://example.com/tech.png"}'::jsonb, 'professional', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'Global Solutions Ltd', 'globalsolutions.co.uk', '{"logo": "https://example.com/global.png"}'::jsonb, 'basic', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed users
INSERT INTO users (id, tenant_id, email, password_hash, name, role, is_active, last_login, provider, metadata, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440101'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'john.sales@acme.com', '$2a$10$...hash...', 'John Sales Rep', 'sales_rep', true, NOW(), 'local', '{"department": "Sales"}'::jsonb, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440102'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'jane.manager@acme.com', '$2a$10$...hash...', 'Jane Sales Manager', 'sales_manager', true, NOW(), 'local', '{"department": "Sales"}'::jsonb, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440103'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'bob.presales@acme.com', '$2a$10$...hash...', 'Bob PreSales Lead', 'presales_lead', true, NOW(), 'local', '{"department": "PreSales"}'::jsonb, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440104'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'sarah.architect@acme.com', '$2a$10$...hash...', 'Sarah Solutions Architect', 'solution_architect', true, NOW(), 'local', '{"department": "Solutions"}'::jsonb, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440105'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'tom.finance@acme.com', '$2a$10$...hash...', 'Tom Finance', 'pricing_finance', true, NOW(), 'local', '{"department": "Finance"}'::jsonb, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440106'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'legal@acme.com', '$2a$10$...hash...', 'Legal Team', 'legal_contracts', true, NOW(), 'local', '{"department": "Legal"}'::jsonb, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440107'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'admin@acme.com', '$2a$10$...hash...', 'Admin User', 'admin', true, NOW(), 'local', '{"department": "Admin"}'::jsonb, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed clients
INSERT INTO clients (id, tenant_id, name, industry, size, contact_info, relationship_manager_id, is_active, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440201'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Fortune 500 Bank', 'Financial Services', 'Enterprise', '{"email": "contact@bank.com", "phone": "+1-555-0100"}'::jsonb, '550e8400-e29b-41d4-a716-446655440102'::uuid, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440202'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Health Care Plus', 'Healthcare', 'Mid-Market', '{"email": "contact@healthcare.com", "phone": "+1-555-0101"}'::jsonb, '550e8400-e29b-41d4-a716-446655440102'::uuid, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440203'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Retail Giant Corp', 'Retail', 'Enterprise', '{"email": "contact@retail.com", "phone": "+1-555-0102"}'::jsonb, '550e8400-e29b-41d4-a716-446655440102'::uuid, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440204'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Tech Innovations Inc', 'Technology', 'Mid-Market', '{"email": "contact@techinnovations.com", "phone": "+1-555-0103"}'::jsonb, '550e8400-e29b-41d4-a716-446655440102'::uuid, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed RFPs
INSERT INTO rfps (id, tenant_id, rfp_number, title, client_id, status, estimated_value, currency, submission_deadline, duration_months, category, priority, sales_rep_id, sales_manager_id, presales_lead_id, solution_architect_id, go_no_go_score, go_no_go_decision, created_at, updated_at, source_crm_id)
VALUES
  ('550e8400-e29b-41d4-a716-446655440301'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'RFP-2025-001', 'Digital Banking Platform Modernization', '550e8400-e29b-41d4-a716-446655440201'::uuid, 'won', 2500000.00, 'USD', NOW() + INTERVAL '90 days', 18, 'Platform Modernization', 'critical', '550e8400-e29b-41d4-a716-446655440101'::uuid, '550e8400-e29b-41d4-a716-446655440102'::uuid, '550e8400-e29b-41d4-a716-446655440103'::uuid, '550e8400-e29b-41d4-a716-446655440104'::uuid, 9.2, 'go', NOW(), NOW(), 'SF-OPP-12345'),
  ('550e8400-e29b-41d4-a716-446655440302'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'RFP-2025-002', 'Healthcare Data Management System', '550e8400-e29b-41d4-a716-446655440202'::uuid, 'lost', 1800000.00, 'USD', NOW() + INTERVAL '60 days', 12, 'Data Management', 'high', '550e8400-e29b-41d4-a716-446655440101'::uuid, '550e8400-e29b-41d4-a716-446655440102'::uuid, '550e8400-e29b-41d4-a716-446655440103'::uuid, '550e8400-e29b-41d4-a716-446655440104'::uuid, 6.5, 'no_go', NOW(), NOW(), 'SF-OPP-12346'),
  ('550e8400-e29b-41d4-a716-446655440303'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'RFP-2025-003', 'Retail Omnichannel Solution', '550e8400-e29b-41d4-a716-446655440203'::uuid, 'proposal_build', 3200000.00, 'USD', NOW() + INTERVAL '75 days', 20, 'Omnichannel', 'critical', '550e8400-e29b-41d4-a716-446655440101'::uuid, '550e8400-e29b-41d4-a716-446655440102'::uuid, '550e8400-e29b-41d4-a716-446655440103'::uuid, '550e8400-e29b-41d4-a716-446655440104'::uuid, 8.8, 'go', NOW(), NOW(), 'SF-OPP-12347'),
  ('550e8400-e29b-41d4-a716-446655440304'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'RFP-2025-004', 'Cloud Infrastructure Migration', '550e8400-e29b-41d4-a716-446655440204'::uuid, 'pricing', 950000.00, 'USD', NOW() + INTERVAL '45 days', 9, 'Cloud Migration', 'high', '550e8400-e29b-41d4-a716-446655440101'::uuid, '550e8400-e29b-41d4-a716-446655440102'::uuid, '550e8400-e29b-41d4-a716-446655440103'::uuid, '550e8400-e29b-41d4-a716-446655440104'::uuid, 7.8, 'go', NOW(), NOW(), 'SF-OPP-12348')
ON CONFLICT DO NOTHING;

-- Seed win/loss analysis
INSERT INTO win_loss_analysis (id, rfp_id, tenant_id, status, primary_reason, secondary_reasons, competitors, feedback, analyzed_by_id, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440401'::uuid, '550e8400-e29b-41d4-a716-446655440301'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'won', 'Superior technical solution and proven track record', ARRAY['Better pricing', 'Excellent customer support'], ARRAY['Competitor A', 'Competitor B'], 'Client was impressed with our architecture and team expertise', '550e8400-e29b-41d4-a716-446655440102'::uuid, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440402'::uuid, '550e8400-e29b-41d4-a716-446655440302'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'lost', 'Incumbent vendor relationship and low pricing', ARRAY['Existing integration', 'Better service terms'], ARRAY['Incumbent Vendor', 'Competitor C'], 'Client preferred to stay with current vendor despite our superior solution', '550e8400-e29b-41d4-a716-446655440102'::uuid, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed comments
INSERT INTO comments (id, tenant_id, user_id, resource_type, resource_id, parent_comment_id, content, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440501'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440101'::uuid, 'rfp', '550e8400-e29b-41d4-a716-446655440301'::uuid, NULL, 'We should emphasize our cloud expertise in the proposal.', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440502'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440104'::uuid, 'rfp', '550e8400-e29b-41d4-a716-446655440301'::uuid, '550e8400-e29b-41d4-a716-446655440501'::uuid, 'Agreed. I can include a case study of our similar banking transformation.', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440503'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440103'::uuid, 'rfp', '550e8400-e29b-41d4-a716-446655440301'::uuid, NULL, 'Team, let''s schedule a pre-proposal kickoff meeting for tomorrow.', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed mentions
INSERT INTO mentions (id, comment_id, user_id, tenant_id, is_read, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440601'::uuid, '550e8400-e29b-41d4-a716-446655440503'::uuid, '550e8400-e29b-41d4-a716-446655440104'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, false, NOW()),
  ('550e8400-e29b-41d4-a716-446655440602'::uuid, '550e8400-e29b-41d4-a716-446655440503'::uuid, '550e8400-e29b-41d4-a716-446655440101'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, false, NOW())
ON CONFLICT DO NOTHING;

-- Seed discussions
INSERT INTO discussions (id, rfp_id, tenant_id, title, created_by_id, is_resolved, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440701'::uuid, '550e8400-e29b-41d4-a716-446655440301'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Pricing Strategy Discussion', '550e8400-e29b-41d4-a716-446655440102'::uuid, false, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440702'::uuid, '550e8400-e29b-41d4-a716-446655440301'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Technical Requirements Review', '550e8400-e29b-41d4-a716-446655440104'::uuid, true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440703'::uuid, '550e8400-e29b-41d4-a716-446655440303'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Resource Allocation Planning', '550e8400-e29b-41d4-a716-446655440102'::uuid, false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Seed integration logs
INSERT INTO integration_logs (id, tenant_id, integration_name, direction, endpoint, status_code, executed_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440801'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Salesforce', 'inbound', '/services/data/v57.0/query', 200, NOW() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440802'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'HubSpot', 'inbound', '/crm/v3/objects/deals', 200, NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440803'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Slack', 'outbound', '/api/chat.postMessage', 200, NOW() - INTERVAL '6 hours'),
  ('550e8400-e29b-41d4-a716-446655440804'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Teams', 'outbound', '/webhook', 200, NOW() - INTERVAL '12 hours')
ON CONFLICT DO NOTHING;

-- Seed DocuSign envelopes
INSERT INTO docusign_envelopes (id, tenant_id, rfp_id, envelope_id, status, signer_email, sent_at, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440901'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440301'::uuid, 'DS-ENV-12345', 'completed', 'client@bank.com', NOW() - INTERVAL '3 days', NOW()),
  ('550e8400-e29b-41d4-a716-446655440902'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440303'::uuid, 'DS-ENV-12346', 'sent', 'contact@retail.com', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT DO NOTHING;

-- Commit and log
SELECT 'Seed data inserted successfully' as status;
