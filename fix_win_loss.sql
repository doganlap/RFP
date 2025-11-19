INSERT INTO win_loss_analysis (id, rfp_id, tenant_id, status, primary_reason, secondary_reasons, competitors, feedback, analyzed_by_id, created_at, updated_at) 
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM rfps ORDER BY RANDOM() LIMIT 1),
    (SELECT tenant_id FROM rfps ORDER BY RANDOM() LIMIT 1),
    'won',
    'Superior technical solution',
    ARRAY['Better pricing', 'Proven track record'],
    ARRAY['Competitor A', 'Competitor B'],
    'Analysis record #' || generate_series,
    (SELECT id FROM users WHERE role IN ('sales_manager', 'presales_lead') ORDER BY RANDOM() LIMIT 1),
    NOW() - INTERVAL '1 day' * (generate_series % 180),
    NOW() - INTERVAL '1 day' * (generate_series % 30)
FROM generate_series(1, 100);