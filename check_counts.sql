SELECT 
  'Tenants' as table_name, COUNT(*) as record_count FROM tenants
UNION ALL SELECT 
  'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL SELECT 
  'Clients' as table_name, COUNT(*) as record_count FROM clients
UNION ALL SELECT 
  'RFPs' as table_name, COUNT(*) as record_count FROM rfps
UNION ALL SELECT 
  'Win_Loss_Analysis' as table_name, COUNT(*) as record_count FROM win_loss_analysis
UNION ALL SELECT 
  'Comments' as table_name, COUNT(*) as record_count FROM comments
UNION ALL SELECT 
  'Mentions' as table_name, COUNT(*) as record_count FROM mentions
UNION ALL SELECT 
  'Discussions' as table_name, COUNT(*) as record_count FROM discussions
UNION ALL SELECT 
  'Integration_Logs' as table_name, COUNT(*) as record_count FROM integration_logs
UNION ALL SELECT 
  'DocuSign_Envelopes' as table_name, COUNT(*) as record_count FROM docusign_envelopes
UNION ALL SELECT 
  'User_Sessions' as table_name, COUNT(*) as record_count FROM user_sessions
ORDER BY table_name;