# AOPTool - Quick Start Commands

**Copy-paste ready commands to run AOPTool**

---

## 🪟 Windows 11 Commands

### Prerequisites Installation

```powershell
# 1. Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
# Run installer and restart computer

# 2. Install Git
# Download from: https://git-scm.com/download/win
# Run installer with default options

# 3. Verify installations
docker --version
docker-compose --version
git --version
```

### Clone and Setup

```powershell
# 1. Clone repository
git clone https://github.com/Pavankumar77theblaster/AOPTool.git
cd AOPTool

# 2. Copy environment file
copy .env.example .env

# 3. Edit .env file (use Notepad)
notepad .env

# REQUIRED: Set these in .env:
# CLAUDE_API_KEY=sk-ant-your-api-key-here
# ADMIN_PASSWORD=YourSecurePassword123!
# POSTGRES_PASSWORD=YourDatabasePassword123!
# JWT_SECRET_KEY=your-long-random-secret-key-here
```

### Start AOPTool

```powershell
# 1. Start all services
docker-compose up -d

# 2. Wait 30-60 seconds, then verify all services are running
docker-compose ps

# You should see all services with "Up (healthy)" status
```

### Access Dashboard

```powershell
# Open browser to:
# http://localhost:3000

# Login with:
# Username: admin
# Password: (whatever you set in .env as ADMIN_PASSWORD)
```

### Useful Commands

```powershell
# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f control_plane
docker-compose logs -f intelligence_plane
docker-compose logs -f web_dashboard

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart control_plane

# Check service status
docker-compose ps

# Check resource usage
docker stats

# Update code and restart
git pull
docker-compose down
docker-compose up -d --build
```

### Troubleshooting Windows

```powershell
# If port already in use
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill process by PID
taskkill /PID <PID> /F

# If Docker Desktop not starting
# Open Docker Desktop -> Settings -> Resources
# Increase Memory to 8GB, CPU to 4 cores

# Clean Docker cache
docker system prune -a
docker volume prune

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

---

## 🐧 Kali Linux Commands

### Prerequisites Installation

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Docker (Official Method - Recommended)
sudo apt remove -y docker docker-engine docker.io containerd runc
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  bullseye stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group (no sudo needed)
sudo usermod -aG docker $USER
newgrp docker

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker compose version
```

### Clone and Setup

```bash
# Clone repository
git clone https://github.com/Pavankumar77theblaster/AOPTool.git
cd AOPTool

# Copy environment file
cp .env.example .env

# Edit .env file
nano .env

# REQUIRED: Set these in .env:
# CLAUDE_API_KEY=sk-ant-your-api-key-here
# ADMIN_PASSWORD=YourSecurePassword123!
# POSTGRES_PASSWORD=YourDatabasePassword123!
# JWT_SECRET_KEY=your-long-random-secret-key-here

# Save: Ctrl+O, Enter
# Exit: Ctrl+X
```

### Start AOPTool

```bash
# Start all services
docker compose up -d

# Wait 30-60 seconds, then verify
docker compose ps

# All services should show "Up (healthy)" or "Up"
```

### Access Dashboard

```bash
# From Kali GUI, open browser to:
# http://localhost:3000

# Or from command line:
firefox http://localhost:3000 &

# Login:
# Username: admin
# Password: (whatever you set in .env)
```

### Useful Commands

```bash
# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f control_plane
docker compose logs -f intelligence_plane
docker compose logs -f celery_worker

# View last 100 lines
docker compose logs --tail=100 control_plane

# Stop all services
docker compose down

# Restart all services
docker compose restart

# Restart specific service
docker compose restart celery_worker

# Check service status
docker compose ps

# Check resource usage
docker stats

# Check Docker daemon
sudo systemctl status docker

# Update and restart
git pull
docker compose down
docker compose up -d --build
```

### Troubleshooting Kali

```bash
# If port already in use
sudo lsof -i :3000
sudo lsof -i :8000

# Kill process
sudo kill -9 <PID>

# If permission denied
sudo chown -R $USER:$USER .
sudo chmod -R 755 .

# Docker service not running
sudo systemctl start docker
sudo systemctl enable docker

# User not in docker group
sudo usermod -aG docker $USER
newgrp docker

# Clean Docker cache
docker system prune -a -f
docker volume prune -f

# Rebuild from scratch
docker compose down -v
docker compose up -d --build

# If out of disk space
docker system df
docker system prune -a --volumes -f

# Fix networking issues
docker network prune -f
docker compose down
docker compose up -d
```

---

## ⚡ Super Quick Start (For Experienced Users)

### Windows (One-liner)

```powershell
git clone https://github.com/Pavankumar77theblaster/AOPTool.git && cd AOPTool && copy .env.example .env && echo "Edit .env file, then run: docker-compose up -d"
```

### Kali Linux (One-liner)

```bash
git clone https://github.com/Pavankumar77theblaster/AOPTool.git && cd AOPTool && cp .env.example .env && echo "Edit .env file, then run: docker compose up -d"
```

