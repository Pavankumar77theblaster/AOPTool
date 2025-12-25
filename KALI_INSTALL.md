# Kali Linux Installation Guide for AOPTool

**Complete step-by-step installation guide for running AOPTool on Kali Linux**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Preparation](#system-preparation)
3. [Docker Installation](#docker-installation)
4. [AOPTool Installation](#aoptool-installation)
5. [Configuration](#configuration)
6. [Starting Services](#starting-services)
7. [Verification](#verification)
8. [First Time Setup](#first-time-setup)
9. [Troubleshooting](#troubleshooting)
10. [Kali-Specific Tips](#kali-specific-tips)

---

## Prerequisites

### System Requirements

- **OS**: Kali Linux 2023.4 or newer (Recommended: Latest Rolling Release)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 20GB free space minimum
- **CPU**: 2+ cores (4+ cores recommended)
- **Network**: Internet connection for Docker images and AI API

### Required Permissions

You need **root/sudo** access for:
- Installing Docker
- Running Docker Compose
- Managing system services

---

## System Preparation

### Step 1: Update System

```bash
# Update package lists
sudo apt update

# Upgrade all packages (recommended before installation)
sudo apt upgrade -y

# Reboot if kernel was updated
# sudo reboot  # Uncomment if prompted
```

### Step 2: Install Prerequisites

```bash
# Install essential build tools and utilities
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    git \
    jq \
    wget
```

---

## Docker Installation

### Option 1: Install Docker (Official Method - Recommended)

```bash
# 1. Remove any old Docker installations
sudo apt remove -y docker docker-engine docker.io containerd runc

# 2. Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3. Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Verify installation
docker --version
docker compose version
```

**Expected Output:**
```
Docker version 24.0.7, build afdd53b
Docker Compose version v2.23.0
```

### Option 2: Install Docker (Kali Repository)

```bash
# Install from Kali repos (simpler but may be older version)
sudo apt install -y docker.io docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Configure Docker

```bash
# 1. Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# 2. Add your user to docker group (avoid sudo for docker commands)
sudo usermod -aG docker $USER

# 3. Apply group changes (re-login or run this)
newgrp docker

# 4. Verify Docker works without sudo
docker run hello-world
```

**Expected Output:**
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

---

## AOPTool Installation

### Step 1: Clone Repository

```bash
# Navigate to your preferred directory
cd ~

# Clone AOPTool repository
git clone https://github.com/Pavankumar77theblaster/AOPTool.git

# Enter project directory
cd AOPTool

# Verify files
ls -la
```

**You should see:**
```
drwxr-xr-x  control_plane/
drwxr-xr-x  intelligence_plane/
drwxr-xr-x  execution_plane/
drwxr-xr-x  reporting_plane/
drwxr-xr-x  web_dashboard/
-rw-r--r--  docker-compose.yml
-rw-r--r--  .env.example
-rw-r--r--  README.md
...
```

### Step 2: Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Open for editing
nano .env
```

### Step 3: Configure Environment Variables

**Edit `.env` file with the following:**

```bash
# ===================================
# DATABASE CREDENTIALS
# ===================================
# PostgreSQL (Change these!)
POSTGRES_DB=aoptool
POSTGRES_USER=aoptool_user
POSTGRES_PASSWORD=YourSecurePassword123!  # CHANGE THIS

# MongoDB (Change these!)
MONGODB_DATABASE=aoptool
MONGODB_USER=aoptool_user
MONGODB_PASSWORD=YourSecurePassword456!  # CHANGE THIS

# Redis (Change this!)
REDIS_PASSWORD=YourSecurePassword789!  # CHANGE THIS

# MinIO (Change these!)
MINIO_USER=minioadmin
MINIO_PASSWORD=YourSecurePassword012!  # CHANGE THIS

# ===================================
# APPLICATION SETTINGS
# ===================================
# Admin credentials for web dashboard
ADMIN_PASSWORD=Admin@2025!Secure  # CHANGE THIS

# JWT secret for authentication
JWT_SECRET=YourVerySecureRandomString123456789  # CHANGE THIS
JWT_EXPIRATION_HOURS=24

# ===================================
# AI API KEYS (REQUIRED for AI features)
# ===================================
# Get from: https://console.anthropic.com/
CLAUDE_API_KEY=sk-ant-your-api-key-here  # REQUIRED

# Alternative: OpenAI (if not using Claude)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-key-here  # OPTIONAL

# ===================================
# OPTIONAL SETTINGS
# ===================================
# Enable AI translation (true/false)
ENABLE_AI_TRANSLATION=true

# Use local LLM instead of API (experimental)
USE_LOCAL_LLM=false

# Log level (DEBUG, INFO, WARNING, ERROR)
LOG_LEVEL=INFO

# Environment mode
ENVIRONMENT=development

# CORS origins (for web dashboard)
CORS_ORIGINS=http://localhost:3000

# ===================================
# EXECUTION PLANE SETTINGS
# ===================================
MAX_CONCURRENT_ATTACKS=10
RATE_LIMIT_PER_MINUTE=100
CELERY_WORKER_CONCURRENCY=4

# ===================================
# DO NOT MODIFY BELOW (URLs)
# ===================================
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000/ws
```

**Save file:** Press `Ctrl+X`, then `Y`, then `Enter`

### Important Configuration Notes

1. **Change ALL passwords** - Don't use defaults in production!
2. **CLAUDE_API_KEY** - Required for AI features. Get free tier at [Anthropic Console](https://console.anthropic.com/)
3. **ADMIN_PASSWORD** - This is your web dashboard login password
4. **JWT_SECRET** - Use a random 32+ character string

**Generate secure passwords:**
```bash
# Generate random password
openssl rand -base64 32
```

---

## Starting Services

### Step 1: Build Docker Images

```bash
# Build all containers (first time only, takes 10-15 minutes)
docker-compose build

# Watch build progress
# This downloads base images and installs dependencies
```

### Step 2: Start All Services

```bash
# Start all services in background
docker-compose up -d

# Watch startup logs (optional)
docker-compose logs -f
```

**Expected startup time:** 2-3 minutes

### Step 3: Monitor Service Health

```bash
# Check container status
docker-compose ps
```

**All services should show `Up (healthy)`:**

```
NAME                          STATUS
aoptool_postgres              Up (healthy)
aoptool_mongodb               Up (healthy)
aoptool_redis                 Up (healthy)
aoptool_minio                 Up (healthy)
aoptool_control_plane         Up (healthy)
aoptool_intelligence_plane    Up
aoptool_execution_plane       Up
aoptool_celery_worker         Up
aoptool_celery_beat           Up
aoptool_web_dashboard         Up
aoptool_reporting_plane       Up
```

---

## Verification

### Verify Each Service

```bash
# 1. Control Plane API (Port 8000)
curl http://localhost:8000/health

# Expected: {"status":"healthy","service":"control_plane","timestamp":"..."}

# 2. Intelligence Plane API (Port 5000)
curl http://localhost:5000/health

# Expected: {"status":"healthy","service":"intelligence_plane","timestamp":"..."}

# 3. Reporting Plane API (Port 6000)
curl http://localhost:6000/health

# Expected: {"status":"healthy","service":"reporting_plane","timestamp":"..."}

# 4. Web Dashboard (Port 3000)
curl http://localhost:3000

# Expected: HTML content (web page)

# 5. PostgreSQL Database
docker-compose exec postgres psql -U aoptool_user -d aoptool -c "SELECT 1;"

# Expected:
#  ?column?
# ----------
#         1

# 6. MongoDB Database
docker-compose exec mongodb mongosh -u aoptool_user -p YourMongoPassword --authenticationDatabase admin --eval "db.adminCommand('ping')"

# Expected: { ok: 1 }

# 7. Redis Cache
docker-compose exec redis redis-cli -a YourRedisPassword PING

# Expected: PONG

# 8. MinIO Storage (Port 9001)
curl http://localhost:9001/minio/health/live

# Expected: HTTP 200 OK
```

### Check Logs for Errors

```bash
# View logs for all services
docker-compose logs --tail=50

# View specific service logs
docker-compose logs -f control_plane
docker-compose logs -f intelligence_plane
docker-compose logs -f web_dashboard
```

**Look for errors starting with `ERROR` or `CRITICAL`**

---

## First Time Setup

### Step 1: Access Web Dashboard

```bash
# Open browser (in Kali Linux)
firefox http://localhost:3000 &

# Or use xdg-open
xdg-open http://localhost:3000
```

### Step 2: Login

**Credentials:**
- **Username:** `admin`
- **Password:** (what you set in `.env` as `ADMIN_PASSWORD`)

Default: `Admin@2025!Secure`

### Step 3: API Documentation

Access interactive API docs:

```bash
# Control Plane API docs
firefox http://localhost:8000/docs &

# Intelligence Plane API docs
firefox http://localhost:5000/docs &

# Reporting Plane API docs
firefox http://localhost:6000/docs &
```

### Step 4: Test AI Integration

```bash
# Test Claude API connection
curl -X POST http://localhost:5000/translate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Scan this website for vulnerabilities",
    "target_id": 1,
    "risk_level": "medium"
  }'
```

If successful, you'll get a JSON response with attack sequence.

---

## Troubleshooting

### Issue 1: Docker Permission Denied

**Error:**
```
Got permission denied while trying to connect to the Docker daemon socket
```

**Fix:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Re-login or run
newgrp docker

# Try command again
docker ps
```

### Issue 2: Port Already in Use

**Error:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use
```

**Fix:**
```bash
# Find process using port
sudo lsof -i :3000

# Kill process (replace PID)
sudo kill -9 PID

# Or change port in docker-compose.yml
nano docker-compose.yml
# Change "3000:3000" to "3001:3000"
```

### Issue 3: Out of Memory

**Error:**
```
Cannot allocate memory
```

**Fix:**
```bash
# Check available memory
free -h

# Stop other services
sudo systemctl stop apache2 postgresql  # if running

# Reduce Docker memory usage
# Edit docker-compose.yml and reduce worker concurrency:
nano docker-compose.yml
# Find: CELERY_WORKER_CONCURRENCY=4
# Change to: CELERY_WORKER_CONCURRENCY=2

# Restart
docker-compose restart
```

### Issue 4: Database Connection Refused

**Error:**
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Fix:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# If not healthy, check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Wait 30 seconds for health check
sleep 30

# Try again
docker-compose restart control_plane
```

### Issue 5: Web Dashboard Not Loading

**Error:**
Blank page or connection refused

**Fix:**
```bash
# Check if container is running
docker-compose ps web_dashboard

# Check logs
docker-compose logs -f web_dashboard

# Look for compilation errors

# Restart web dashboard
docker-compose restart web_dashboard

# Clear browser cache
# Or try incognito mode
```

### Issue 6: AI Not Responding

**Error:**
```
AI translation failed: Invalid API key
```

**Fix:**
```bash
# Verify API key is set
docker-compose exec intelligence_plane env | grep CLAUDE_API_KEY

# If empty or wrong, edit .env
nano .env

# Update CLAUDE_API_KEY
# Save and restart
docker-compose restart intelligence_plane

# Test API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hi"}]
  }'
```

---

## Kali-Specific Tips

### Firewall Configuration

```bash
# Allow Docker ports (if ufw enabled)
sudo ufw allow 3000/tcp  # Web Dashboard
sudo ufw allow 8000/tcp  # Control Plane
sudo ufw allow 5000/tcp  # Intelligence Plane
sudo ufw allow 6000/tcp  # Reporting Plane
sudo ufw allow 9000/tcp  # MinIO API
sudo ufw allow 9001/tcp  # MinIO Console

# Reload firewall
sudo ufw reload
```

### Running as Non-Root (Recommended)

```bash
# Create AOPTool user (optional, for isolation)
sudo useradd -m -s /bin/bash aoptool
sudo usermod -aG docker aoptool

# Switch to aoptool user
sudo su - aoptool

# Clone and run as this user
cd ~
git clone https://github.com/Pavankumar77theblaster/AOPTool.git
cd AOPTool
# ... continue installation
```

### Start on Boot

```bash
# Enable Docker to start on boot
sudo systemctl enable docker

# Create systemd service for AOPTool (optional)
sudo nano /etc/systemd/system/aoptool.service
```

**Add this content:**
```ini
[Unit]
Description=AOPTool Penetration Testing Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/YOUR_USERNAME/AOPTool
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
User=YOUR_USERNAME

[Install]
WantedBy=multi-user.target
```

**Enable service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable aoptool
sudo systemctl start aoptool
```

### Integration with Kali Tools

```bash
# AOPTool can orchestrate native Kali tools
# Ensure these are installed (most are by default):

# Check installed tools
which nmap sqlmap metasploit-framework

# Install missing tools
sudo apt install -y \
    nmap \
    sqlmap \
    metasploit-framework \
    nikto \
    gobuster \
    masscan
```

### Performance Tuning for Kali

```bash
# Increase Docker resources
sudo nano /etc/docker/daemon.json
```

**Add:**
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
```

```bash
# Restart Docker
sudo systemctl restart docker

# Restart AOPTool
cd ~/AOPTool
docker-compose restart
```

---

## Useful Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart control_plane

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Database Access

```bash
# PostgreSQL CLI
docker-compose exec postgres psql -U aoptool_user -d aoptool

# MongoDB CLI
docker-compose exec mongodb mongosh -u aoptool_user -p YourPassword --authenticationDatabase admin

# Redis CLI
docker-compose exec redis redis-cli -a YourPassword
```

### Backup & Restore

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U aoptool_user aoptool > backup_$(date +%Y%m%d).sql

# Restore PostgreSQL
cat backup_20250126.sql | docker-compose exec -T postgres psql -U aoptool_user -d aoptool

# Backup MongoDB
docker-compose exec mongodb mongodump --username aoptool_user --password YourPassword --authenticationDatabase admin --out /backup

# Backup everything (volumes)
docker run --rm -v aoptool_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

### Update AOPTool

```bash
# Pull latest code
cd ~/AOPTool
git pull

# Rebuild containers
docker-compose down
docker-compose build
docker-compose up -d
```

---

## Next Steps

After successful installation:

1. **Read Usage Guide**: [USAGE_GUIDE.md](USAGE_GUIDE.md)
2. **Try Example Workflow**: Create a target and run your first scan
3. **Explore API**: http://localhost:8000/docs
4. **Generate Report**: Test PDF report generation

---

## Support

Having issues? Check:
- [Troubleshooting Section](#troubleshooting) (above)
- [GitHub Issues](https://github.com/Pavankumar77theblaster/AOPTool/issues)
- [Full Documentation](README.md)

---

**Installation Complete! You're ready to start penetration testing with AOPTool** 🎉

[⬆ Back to Top](#kali-linux-installation-guide-for-aoptool)
