@echo off
REM AOPTool - View Logs

echo ========================================
echo AOPTool - Container Logs
echo ========================================
echo.
echo Press Ctrl+C to stop viewing logs
echo.

docker-compose logs -f --tail=100