**Remember:** You MUST edit `.env` and set your API keys before running `docker compose up -d`!

---

## 🔧 Essential .env Variables

**Minimum required settings:**

```bash
# AI API Key (REQUIRED for attack planning)
CLAUDE_API_KEY=sk-ant-api03-your-actual-key-here

# Admin password (REQUIRED for web dashboard login)
ADMIN_PASSWORD=Admin@2025!Secure

# Database passwords (RECOMMENDED to change)
POSTGRES_PASSWORD=secure_postgres_password
MONGODB_PASSWORD=secure_mongodb_password

# JWT secret (RECOMMENDED to change)
JWT_SECRET_KEY=your-very-long-random-secret-key-at-least-64-characters-long

# Optional: OpenAI API (fallback if Claude unavailable)
OPENAI_API_KEY=sk-your-openai-key-here
```

---

## 📋 Service Ports Reference

| Service | Port | URL |
|---------|------|-----|
| Web Dashboard | 3000 | http://localhost:3000 |
| Control Plane API | 8000 | http://localhost:8000/docs |
| Intelligence Plane | 5000 | http://localhost:5000/docs |
| Reporting Plane | 6000 | http://localhost:6000/docs |
| PostgreSQL | 5432 | localhost:5432 |
| MongoDB | 27017 | localhost:27017 |
| Redis | 6379 | localhost:6379 |
| MinIO Console | 9001 | http://localhost:9001 |

---

## 🚀 Complete Workflow Commands

### First Time Setup

**Windows:**
```powershell
# 1. Clone
git clone https://github.com/Pavankumar77theblaster/AOPTool.git
cd AOPTool

# 2. Configure
copy .env.example .env
notepad .env
# Set: CLAUDE_API_KEY, ADMIN_PASSWORD, POSTGRES_PASSWORD

# 3. Start
docker-compose up -d

# 4. Check
docker-compose ps
# Wait until all show "Up (healthy)"

# 5. Access
start http://localhost:3000
```

**Kali Linux:**
```bash
# 1. Clone
git clone https://github.com/Pavankumar77theblaster/AOPTool.git
cd AOPTool

# 2. Configure
cp .env.example .env
nano .env
# Set: CLAUDE_API_KEY, ADMIN_PASSWORD, POSTGRES_PASSWORD
# Ctrl+O to save, Ctrl+X to exit

# 3. Start
docker compose up -d

# 4. Check
docker compose ps
# Wait until all show "Up (healthy)"

# 5. Access
firefox http://localhost:3000 &
```

### Daily Use

**Windows:**
```powershell
cd AOPTool
docker-compose up -d
start http://localhost:3000
```

**Kali Linux:**
```bash
cd AOPTool
docker compose up -d
firefox http://localhost:3000 &
```

### Shutdown

**Windows:**
```powershell
cd AOPTool
docker-compose down
```

**Kali Linux:**
```bash
cd AOPTool
docker compose down
```

### Update to Latest Version

**Windows:**
```powershell
cd AOPTool
docker-compose down
git pull
docker-compose up -d --build
```

**Kali Linux:**
```bash
cd AOPTool
docker compose down
git pull
docker compose up -d --build
```

---

## 🆘 Emergency Commands

### Everything Broken? Nuclear Reset

**Windows:**
```powershell
cd AOPTool
docker-compose down -v
docker system prune -a -f
docker volume prune -f
docker-compose up -d --build
```

**Kali Linux:**
```bash
cd AOPTool
docker compose down -v
docker system prune -a -f
docker volume prune -f
docker compose up -d --build
```

**⚠️ WARNING:** This deletes ALL data (targets, plans, executions, evidence)!

### Backup Database Before Reset

**Windows:**
```powershell
docker exec aoptool_postgres pg_dump -U aoptool_user aoptool > backup_$(Get-Date -Format "yyyy-MM-dd").sql
```

**Kali Linux:**
```bash
docker exec aoptool_postgres pg_dump -U aoptool_user aoptool > backup_$(date +%Y-%m-%d).sql
```

---

## ✅ Success Checklist

After running `docker compose up -d`, verify:

```bash
# 1. All containers running
docker compose ps
# Should show 12 services, all "Up" or "Up (healthy)"

# 2. Web dashboard accessible
# Open: http://localhost:3000
# Should see login page

# 3. Control plane healthy
# Open: http://localhost:8000/health
# Should return: {"status":"healthy"}

# 4. Intelligence plane healthy
# Open: http://localhost:5000/health
# Should return: {"status":"healthy"}

# 5. No errors in logs
docker compose logs --tail=50
# Should not see ERROR or CRITICAL messages
```

If all 5 checks pass → ✅ **AOPTool is ready to use!**

---

**For detailed guides, see:**
- Installation: [KALI_INSTALL.md](KALI_INSTALL.md)
- Web Dashboard: [WEB_DASHBOARD_GUIDE.md](WEB_DASHBOARD_GUIDE.md)
- API Usage: [USAGE_GUIDE.md](USAGE_GUIDE.md)
