-- Complete the remaining tables to reach 100 rows each
-- This script handles the tables that didn't get fully populated

-- ===================================
-- MENTIONS (100 records)
-- ===================================
DO $$
DECLARE
    i integer;
    comment_id uuid;
    user_id uuid;
    tenant_id uuid;
BEGIN
    FOR i IN 1..100 LOOP
        -- Get random comment
        SELECT id INTO comment_id FROM comments ORDER BY RANDOM() LIMIT 1;
        
        -- Get the tenant from the comment
        SELECT c.tenant_id INTO tenant_id FROM comments c WHERE c.id = comment_id;
        
        -- Get user from same tenant
        SELECT id INTO user_id FROM users WHERE users.tenant_id = tenant_id ORDER BY RANDOM() LIMIT 1;
        
        INSERT INTO mentions (
            id, comment_id, user_id, tenant_id, is_read, created_at
        ) VALUES (
            uuid_generate_v4(),
            comment_id,
            user_id,
            tenant_id,
            CASE WHEN (i % 3) = 0 THEN true ELSE false END,
            NOW() - INTERVAL '1 day' * (i % 30)
        );
    END LOOP;
END $$;

-- ===================================
-- DISCUSSIONS (100 records)
-- ===================================
DO $$
DECLARE
    discussion_titles text[] := ARRAY[
        'Pricing Strategy Discussion', 'Technical Requirements Review', 'Resource Allocation Planning', 
        'Risk Assessment Meeting', 'Client Feedback Analysis', 'Competitive Positioning', 
        'Implementation Timeline', 'Compliance Review', 'Quality Assurance Plan', 'Partnership Strategy',
        'Training Requirements', 'Support Model Definition', 'Security Framework', 'Integration Planning', 
        'Success Metrics', 'Budget Approval', 'Legal Review', 'Contract Negotiation', 
        'Delivery Model', 'Change Management'
    ];
    
    i integer;
    rfp_id uuid;
    tenant_id uuid;
    user_id uuid;
BEGIN
    FOR i IN 1..100 LOOP
        -- Get random RFP
        SELECT id, tenant_id INTO rfp_id, tenant_id FROM rfps ORDER BY RANDOM() LIMIT 1;
        
        -- Get user from same tenant
        SELECT id INTO user_id FROM users WHERE users.tenant_id = tenant_id ORDER BY RANDOM() LIMIT 1;
        
        INSERT INTO discussions (
            id, rfp_id, tenant_id, title, created_by_id, is_resolved, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            rfp_id,
            tenant_id,
            discussion_titles[(i % 20) + 1] || ' #' || i,
            user_id,
            CASE WHEN (i % 2) = 0 THEN true ELSE false END,
            NOW() - INTERVAL '1 day' * (i % 90),
            NOW() - INTERVAL '1 day' * (i % 7)
        );
    END LOOP;
END $$;

-- ===================================
-- INTEGRATION_LOGS (100 records)
-- ===================================
DO $$
DECLARE
    integrations text[] := ARRAY[
        'Salesforce', 'HubSpot', 'Microsoft Dynamics', 'SAP', 'Oracle', 'ServiceNow', 
        'Slack', 'Teams', 'Zoom', 'DocuSign', 'Box', 'SharePoint', 'Jira', 'Confluence', 
        'Trello', 'Asana', 'Monday', 'Airtable', 'Zapier', 'Power BI'
    ];
    directions text[] := ARRAY['inbound', 'outbound'];
    endpoints text[] := ARRAY[
        '/api/v1/opportunities', '/services/data/v57.0/query', '/crm/v3/objects/deals',
        '/api/chat.postMessage', '/webhook', '/documents/upload', '/users/sync',
        '/projects/update', '/notifications/send', '/reports/generate'
    ];
    status_codes integer[] := ARRAY[200, 201, 204, 400, 401, 403, 404, 429, 500, 502, 503];
    
    i integer;
    tenant_id uuid;
BEGIN
    FOR i IN 1..100 LOOP
        -- Get random tenant
        SELECT id INTO tenant_id FROM tenants ORDER BY RANDOM() LIMIT 1;
        
        INSERT INTO integration_logs (
            id, tenant_id, integration_name, direction, endpoint, status_code, executed_at
        ) VALUES (
            uuid_generate_v4(),
            tenant_id,
            integrations[(i % 20) + 1],
            directions[(i % 2) + 1],
            endpoints[(i % 10) + 1],
            status_codes[(i % 11) + 1],
            NOW() - INTERVAL '1 minute' * (i * 5)
        );
    END LOOP;
