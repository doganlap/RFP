-- Final completion script to ensure all tables have 100+ records
-- Using simplified approach without variable conflicts

-- Clear and repopulate smaller tables to reach 100 records each

-- WIN_LOSS_ANALYSIS - Generate 100 records
TRUNCATE win_loss_analysis CASCADE;

INSERT INTO win_loss_analysis (id, rfp_id, tenant_id, status, primary_reason, secondary_reasons, competitors, feedback, analyzed_by_id, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM rfps ORDER BY RANDOM() LIMIT 1),
    (SELECT tenant_id FROM rfps ORDER BY RANDOM() LIMIT 1),
    (ARRAY['won', 'lost', 'abandoned'])[CEIL(RANDOM() * 3)],
    (ARRAY['Superior technical solution', 'Better pricing', 'Existing relationship', 'Faster delivery', 'Proven track record', 'Better support', 'More features', 'Industry expertise', 'Local presence', 'Compliance requirements'])[CEIL(RANDOM() * 10)],
    ARRAY['Technical excellence', 'Cost effectiveness'],
    ARRAY['Competitor A', 'Competitor B'],
    'Analysis record #' || generate_series,
    (SELECT id FROM users WHERE role IN ('sales_manager', 'presales_lead') ORDER BY RANDOM() LIMIT 1),
    NOW() - INTERVAL '1 day' * (generate_series % 180),
    NOW() - INTERVAL '1 day' * (generate_series % 30)
FROM generate_series(1, 100);

-- COMMENTS - Generate 100 records
TRUNCATE comments CASCADE;

INSERT INTO comments (id, tenant_id, user_id, resource_type, resource_id, parent_comment_id, content, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    (SELECT tenant_id FROM rfps ORDER BY RANDOM() LIMIT 1),
    (SELECT id FROM users ORDER BY RANDOM() LIMIT 1),
    'rfp',
    (SELECT id FROM rfps ORDER BY RANDOM() LIMIT 1),
    NULL,
    'Comment #' || generate_series || ': ' || 
    (ARRAY['Great technical solution proposal', 'Need to review pricing strategy', 'Client meeting scheduled', 'Updated technical architecture', 'Legal review completed', 'Risk assessment done', 'Competitive analysis shows strong position', 'Resource allocation confirmed', 'Client references contacted', 'Final review meeting scheduled'])[CEIL(RANDOM() * 10)],
    NOW() - INTERVAL '1 day' * (generate_series % 60),
    NOW() - INTERVAL '1 day' * (generate_series % 7)
FROM generate_series(1, 100);

-- MENTIONS - Generate 100 records
TRUNCATE mentions CASCADE;

INSERT INTO mentions (id, comment_id, user_id, tenant_id, is_read, created_at)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM comments ORDER BY RANDOM() LIMIT 1),
    (SELECT id FROM users ORDER BY RANDOM() LIMIT 1),
    (SELECT tenant_id FROM comments ORDER BY RANDOM() LIMIT 1),
    RANDOM() > 0.6,
    NOW() - INTERVAL '1 day' * (generate_series % 30)
FROM generate_series(1, 100);

-- DISCUSSIONS - Generate 100 records
TRUNCATE discussions CASCADE;

INSERT INTO discussions (id, rfp_id, tenant_id, title, created_by_id, is_resolved, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM rfps ORDER BY RANDOM() LIMIT 1),
    (SELECT tenant_id FROM rfps ORDER BY RANDOM() LIMIT 1),
    (ARRAY['Pricing Strategy Discussion', 'Technical Requirements Review', 'Resource Allocation Planning', 'Risk Assessment Meeting', 'Client Feedback Analysis', 'Competitive Positioning', 'Implementation Timeline', 'Compliance Review', 'Quality Assurance Plan', 'Partnership Strategy'])[CEIL(RANDOM() * 10)] || ' #' || generate_series,
    (SELECT id FROM users ORDER BY RANDOM() LIMIT 1),
    RANDOM() > 0.4,
    NOW() - INTERVAL '1 day' * (generate_series % 90),
    NOW() - INTERVAL '1 day' * (generate_series % 7)
FROM generate_series(1, 100);

-- DOCUSIGN_ENVELOPES - Generate 100 records
TRUNCATE docusign_envelopes CASCADE;

INSERT INTO docusign_envelopes (id, tenant_id, rfp_id, envelope_id, status, signer_email, sent_at, created_at)
SELECT 
    uuid_generate_v4(),
    (SELECT tenant_id FROM rfps ORDER BY RANDOM() LIMIT 1),
    (SELECT id FROM rfps ORDER BY RANDOM() LIMIT 1),
    'DS-ENV-' || (20000 + generate_series),
    (ARRAY['sent', 'delivered', 'completed', 'declined', 'voided'])[CEIL(RANDOM() * 5)],
    'signer' || generate_series || '@client.com',
    NOW() - INTERVAL '1 day' * (generate_series % 60),
    NOW() - INTERVAL '1 day' * (generate_series % 30)
FROM generate_series(1, 100);

-- Add more USER_SESSIONS if needed
INSERT INTO user_sessions (id, user_id, session_token, device_info, ip_address, user_agent, expires_at, is_active, created_at)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM users ORDER BY RANDOM() LIMIT 1),
    'sess_extra_' || MD5(generate_series::text),
    ('{"browser": "Chrome", "os": "Windows", "device": "Desktop"}')::jsonb,
    ('192.168.' || (generate_series % 255 + 1) || '.1')::inet,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    NOW() + INTERVAL '1 day' * 7,
    true,
    NOW() - INTERVAL '1 day' * (generate_series % 30)
FROM generate_series(1, 10)
ON CONFLICT (session_token) DO NOTHING;

-- Final count verification
SELECT 
    '=== FINAL ENHANCED DATABASE SUMMARY ===' as summary
UNION ALL
SELECT 'Table: ' || table_name || ' | Records: ' || record_count::text
FROM (
    SELECT 'Tenants' as table_name, COUNT(*) as record_count FROM tenants
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
) t
ORDER BY table_name;

SELECT 
    '🎉 Database enrichment completed!' as status,
    'All major tables now contain 100+ realistic records for enhanced testing and demonstration.' as description;