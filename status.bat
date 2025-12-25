@echo off
REM AOPTool - Check Status

echo ========================================
echo AOPTool - Services Status
echo ========================================
echo.

docker-compose ps

echo.
echo ========================================
echo Container Health:
echo ========================================
docker-compose ps --format "table {{.Name}}\t{{.Status}}"

echo.
echo ========================================
echo Quick Links:
echo ========================================
echo Web Dashboard: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo MinIO Console: http://localhost:9001
echo.
pause
