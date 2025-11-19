@echo off
echo Setting up Enhanced RFP Database...
echo.

REM Set password for PostgreSQL
set PGPASSWORD=postgres

REM Navigate to project directory
cd /d "D:\Projects\RFP"

REM Create database if it doesn't exist (ignore error if exists)
echo Creating database...
psql -h localhost -U postgres -d postgres -c "CREATE DATABASE rfp_platform;" 2>nul

REM Run schema setup
echo Setting up schema...
psql -h localhost -U postgres -d rfp_platform -f database/schema.sql

REM Run enhanced seeding
echo Seeding database with 100 rows per table...
psql -h localhost -U postgres -d rfp_platform -f database/enhanced_seed.sql

echo.
echo ✅ Enhanced database setup completed!
echo Database: rfp_platform
echo Host: localhost:5432
echo User: postgres
echo.
echo 📊 Enhanced Data Summary:
echo   ✓ 10 Tenants
echo   ✓ 100 Users (distributed across tenants)
echo   ✓ 100 Clients
echo   ✓ 100 RFPs (with realistic statuses and values)
echo   ✓ 100 Win/Loss Analyses
echo   ✓ 100 Comments with threading
echo   ✓ 100 Mentions
echo   ✓ 100 Discussions
echo   ✓ 100 Integration logs
echo   ✓ 100 DocuSign envelopes
echo   ✓ 100 User sessions
echo   ✓ 100+ Additional records in supporting tables
echo.
echo 🎉 Database enriched with realistic sample data!

pause