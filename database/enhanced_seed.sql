-- Enhanced seed data for Enterprise RFP Platform
-- This file generates 100 rows for each table to enrich the product
-- PostgreSQL 14+ with UUID extension

-- Clear existing data (optional - uncomment if needed)
-- TRUNCATE tenants CASCADE;

-- ===================================
-- TENANTS (10 records to distribute load)
-- ===================================
INSERT INTO tenants (id, name, domain, settings, subscription_plan, is_active, created_at, updated_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'ACME Corporation', 'acme.com', '{"logo": "https://example.com/acme.png", "theme": "blue"}'::jsonb, 'enterprise', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Tech Startup Inc', 'techstartup.io', '{"logo": "https://example.com/tech.png", "theme": "green"}'::jsonb, 'professional', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'Global Solutions Ltd', 'globalsolutions.co.uk', '{"logo": "https://example.com/global.png", "theme": "purple"}'::jsonb, 'basic', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'Enterprise Systems Corp', 'enterprise-systems.com', '{"logo": "https://example.com/enterprise.png", "theme": "red"}'::jsonb, 'enterprise', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'Innovation Partners LLC', 'innovation-partners.co', '{"logo": "https://example.com/innovation.png", "theme": "orange"}'::jsonb, 'professional', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'Digital Transform Inc', 'digitaltransform.net', '{"logo": "https://example.com/digital.png", "theme": "teal"}'::jsonb, 'enterprise', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440007'::uuid, 'CloudFirst Solutions', 'cloudfirst.io', '{"logo": "https://example.com/cloud.png", "theme": "indigo"}'::jsonb, 'professional', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440008'::uuid, 'AgileWorks Consulting', 'agileworks.com', '{"logo": "https://example.com/agile.png", "theme": "pink"}'::jsonb, 'basic', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440009'::uuid, 'NextGen Technologies', 'nextgen-tech.org', '{"logo": "https://example.com/nextgen.png", "theme": "yellow"}'::jsonb, 'enterprise', true, NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440010'::uuid, 'Strategic Solutions Group', 'strategic-solutions.biz', '{"logo": "https://example.com/strategic.png", "theme": "gray"}'::jsonb, 'professional', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ===================================
-- USERS (100 records across tenants)
-- ===================================
WITH user_data AS (
  SELECT 
    ('550e8400-e29b-41d4-a716-4466554401' || LPAD((ROW_NUMBER() OVER())::text, 2, '0'))::uuid as id,
    ('550e8400-e29b-41d4-a716-44665544000' || CEIL(RANDOM() * 10)::text)::uuid as tenant_id,
    CONCAT(
      (ARRAY['john', 'jane', 'bob', 'alice', 'charlie', 'diana', 'eve', 'frank', 'grace', 'henry', 'irene', 'jack', 'karen', 'larry', 'mary', 'nancy', 'oscar', 'patty', 'quinn', 'robert'])[CEIL(RANDOM() * 20)],
      '.', 
      (ARRAY['smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'rodriguez', 'martinez', 'hernandez', 'lopez', 'gonzalez', 'wilson', 'anderson', 'thomas', 'taylor', 'moore', 'jackson', 'martin'])[CEIL(RANDOM() * 20)],
      row_number() OVER(),
      '@company.com'
    ) as email,
    '$2b$10$N9qo8uLOickgx2ZMRZoMye/IVF4B.x1y.8KfLgkeSK4SfaL.RNY7' as password_hash,
    CONCAT(
      (ARRAY['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Irene', 'Jack', 'Karen', 'Larry', 'Mary', 'Nancy', 'Oscar', 'Patty', 'Quinn', 'Robert'])[CEIL(RANDOM() * 20)],
      ' ',
      (ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'])[CEIL(RANDOM() * 20)]
    ) as name,
    (ARRAY['admin', 'sales_rep', 'sales_manager', 'presales_lead', 'solution_architect', 'pricing_finance', 'legal_contracts', 'compliance_grc', 'pmo'])[CEIL(RANDOM() * 9)] as role,
    RANDOM() > 0.1 as is_active,
    NOW() - INTERVAL '1 day' * RANDOM() * 365 as last_login,
    (ARRAY['local', 'azure_ad', 'okta', 'saml'])[CEIL(RANDOM() * 4)] as provider,
    ('{"department": "' || (ARRAY['Sales', 'PreSales', 'Solutions', 'Finance', 'Legal', 'Admin', 'Operations'])[CEIL(RANDOM() * 7)] || '", "location": "' || (ARRAY['New York', 'London', 'Singapore', 'Sydney', 'Toronto', 'Mumbai'])[CEIL(RANDOM() * 6)] || '"}')::jsonb as metadata,
    NOW() - INTERVAL '1 day' * RANDOM() * 730 as created_at,
    NOW() - INTERVAL '1 day' * RANDOM() * 30 as updated_at
  FROM generate_series(1, 100)
)
INSERT INTO users (id, tenant_id, email, password_hash, name, role, is_active, last_login, provider, metadata, created_at, updated_at)
SELECT * FROM user_data
ON CONFLICT DO NOTHING;

-- ===================================
-- CLIENTS (100 records)
-- ===================================
WITH client_data AS (
  SELECT 
    ('550e8400-e29b-41d4-a716-4466554402' || LPAD(ROW_NUMBER() OVER()::text, 2, '0'))::uuid as id,
    ('550e8400-e29b-41d4-a716-44665544000' || CEIL(RANDOM() * 10)::text)::uuid as tenant_id,
    CONCAT(
      (ARRAY['Global', 'International', 'United', 'National', 'Premier', 'Elite', 'Advanced', 'Superior', 'Excellence', 'Innovation', 'Strategic', 'Dynamic', 'Progressive', 'Future', 'Smart', 'Digital', 'Next', 'Prime', 'Alpha', 'Omega'])[CEIL(RANDOM() * 20)],
      ' ',
      (ARRAY['Systems', 'Solutions', 'Technologies', 'Industries', 'Corporation', 'Group', 'Holdings', 'Enterprises', 'Partners', 'Associates', 'Consulting', 'Services', 'Labs', 'Works', 'Hub', 'Center', 'Network', 'Platform', 'Foundation', 'Institute'])[CEIL(RANDOM() * 20)]
    ) as name,
    (ARRAY['Financial Services', 'Healthcare', 'Technology', 'Manufacturing', 'Retail', 'Energy', 'Government', 'Education', 'Telecommunications', 'Insurance', 'Automotive', 'Aerospace', 'Pharmaceuticals', 'Media', 'Real Estate', 'Transportation', 'Hospitality', 'Agriculture', 'Construction', 'Mining'])[CEIL(RANDOM() * 20)] as industry,
    (ARRAY['Small', 'Mid-Market', 'Enterprise', 'Fortune 500'])[CEIL(RANDOM() * 4)] as size,
    ('{"email": "contact' || ROW_NUMBER() OVER() || '@client.com", "phone": "+1-555-' || LPAD((1000 + ROW_NUMBER() OVER())::text, 4, '0') || '", "address": "' || (ARRAY['123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm St', '654 Maple Dr'])[CEIL(RANDOM() * 5)] || '", "website": "https://client' || ROW_NUMBER() OVER() || '.com"}')::jsonb as contact_info,
    (SELECT id FROM users WHERE role IN ('sales_manager', 'sales_rep') ORDER BY RANDOM() LIMIT 1) as relationship_manager_id,
    RANDOM() > 0.05 as is_active,
    NOW() - INTERVAL '1 day' * RANDOM() * 1000 as created_at,
    NOW() - INTERVAL '1 day' * RANDOM() * 100 as updated_at
  FROM generate_series(1, 100)
)
INSERT INTO clients (id, tenant_id, name, industry, size, contact_info, relationship_manager_id, is_active, created_at, updated_at)
SELECT * FROM client_data
ON CONFLICT DO NOTHING;

-- ===================================
-- RFPS (100 records)
-- ===================================
WITH rfp_data AS (
  SELECT 
    ('550e8400-e29b-41d4-a716-4466554403' || LPAD(ROW_NUMBER() OVER()::text, 2, '0'))::uuid as id,
    ('550e8400-e29b-41d4-a716-44665544000' || CEIL(RANDOM() * 10)::text)::uuid as tenant_id,
    'RFP-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(ROW_NUMBER() OVER()::text, 3, '0') as rfp_number,
    CONCAT(
      (ARRAY['Digital Transformation', 'Cloud Migration', 'Data Analytics Platform', 'Mobile Application', 'Web Portal', 'API Integration', 'Security Enhancement', 'Infrastructure Modernization', 'Business Intelligence', 'Customer Experience', 'Enterprise Resource Planning', 'Supply Chain Management', 'Human Resources System', 'Financial Management', 'Compliance Framework', 'Risk Management', 'Quality Assurance', 'Project Management', 'Content Management', 'E-commerce Platform'])[CEIL(RANDOM() * 20)],
      ' for ',
      (ARRAY['Banking', 'Healthcare', 'Retail', 'Manufacturing', 'Government', 'Education', 'Insurance', 'Energy', 'Transportation', 'Media', 'Telecommunications', 'Real Estate', 'Hospitality', 'Agriculture', 'Construction', 'Pharmaceuticals', 'Automotive', 'Aerospace', 'Mining', 'Logistics'])[CEIL(RANDOM() * 20)]
    ) as title,
    (SELECT id FROM clients ORDER BY RANDOM() LIMIT 1) as client_id,
    (ARRAY['intake', 'go_no_go', 'planning', 'solutioning', 'pricing', 'proposal_build', 'approvals', 'submission', 'post_bid', 'won', 'lost', 'abandoned'])[CEIL(RANDOM() * 12)] as status,
    (RANDOM() * 5000000 + 50000)::DECIMAL(15,2) as estimated_value,
    (ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD'])[CEIL(RANDOM() * 5)] as currency,
    NOW() + INTERVAL '1 day' * (RANDOM() * 180 + 30) as submission_deadline,
    (RANDOM() * 36 + 6)::INTEGER as duration_months,
    (ARRAY['Digital Transformation', 'Cloud Migration', 'Data Analytics', 'Security', 'Integration', 'Modernization', 'Implementation', 'Consulting', 'Support', 'Training'])[CEIL(RANDOM() * 10)] as category,
    (ARRAY['low', 'medium', 'high', 'critical'])[CEIL(RANDOM() * 4)] as priority,
    (SELECT id FROM users WHERE role = 'sales_rep' ORDER BY RANDOM() LIMIT 1) as sales_rep_id,
    (SELECT id FROM users WHERE role = 'sales_manager' ORDER BY RANDOM() LIMIT 1) as sales_manager_id,
    (SELECT id FROM users WHERE role = 'presales_lead' ORDER BY RANDOM() LIMIT 1) as presales_lead_id,
    (SELECT id FROM users WHERE role = 'solution_architect' ORDER BY RANDOM() LIMIT 1) as solution_architect_id,
    ROUND((RANDOM() * 10)::NUMERIC, 1) as go_no_go_score,
    (ARRAY['go', 'no_go', 'pending'])[CEIL(RANDOM() * 3)] as go_no_go_decision,
    NOW() - INTERVAL '1 day' * RANDOM() * 365 as created_at,
    NOW() - INTERVAL '1 day' * RANDOM() * 30 as updated_at,
    'SF-OPP-' || (12345 + ROW_NUMBER() OVER()) as source_crm_id
  FROM generate_series(1, 100)
)
INSERT INTO rfps (id, tenant_id, rfp_number, title, client_id, status, estimated_value, currency, submission_deadline, duration_months, category, priority, sales_rep_id, sales_manager_id, presales_lead_id, solution_architect_id, go_no_go_score, go_no_go_decision, created_at, updated_at, source_crm_id)
SELECT * FROM rfp_data
ON CONFLICT DO NOTHING;

-- ===================================
-- WIN_LOSS_ANALYSIS (100 records)
-- ===================================
WITH win_loss_data AS (
  SELECT 
    ('550e8400-e29b-41d4-a716-4466554404' || LPAD(ROW_NUMBER() OVER()::text, 2, '0'))::uuid as id,
    (SELECT id FROM rfps ORDER BY RANDOM() LIMIT 1) as rfp_id,
    ('550e8400-e29b-41d4-a716-44665544000' || CEIL(RANDOM() * 10)::text)::uuid as tenant_id,
    (ARRAY['won', 'lost', 'abandoned'])[CEIL(RANDOM() * 3)] as status,
    (ARRAY['Superior technical solution', 'Better pricing', 'Existing relationship', 'Faster delivery', 'Proven track record', 'Better support', 'More features', 'Industry expertise', 'Local presence', 'Compliance requirements', 'Budget constraints', 'Timeline issues', 'Technical limitations', 'Resource constraints', 'Competition pricing', 'Feature gaps', 'Integration challenges', 'Vendor relationship', 'Strategic alignment', 'Risk factors'])[CEIL(RANDOM() * 20)] as primary_reason,
    ARRAY[(ARRAY['Better pricing', 'Excellent support', 'Proven solution', 'Fast implementation', 'Industry expertise', 'Technical innovation', 'Strategic partnership', 'Global presence'])[CEIL(RANDOM() * 8)], (ARRAY['Compliance readiness', 'Scalability', 'Security features', 'User experience', 'Integration capabilities', 'Training programs', 'Maintenance support', 'Future roadmap'])[CEIL(RANDOM() * 8)]] as secondary_reasons,
    ARRAY[(ARRAY['Competitor A', 'Competitor B', 'Competitor C', 'Market Leader', 'Incumbent Vendor', 'New Entrant', 'Regional Player', 'Specialist Vendor'])[CEIL(RANDOM() * 8)], (ARRAY['Global Corp', 'Tech Giant', 'Industry Leader', 'Startup Challenger', 'Traditional Vendor', 'Cloud Provider', 'Open Source', 'Custom Solution'])[CEIL(RANDOM() * 8)]] as competitors,
    CONCAT(
      'Client feedback: ',
      (ARRAY['Impressed with our technical approach and team expertise', 'Concerned about implementation timeline and resource requirements', 'Liked our innovative solution but preferred lower cost option', 'Appreciated our industry knowledge and case studies', 'Found our proposal comprehensive but complex', 'Valued our partnership approach and long-term vision', 'Questioned our ability to scale and provide ongoing support', 'Excited about our technology but worried about integration', 'Preferred our user experience design and interface', 'Selected competitor due to existing vendor relationship'])[CEIL(RANDOM() * 10)]
    ) as feedback,
    (SELECT id FROM users WHERE role IN ('sales_manager', 'presales_lead') ORDER BY RANDOM() LIMIT 1) as analyzed_by_id,
    NOW() - INTERVAL '1 day' * RANDOM() * 180 as created_at,
    NOW() - INTERVAL '1 day' * RANDOM() * 30 as updated_at
  FROM generate_series(1, 100)
)
INSERT INTO win_loss_analysis (id, rfp_id, tenant_id, status, primary_reason, secondary_reasons, competitors, feedback, analyzed_by_id, created_at, updated_at)
SELECT * FROM win_loss_data
ON CONFLICT DO NOTHING;

-- ===================================
-- COMMENTS (100 records)
-- ===================================
WITH comment_data AS (
  SELECT 
    ('550e8400-e29b-41d4-a716-4466554405' || LPAD(ROW_NUMBER() OVER()::text, 2, '0'))::uuid as id,
    ('550e8400-e29b-41d4-a716-44665544000' || CEIL(RANDOM() * 10)::text)::uuid as tenant_id,
    (SELECT id FROM users ORDER BY RANDOM() LIMIT 1) as user_id,
    'rfp' as resource_type,
    (SELECT id FROM rfps ORDER BY RANDOM() LIMIT 1) as resource_id,
    CASE WHEN RANDOM() > 0.8 THEN (SELECT id FROM generate_series(1, ROW_NUMBER() OVER() - 1) ORDER BY RANDOM() LIMIT 1) ELSE NULL END as parent_comment_id,
    (ARRAY['Great technical solution proposal. Let''s emphasize our cloud expertise.', 'We need to review the pricing strategy for this opportunity.', 'Client meeting scheduled for next week to discuss requirements.', 'Updated the technical architecture based on client feedback.', 'Legal team has reviewed the contract terms and conditions.', 'Risk assessment completed - looks manageable with proper planning.', 'Competitive analysis shows we have a strong position in this RFP.', 'Resource allocation confirmed for the proposed timeline.', 'Client references have been contacted and provided positive feedback.', 'Final review meeting scheduled before submission deadline.', 'Budget has been approved by finance team for this proposal.', 'Technical demo was well received by client stakeholders.', 'Compliance requirements have been fully addressed in our solution.', 'Partnership agreements in place to support the delivery model.', 'Training program outlined for client team knowledge transfer.', 'Implementation timeline adjusted based on client preferences.', 'Security framework meets all client requirements and standards.', 'Integration capabilities demonstrated in proof of concept.', 'Support model defined with 24/7 availability commitment.', 'Success metrics and KPIs agreed upon with client team.'])[CEIL(RANDOM() * 20)] as content,
    NOW() - INTERVAL '1 day' * RANDOM() * 60 as created_at,
    NOW() - INTERVAL '1 day' * RANDOM() * 7 as updated_at
  FROM generate_series(1, 100)
)
INSERT INTO comments (id, tenant_id, user_id, resource_type, resource_id, parent_comment_id, content, created_at, updated_at)
SELECT * FROM comment_data
ON CONFLICT DO NOTHING;

-- ===================================
-- MENTIONS (100 records)
-- ===================================
WITH mention_data AS (
  SELECT 
    ('550e8400-e29b-41d4-a716-4466554406' || LPAD(ROW_NUMBER() OVER()::text, 2, '0'))::uuid as id,
    (SELECT id FROM comments ORDER BY RANDOM() LIMIT 1) as comment_id,
    (SELECT id FROM users ORDER BY RANDOM() LIMIT 1) as user_id,
    ('550e8400-e29b-41d4-a716-44665544000' || CEIL(RANDOM() * 10)::text)::uuid as tenant_id,
    RANDOM() > 0.6 as is_read,
    NOW() - INTERVAL '1 day' * RANDOM() * 30 as created_at
  FROM generate_series(1, 100)
)
INSERT INTO mentions (id, comment_id, user_id, tenant_id, is_read, created_at)
SELECT * FROM mention_data
ON CONFLICT DO NOTHING;

-- ===================================
-- DISCUSSIONS (100 records)
-- ===================================
WITH discussion_data AS (
  SELECT 
    ('550e8400-e29b-41d4-a716-4466554407' || LPAD(ROW_NUMBER() OVER()::text, 2, '0'))::uuid as id,
    (SELECT id FROM rfps ORDER BY RANDOM() LIMIT 1) as rfp_id,
    ('550e8400-e29b-41d4-a716-44665544000' || CEIL(RANDOM() * 10)::text)::uuid as tenant_id,
    (ARRAY['Pricing Strategy Discussion', 'Technical Requirements Review', 'Resource Allocation Planning', 'Risk Assessment Meeting', 'Client Feedback Analysis', 'Competitive Positioning', 'Implementation Timeline', 'Compliance Review', 'Quality Assurance Plan', 'Partnership Strategy', 'Training Requirements', 'Support Model Definition', 'Security Framework', 'Integration Planning', 'Success Metrics', 'Budget Approval', 'Legal Review', 'Contract Negotiation', 'Delivery Model', 'Change Management'])[CEIL(RANDOM() * 20)] as title,
    (SELECT id FROM users ORDER BY RANDOM() LIMIT 1) as created_by_id,
    RANDOM() > 0.4 as is_resolved,
    NOW() - INTERVAL '1 day' * RANDOM() * 90 as created_at,
    NOW() - INTERVAL '1 day' * RANDOM() * 7 as updated_at
  FROM generate_series(1, 100)
)
INSERT INTO discussions (id, rfp_id, tenant_id, title, created_by_id, is_resolved, created_at, updated_at)
SELECT * FROM discussion_data
ON CONFLICT DO NOTHING;

-- ===================================
-- INTEGRATION_LOGS (100 records)
-- ===================================
WITH integration_data AS (
  SELECT 
    ('550e8400-e29b-41d4-a716-4466554408' || LPAD(ROW_NUMBER() OVER()::text, 2, '0'))::uuid as id,
    ('550e8400-e29b-41d4-a716-44665544000' || CEIL(RANDOM() * 10)::text)::uuid as tenant_id,
    (ARRAY['Salesforce', 'HubSpot', 'Microsoft Dynamics', 'SAP', 'Oracle', 'ServiceNow', 'Slack', 'Teams', 'Zoom', 'DocuSign', 'Box', 'SharePoint', 'Jira', 'Confluence', 'Trello', 'Asana', 'Monday', 'Airtable', 'Zapier', 'Power BI'])[CEIL(RANDOM() * 20)] as integration_name,
    (ARRAY['inbound', 'outbound'])[CEIL(RANDOM() * 2)] as direction,
    (ARRAY['/api/v1/opportunities', '/services/data/v57.0/query', '/crm/v3/objects/deals', '/api/chat.postMessage', '/webhook', '/documents/upload', '/users/sync', '/projects/update', '/notifications/send', '/reports/generate'])[CEIL(RANDOM() * 10)] as endpoint,
    (ARRAY[200, 201, 204, 400, 401, 403, 404, 429, 500, 502, 503])[CEIL(RANDOM() * 11)] as status_code,
    NOW() - INTERVAL '1 minute' * RANDOM() * 10080 as executed_at -- Last week
  FROM generate_series(1, 100)
)
INSERT INTO integration_logs (id, tenant_id, integration_name, direction, endpoint, status_code, executed_at)
SELECT * FROM integration_data
ON CONFLICT DO NOTHING;

-- ===================================
-- DOCUSIGN_ENVELOPES (100 records)
-- ===================================
WITH docusign_data AS (
  SELECT 
    ('550e8400-e29b-41d4-a716-4466554409' || LPAD(ROW_NUMBER() OVER()::text, 2, '0'))::uuid as id,
    ('550e8400-e29b-41d4-a716-44665544000' || CEIL(RANDOM() * 10)::text)::uuid as tenant_id,
    (SELECT id FROM rfps ORDER BY RANDOM() LIMIT 1) as rfp_id,
    'DS-ENV-' || (12345 + ROW_NUMBER() OVER()) as envelope_id,
    (ARRAY['sent', 'delivered', 'completed', 'declined', 'voided'])[CEIL(RANDOM() * 5)] as status,
    'signer' || ROW_NUMBER() OVER() || '@client.com' as signer_email,
    NOW() - INTERVAL '1 day' * RANDOM() * 60 as sent_at,
    NOW() - INTERVAL '1 day' * RANDOM() * 30 as created_at
  FROM generate_series(1, 100)
)
INSERT INTO docusign_envelopes (id, tenant_id, rfp_id, envelope_id, status, signer_email, sent_at, created_at)
SELECT * FROM docusign_data
ON CONFLICT DO NOTHING;

-- ===================================
-- USER_SESSIONS (100 records)
-- ===================================
WITH session_data AS (
  SELECT 
    ('550e8400-e29b-41d4-a716-4466554410' || LPAD(ROW_NUMBER() OVER()::text, 2, '0'))::uuid as id,
    (SELECT id FROM users ORDER BY RANDOM() LIMIT 1) as user_id,
    'sess_' || MD5(RANDOM()::text || ROW_NUMBER() OVER()::text) as session_token,
    ('{"browser": "' || (ARRAY['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'])[CEIL(RANDOM() * 5)] || '", "os": "' || (ARRAY['Windows', 'macOS', 'Linux', 'iOS', 'Android'])[CEIL(RANDOM() * 5)] || '", "device": "' || (ARRAY['Desktop', 'Mobile', 'Tablet'])[CEIL(RANDOM() * 3)] || '"}')::jsonb as device_info,
    ('192.168.' || CEIL(RANDOM() * 255) || '.' || CEIL(RANDOM() * 255))::inet as ip_address,
    'Mozilla/5.0 (' || (ARRAY['Windows NT 10.0', 'Macintosh', 'X11; Linux x86_64', 'iPhone', 'Android'])[CEIL(RANDOM() * 5)] || ') Browser/Version' as user_agent,
    NOW() + INTERVAL '1 day' * (7 + RANDOM() * 23) as expires_at,
    RANDOM() > 0.2 as is_active,
    NOW() - INTERVAL '1 day' * RANDOM() * 30 as created_at
  FROM generate_series(1, 100)
)
INSERT INTO user_sessions (id, user_id, session_token, device_info, ip_address, user_agent, expires_at, is_active, created_at)
SELECT * FROM session_data
ON CONFLICT DO NOTHING;

-- ===================================
-- DOCUMENTS (100 records) - Check if table exists first
-- ===================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documents') THEN
        EXECUTE '
        WITH document_data AS (
          SELECT 
            (''550e8400-e29b-41d4-a716-4466554411'' || LPAD(ROW_NUMBER() OVER()::text, 2, ''0''))::uuid as id,
            (''550e8400-e29b-41d4-a716-44665544000'' || CEIL(RANDOM() * 10)::text)::uuid as tenant_id,
            ''rfp'' as resource_type,
            (SELECT id FROM rfps ORDER BY RANDOM() LIMIT 1) as resource_id,
            (SELECT id FROM users ORDER BY RANDOM() LIMIT 1) as uploaded_by_id,
            (ARRAY[''Proposal Draft'', ''Technical Specification'', ''Pricing Document'', ''Legal Agreement'', ''Client Requirements'', ''Solution Overview'', ''Implementation Plan'', ''Risk Assessment'', ''Quality Plan'', ''Support Model'', ''Training Materials'', ''Compliance Report'', ''Security Framework'', ''Integration Guide'', ''User Manual'', ''Test Plan'', ''Deployment Guide'', ''Maintenance Plan'', ''Change Management'', ''Executive Summary''])[CEIL(RANDOM() * 20)] || '' - '' || ROW_NUMBER() OVER() as filename,
            (ARRAY[''application/pdf'', ''application/vnd.openxmlformats-officedocument.wordprocessingml.document'', ''application/vnd.ms-powerpoint'', ''text/plain'', ''application/vnd.ms-excel''])[CEIL(RANDOM() * 5)] as mime_type,
            (RANDOM() * 10000000 + 1000)::bigint as file_size,
            ''/documents/'' || MD5(RANDOM()::text || ROW_NUMBER() OVER()::text) || ''.pdf'' as file_path,
            (RANDOM() * 5 + 1)::integer as version,
            RANDOM() > 0.9 as is_deleted,
            NOW() - INTERVAL ''1 day'' * RANDOM() * 180 as created_at,
            NOW() - INTERVAL ''1 day'' * RANDOM() * 30 as updated_at
          FROM generate_series(1, 100)
        )
        INSERT INTO documents (id, tenant_id, resource_type, resource_id, uploaded_by_id, filename, mime_type, file_size, file_path, version, is_deleted, created_at, updated_at)
        SELECT * FROM document_data
        ON CONFLICT DO NOTHING';
    END IF;
END
$$;

-- Final summary
SELECT 
    'Enhanced seed data generation completed successfully!' as status,
    'Generated 100 rows for each table with realistic, interconnected data' as description,
    COUNT(*) as total_tenants FROM tenants;