END $$;

-- ===================================
-- DOCUSIGN_ENVELOPES (100 records)
-- ===================================
DO $$
DECLARE
    statuses text[] := ARRAY['sent', 'delivered', 'completed', 'declined', 'voided'];
    
    i integer;
    tenant_id uuid;
    rfp_id uuid;
BEGIN
    FOR i IN 1..100 LOOP
        -- Get random RFP and tenant
        SELECT id, tenant_id INTO rfp_id, tenant_id FROM rfps ORDER BY RANDOM() LIMIT 1;
        
        INSERT INTO docusign_envelopes (
            id, tenant_id, rfp_id, envelope_id, status, signer_email, sent_at, created_at
        ) VALUES (
            uuid_generate_v4(),
            tenant_id,
            rfp_id,
            'DS-ENV-' || (12345 + i),
            statuses[(i % 5) + 1],
            'signer' || i || '@client.com',
            NOW() - INTERVAL '1 day' * (i % 60),
            NOW() - INTERVAL '1 day' * (i % 30)
        ) ON CONFLICT (envelope_id) DO NOTHING;
    END LOOP;
END $$;

-- ===================================
-- USER_SESSIONS (ensure we have 100)
-- ===================================
DO $$
DECLARE
    browsers text[] := ARRAY['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
    operating_systems text[] := ARRAY['Windows', 'macOS', 'Linux', 'iOS', 'Android'];
    devices text[] := ARRAY['Desktop', 'Mobile', 'Tablet'];
    
    i integer;
    user_id uuid;
    current_count integer;
BEGIN
    -- Check current count
    SELECT COUNT(*) INTO current_count FROM user_sessions;
    
    -- Add more sessions to reach 100
    FOR i IN (current_count + 1)..100 LOOP
        -- Get random user
        SELECT id INTO user_id FROM users ORDER BY RANDOM() LIMIT 1;
        
        INSERT INTO user_sessions (
            id, user_id, session_token, device_info, ip_address, user_agent, 
            expires_at, is_active, created_at
        ) VALUES (
            uuid_generate_v4(),
            user_id,
            'sess_' || MD5(RANDOM()::text || i::text),
            ('{"browser": "' || browsers[(i % 5) + 1] || '", "os": "' || operating_systems[(i % 5) + 1] || '", "device": "' || devices[(i % 3) + 1] || '"}')::jsonb,
            ('192.168.' || (i % 255 + 1) || '.' || ((i * 7) % 255 + 1))::inet,
            'Mozilla/5.0 (' || operating_systems[(i % 5) + 1] || ') Browser/Version',
            NOW() + INTERVAL '1 day' * (7 + (i % 23)),
            CASE WHEN (i % 5) = 0 THEN false ELSE true END,
            NOW() - INTERVAL '1 day' * (i % 30)
        ) ON CONFLICT (session_token) DO NOTHING;
    END LOOP;
END $$;

-- ===================================
-- WIN_LOSS_ANALYSIS (complete to 100)
-- ===================================
DO $$
DECLARE
    primary_reasons text[] := ARRAY[
        'Superior technical solution', 'Better pricing', 'Existing relationship', 'Faster delivery', 
        'Proven track record', 'Better support', 'More features', 'Industry expertise', 
        'Local presence', 'Compliance requirements', 'Budget constraints', 'Timeline issues',
        'Technical limitations', 'Resource constraints', 'Competition pricing'
    ];
    competitors text[] := ARRAY[
        'Competitor A', 'Competitor B', 'Market Leader', 'Incumbent Vendor', 'New Entrant', 
        'Regional Player', 'Specialist Vendor', 'Global Corp', 'Tech Giant', 'Industry Leader'
    ];
    win_loss_statuses text[] := ARRAY['won', 'lost', 'abandoned'];
    
    i integer;
    rfp_id uuid;
    tenant_id uuid;
    analyzed_by_id uuid;
    current_count integer;
BEGIN
    -- Check current count
    SELECT COUNT(*) INTO current_count FROM win_loss_analysis;
    
    -- Add more analyses to reach 100
    FOR i IN (current_count + 1)..100 LOOP
        -- Get a random RFP
        SELECT id, tenant_id INTO rfp_id, tenant_id FROM rfps ORDER BY RANDOM() LIMIT 1;
        
        -- Get analyzer from same tenant
        SELECT id INTO analyzed_by_id FROM users 
        WHERE role IN ('sales_manager', 'presales_lead') 
        AND users.tenant_id = tenant_id 
        ORDER BY RANDOM() LIMIT 1;
        
        INSERT INTO win_loss_analysis (
            id, rfp_id, tenant_id, status, primary_reason, secondary_reasons, competitors, 
            feedback, analyzed_by_id, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            rfp_id,
            tenant_id,
            win_loss_statuses[(i % 3) + 1],
            primary_reasons[(i % 15) + 1],
            ARRAY[primary_reasons[((i + 2) % 15) + 1], primary_reasons[((i + 4) % 15) + 1]],
            ARRAY[competitors[(i % 10) + 1], competitors[((i + 5) % 10) + 1]],
            'Analysis #' || i || ': ' || primary_reasons[(i % 15) + 1] || ' was the key factor in this decision.',
            analyzed_by_id,
            NOW() - INTERVAL '1 day' * (i % 180),
            NOW() - INTERVAL '1 day' * (i % 30)
        );
    END LOOP;
END $$;

-- ===================================
-- COMMENTS (complete to 100)
-- ===================================
DO $$
DECLARE
    comment_texts text[] := ARRAY[
        'Great technical solution proposal. Let''s emphasize our cloud expertise.',
        'We need to review the pricing strategy for this opportunity.',
        'Client meeting scheduled for next week to discuss requirements.',
        'Updated the technical architecture based on client feedback.',
        'Legal team has reviewed the contract terms and conditions.',
        'Risk assessment completed - looks manageable with proper planning.',
        'Competitive analysis shows we have a strong position in this RFP.',
        'Resource allocation confirmed for the proposed timeline.',
        'Client references have been contacted and provided positive feedback.',
        'Final review meeting scheduled before submission deadline.',
        'Budget has been approved by finance team for this proposal.',
        'Technical demo was well received by client stakeholders.',
        'Compliance requirements have been fully addressed in our solution.',
        'Partnership agreements in place to support the delivery model.',
        'Training program outlined for client team knowledge transfer.'
    ];
    
    i integer;
    tenant_id uuid;
    user_id uuid;
    rfp_id uuid;
    current_count integer;
BEGIN
    -- Check current count
    SELECT COUNT(*) INTO current_count FROM comments;
    
    -- Add more comments to reach 100
    FOR i IN (current_count + 1)..100 LOOP
        -- Get random RFP and its tenant
        SELECT id, tenant_id INTO rfp_id, tenant_id FROM rfps ORDER BY RANDOM() LIMIT 1;
        
        -- Get user from same tenant
        SELECT id INTO user_id FROM users WHERE users.tenant_id = tenant_id ORDER BY RANDOM() LIMIT 1;
        
        INSERT INTO comments (
            id, tenant_id, user_id, resource_type, resource_id, parent_comment_id, 
            content, created_at, updated_at
        ) VALUES (
            uuid_generate_v4(),
            tenant_id,
            user_id,
            'rfp',
            rfp_id,
            NULL,
            comment_texts[(i % 15) + 1] || ' [Comment #' || i || ']',
            NOW() - INTERVAL '1 day' * (i % 60),
            NOW() - INTERVAL '1 day' * (i % 7)
        );
    END LOOP;
END $$;

-- Final verification query
SELECT 
  'Table Completion Status' as summary,
  COUNT(*) as total_tables_processed
FROM (
  SELECT 'Tenants' as table_name, COUNT(*) as count FROM tenants
  UNION ALL SELECT 'Users', COUNT(*) FROM users
  UNION ALL SELECT 'Clients', COUNT(*) FROM clients
  UNION ALL SELECT 'RFPs', COUNT(*) FROM rfps
  UNION ALL SELECT 'Win_Loss_Analysis', COUNT(*) FROM win_loss_analysis
  UNION ALL SELECT 'Comments', COUNT(*) FROM comments
  UNION ALL SELECT 'Mentions', COUNT(*) FROM mentions
  UNION ALL SELECT 'Discussions', COUNT(*) FROM discussions
  UNION ALL SELECT 'Integration_Logs', COUNT(*) FROM integration_logs
  UNION ALL SELECT 'DocuSign_Envelopes', COUNT(*) FROM docusign_envelopes
  UNION ALL SELECT 'User_Sessions', COUNT(*) FROM user_sessions
) t;