@echo off
echo Connecting to Prisma Cloud PostgreSQL Database...
echo.

REM Set environment variables for the cloud database
set PGHOST=db.prisma.io
set PGPORT=5432
set PGDATABASE=postgres
set PGUSER=4b27279d441b0b3dbc72afd64ef1ebe7c1758646d9739580494973a5d87d86a5
set PGPASSWORD=sk_-u2O2542aeQD0B-U8GRPd
set PGSSLMODE=require

REM Test connection
echo Testing connection...
psql -c "SELECT version();"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to connect to cloud database
    pause
    exit /b 1
)

echo.
echo ✅ Connected to Prisma Cloud Database successfully!
echo Setting up schema and seeding with 100 rows per table...
echo.

REM Setup schema
echo Creating schema...
psql -f database/schema.sql

REM Run enhanced seeding
echo Seeding database with enhanced data...
psql -f database/enhanced_seed_fixed.sql

REM Complete remaining tables
echo Completing all tables to 100 rows...
psql -f database/final_seed_completion.sql

REM Fix win_loss table
echo Fixing win_loss_analysis table...
psql -f fix_win_loss.sql

REM Check final counts
echo.
echo 📊 Final Record Counts:
psql -f check_counts.sql

echo.
echo 🎉 Cloud database successfully enriched with 100+ rows per table!
echo Database: Prisma Cloud PostgreSQL
echo Host: db.prisma.io:5432

pause