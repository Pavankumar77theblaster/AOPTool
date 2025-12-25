@echo off
REM AOPTool - Start All Services
REM This script starts all Docker containers

echo ========================================
echo AOPTool - Starting Services
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/3] Building containers (this may take a while on first run)...
docker-compose build

echo.
echo [2/3] Starting all services...
docker-compose up -d

echo.
echo [3/3] Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo Services Status:
echo ========================================
docker-compose ps

echo.
echo ========================================
echo AOPTool is Ready!
echo ========================================
echo.
echo Web Dashboard: http://localhost:3000
echo Control Plane API: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo MinIO Console: http://localhost:9001
echo.
echo To view logs: logs.bat
echo To stop: stop.bat
echo.
pause
