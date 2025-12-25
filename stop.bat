@echo off
REM AOPTool - Stop All Services

echo ========================================
echo AOPTool - Stopping Services
echo ========================================
echo.

docker-compose down

echo.
echo ========================================
echo All services stopped successfully!
echo ========================================
echo.
echo To start again: start.bat
echo.
pause
