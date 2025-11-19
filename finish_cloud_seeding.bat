@echo off
echo Completing cloud database seeding...

REM Set environment variables
set PGHOST=db.prisma.io
set PGPORT=5432
set PGDATABASE=postgres
set PGUSER=4b27279d441b0b3dbc72afd64ef1ebe7c1758646d9739580494973a5d87d86a5
set PGPASSWORD=sk_-u2O2542aeQD0B-U8GRPd
set PGSSLMODE=require

REM Complete the seeding
echo Running final completion script...
psql -f complete_cloud_seeding.sql

echo.
echo ✅ Cloud database seeding completed!

pause