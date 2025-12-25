@echo off
REM AOPTool - Rebuild and Restart Services
REM Use this after making code changes

echo ========================================
echo AOPTool - Rebuild Services
echo ========================================
echo.

echo [1/3] Stopping services...
docker-compose down

echo.
echo [2/3] Rebuilding containers...
docker-compose build --no-cache

echo.
echo [3/3] Starting services...
docker-compose up -d

echo.
echo ========================================
echo Rebuild Complete!
echo ========================================
echo.
docker-compose ps
echo.
pause
