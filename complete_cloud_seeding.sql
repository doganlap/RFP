-- Complete seeding for remaining tables in cloud database

-- Integration Logs (100 records)
INSERT INTO integration_logs (id, tenant_id, integration_name, direction, endpoint, status_code, executed_at)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM tenants ORDER BY RANDOM() LIMIT 1),
    (ARRAY['Salesforce', 'HubSpot', 'Microsoft Dynamics', 'SAP', 'Oracle', 'ServiceNow', 'Slack', 'Teams', 'Zoom', 'DocuSign', 'Box', 'SharePoint', 'Jira', 'Confluence', 'Trello', 'Asana', 'Monday', 'Airtable', 'Zapier', 'Power BI'])[CEIL(RANDOM() * 20)],
    (ARRAY['inbound', 'outbound'])[CEIL(RANDOM() * 2)],
    (ARRAY['/api/v1/opportunities', '/services/data/v57.0/query', '/crm/v3/objects/deals', '/api/chat.postMessage', '/webhook', '/documents/upload', '/users/sync', '/projects/update', '/notifications/send', '/reports/generate'])[CEIL(RANDOM() * 10)],
    (ARRAY[200, 201, 204, 400, 401, 403, 404, 429, 500, 502, 503])[CEIL(RANDOM() * 11)],
    NOW() - INTERVAL '1 minute' * (generate_series * 5)
FROM generate_series(1, 100);

-- User Sessions (90 more records to reach 100 total)
INSERT INTO user_sessions (id, user_id, session_token, device_info, ip_address, user_agent, expires_at, is_active, created_at)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM users ORDER BY RANDOM() LIMIT 1),
    'sess_cloud_' || MD5(generate_series::text || RANDOM()::text),
    ('{"browser": "' || (ARRAY['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'])[CEIL(RANDOM() * 5)] || '", "os": "' || (ARRAY['Windows', 'macOS', 'Linux', 'iOS', 'Android'])[CEIL(RANDOM() * 5)] || '", "device": "' || (ARRAY['Desktop', 'Mobile', 'Tablet'])[CEIL(RANDOM() * 3)] || '"}')::jsonb,
    ('192.168.' || (generate_series % 255 + 1) || '.' || ((generate_series * 7) % 255 + 1))::inet,
    'Mozilla/5.0 (' || (ARRAY['Windows NT 10.0', 'Macintosh', 'X11; Linux x86_64', 'iPhone', 'Android'])[CEIL(RANDOM() * 5)] || ') Browser/Version',
    NOW() + INTERVAL '1 day' * (7 + (generate_series % 23)),
    CASE WHEN (generate_series % 5) = 0 THEN false ELSE true END,
    NOW() - INTERVAL '1 day' * (generate_series % 30)
FROM generate_series(11, 100)
ON CONFLICT (session_token) DO NOTHING;

-- Final count verification
SELECT 
    'FINAL CLOUD DATABASE SUMMARY' as title
UNION ALL
SELECT '======================================'
UNION ALL
SELECT table_name || ': ' || record_count::text || ' records'
FROM (
    SELECT 'Tenants' as table_name, COUNT(*) as record_count, 1 as sort_order FROM tenants
    UNION ALL SELECT 'Users', COUNT(*), 2 FROM users
    UNION ALL SELECT 'Clients', COUNT(*), 3 FROM clients
    UNION ALL SELECT 'RFPs', COUNT(*), 4 FROM rfps
    UNION ALL SELECT 'Win_Loss_Analysis', COUNT(*), 5 FROM win_loss_analysis
    UNION ALL SELECT 'Comments', COUNT(*), 6 FROM comments
    UNION ALL SELECT 'Mentions', COUNT(*), 7 FROM mentions
    UNION ALL SELECT 'Discussions', COUNT(*), 8 FROM discussions
    UNION ALL SELECT 'Integration_Logs', COUNT(*), 9 FROM integration_logs
    UNION ALL SELECT 'DocuSign_Envelopes', COUNT(*), 10 FROM docusign_envelopes
    UNION ALL SELECT 'User_Sessions', COUNT(*), 11 FROM user_sessions
) t
ORDER BY sort_order;

-- Success message
SELECT 
    '🎉 SUCCESS! Cloud database enriched!' as status,
    'All tables now contain 100+ realistic records for comprehensive testing and demonstration.' as description;