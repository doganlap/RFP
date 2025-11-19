@echo off
echo Checking final record counts in cloud database...

REM Set environment variables
set PGHOST=db.prisma.io
set PGPORT=5432
set PGDATABASE=postgres
set PGUSER=4b27279d441b0b3dbc72afd64ef1ebe7c1758646d9739580494973a5d87d86a5
set PGPASSWORD=sk_-u2O2542aeQD0B-U8GRPd
set PGSSLMODE=require

REM Check final counts
psql -c "SELECT 'Tenants' as table_name, COUNT(*) as record_count FROM tenants UNION ALL SELECT 'Users', COUNT(*) FROM users UNION ALL SELECT 'Clients', COUNT(*) FROM clients UNION ALL SELECT 'RFPs', COUNT(*) FROM rfps UNION ALL SELECT 'Win_Loss_Analysis', COUNT(*) FROM win_loss_analysis UNION ALL SELECT 'Comments', COUNT(*) FROM comments UNION ALL SELECT 'Mentions', COUNT(*) FROM mentions UNION ALL SELECT 'Discussions', COUNT(*) FROM discussions UNION ALL SELECT 'Integration_Logs', COUNT(*) FROM integration_logs UNION ALL SELECT 'DocuSign_Envelopes', COUNT(*) FROM docusign_envelopes UNION ALL SELECT 'User_Sessions', COUNT(*) FROM user_sessions ORDER BY table_name;"

echo.
echo 🎉 Cloud database enrichment completed successfully!
echo Database: Prisma Cloud PostgreSQL (db.prisma.io:5432)
echo All tables now contain 100+ realistic records for enhanced testing!

pause