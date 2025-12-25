# AOPTool - Complete Setup Guide

**Last Updated:** 2025-12-26
**For:** Windows 11, 16GB RAM, RTX 3050 GPU

---

## 📋 Prerequisites

Before starting, ensure you have:

1. **Docker Desktop for Windows** (Required)
   - Download: https://www.docker.com/products/docker-desktop/
   - Minimum version: 20.10+
   - Enable WSL 2 backend during installation

2. **Git** (Should already be installed)
   - Verify: `git --version`

3. **System Requirements**
   - Windows 11
   - 16GB RAM minimum
   - 20GB free disk space
   - Internet connection (for pulling Docker images)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Verify Docker is Running

```bash
# Open PowerShell or Command Prompt
docker --version
docker-compose --version

# Test Docker is working
docker run hello-world
```

**Expected output:** "Hello from Docker!" message

**If Docker command not found:**
- Start Docker Desktop from Start Menu
- Wait for Docker to fully start (whale icon in system tray)
- Restart terminal and try again

### Step 2: Navigate to Project

```bash
cd C:\Users\pavan\Desktop\AOPTool
```

### Step 3: Start Everything

**Windows:**
```bash
# Double-click start.bat
# OR run in Command Prompt:
start.bat
```

**Or manually:**
```bash
docker-compose up -d
```

### Step 4: Verify Services Are Running

```bash
docker-compose ps
```

**All services should show as "healthy" or "Up"**

### Step 5: Access AOPTool

Open your browser and go to:

- **Web Dashboard:** http://localhost:3000
- **API Documentation:** http://localhost:8000/docs
- **MinIO Console:** http://localhost:9001

**Default Login Credentials:**
- Username: `admin`
- Password: `Admin@2025!Secure` (set in .env file)

---

## 📖 Detailed Setup Instructions

### 1. Environment Configuration

The `.env` file has been auto-generated with secure passwords.

**Important variables to check:**

```bash
# Open .env file
notepad .env
```

**Add your AI API keys (optional but recommended for AI features):**

```env
CLAUDE_API_KEY=sk-ant-YOUR_KEY_HERE
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

**Get API keys:**
- Claude: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys

### 2. First-Time Build

When running for the first time, Docker needs to build containers (~5-10 minutes):

```bash
# Build all containers
docker-compose build

# Start services
docker-compose up -d

# Watch logs to see startup progress
docker-compose logs -f
```

**Press Ctrl+C to stop viewing logs** (services continue running)

### 3. Verify Database Initialization

Check that databases initialized correctly:

```bash
# PostgreSQL
docker-compose exec postgres psql -U aoptool_user -d aoptool -c "\dt"

# Expected: List of 8 tables (targets, attacks, attack_plans, etc.)
```

```bash
# MongoDB
docker-compose exec mongodb mongosh -u aoptool_user -p changeme --authenticationDatabase admin aoptool --eval "show collections"

# Expected: attack_memory, training_resources, model_versions
```

### 4. Test API Endpoints

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-26T...",
  "service": "control_plane",
  "version": "1.0.0",
  "database": "connected"
}
```

**Login to get JWT token:**
```bash
curl -X POST http://localhost:8000/token \
  -d "username=admin&password=Admin@2025!Secure"
```

**Expected response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

---

## 🎯 Using AOPTool

### Workflow Overview

```
1. Add target to scope whitelist (admin only)
   ↓
2. Create target in system
   ↓
3. Create attack plan for target
   ↓
4. Approve attack plan
   ↓
5. Monitor execution in real-time
   ↓
6. Review evidence and reports
```

### Example: Adding Your First Target

**1. Add to Whitelist (via API):**

```bash
# Get auth token first
TOKEN=$(curl -s -X POST http://localhost:8000/token \
  -d "username=admin&password=Admin@2025!Secure" | jq -r .access_token)

# Add test domain to whitelist
curl -X POST http://localhost:8000/scope/whitelist \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entry_type": "domain",
    "value": "example.com",
    "description": "Test target for demonstration"
  }'
```

**2. Create Target:**

```bash
curl -X POST http://localhost:8000/targets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Example Website",
    "url_or_ip": "https://example.com",
    "scope": "in_scope",
    "risk_tolerance": "low",
    "owner_approval": true
  }'
```

**3. List Available Attacks:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/attacks
```

**4. Create Attack Plan:**

```bash
curl -X POST http://localhost:8000/attack_plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_id": 1,
    "attack_sequence": [1, 2, 3],
    "scheduling": "manual_trigger",
    "max_risk_level": "low"
  }'
```

---

## 🛠️ Management Commands

### Start Services

```bash
# Windows
start.bat

# Manual
docker-compose up -d
```

### Stop Services

```bash
# Windows
stop.bat

# Manual
docker-compose down
```

### View Logs

```bash
# Windows
logs.bat

# Manual - all services
docker-compose logs -f

# Specific service
docker-compose logs -f control_plane
```

### Check Status

```bash
# Windows
status.bat

# Manual
docker-compose ps
```

### Rebuild After Code Changes

```bash
# Windows
rebuild.bat

# Manual
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Clean Everything (including data)

**⚠️ WARNING: This deletes all data!**

```bash
docker-compose down -v
```

---

## 🔍 Troubleshooting

### Issue: "Docker command not found"

**Solution:**
1. Ensure Docker Desktop is installed
2. Start Docker Desktop from Windows Start Menu
3. Wait for Docker icon in system tray to show "running"
4. Restart your terminal
5. Try `docker --version` again

### Issue: "Port already in use"

```
Error: bind: address already in use
```

**Solution:**
```bash
# Find what's using the port
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <process_id> /F

# Or change port in docker-compose.yml
```

### Issue: "Container unhealthy"

**Solution:**
```bash
# Check container logs
docker-compose logs <service_name>

# Restart specific service
docker-compose restart <service_name>

# Full restart
docker-compose down
docker-compose up -d
```

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Wait for databases to be ready (takes ~30 seconds)
docker-compose logs postgres

# Look for: "database system is ready to accept connections"

# Force restart databases
docker-compose restart postgres mongodb redis
```

### Issue: "API returns 401 Unauthorized"

**Solution:**
1. Verify you're using correct credentials
2. Get new JWT token (tokens expire after 24 hours)
3. Check `.env` file has correct `ADMIN_PASSWORD`

### Issue: "Out of memory"

**Solution:**
```bash
# Check memory usage
docker stats

# Reduce Celery workers in .env
CELERY_WORKER_CONCURRENCY=2  # Default is 4

# Restart
docker-compose down
docker-compose up -d
```

---

## 📊 System Architecture

AOPTool runs 10 containers:

| Container | Port | Purpose |
|-----------|------|---------|
| postgres | 5432 | Main database (targets, attacks, evidence) |
| mongodb | 27017 | Attack memory, learning data |
| redis | 6379 | Task queue broker |
| minio | 9000, 9001 | Evidence storage (S3-compatible) |
| control_plane | 8000 | REST API backend |
| intelligence_plane | - | AI reasoning (internal) |
| execution_plane | - | Attack orchestration (internal) |
| celery_worker | - | Distributed task execution |
| celery_beat | - | Task scheduler |
| web_dashboard | 3000 | React frontend |

**Network:** All containers communicate via `aoptool_network` bridge

**Data Persistence:** PostgreSQL, MongoDB, Redis, MinIO use Docker volumes

---

## 🔐 Security Notes

### Default Passwords

**Change these immediately in production!**

Located in `.env` file:
- Admin password: `Admin@2025!Secure`
- Database passwords: Auto-generated secure passwords
- JWT secret: Auto-generated

### Scope Validation

**CRITICAL:** AOPTool will NOT attack any target unless it's explicitly whitelisted.

**Whitelist locations:**
1. Database: `scope_whitelist` table
2. API: `POST /scope/whitelist`
3. Pre-configured: localhost, 127.0.0.1, Docker network

**To test safely:**
- Use OWASP Juice Shop: `docker run -d -p 3001:3000 bkimminich/juice-shop`
- Add `localhost:3001` to whitelist
- Create target pointing to `http://localhost:3001`

### Audit Trail

All actions are logged to `audit_log` table:
- User actions
- Target creations
- Attack executions
- Scope violations (blocked attempts)

**View audit log:**
```bash
docker-compose exec postgres psql -U aoptool_user -d aoptool \
  -c "SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 10;"
```

---

## 🎓 Next Steps

### 1. Familiarize Yourself

- Explore API documentation: http://localhost:8000/docs
- Test endpoints with sample data
- Review logs to understand system behavior

### 2. Add AI Capabilities (Optional)

- Add Claude or OpenAI API key to `.env`
- Restart services: `docker-compose restart`
- AI will power attack planning and translation

### 3. Test on Safe Targets

Deploy vulnerable applications for testing:

```bash
# OWASP Juice Shop
docker run -d -p 3001:3000 bkimminich/juice-shop

# DVWA
docker run -d -p 3002:80 vulnerables/web-dvwa

# Add to whitelist and test!
```

### 4. Explore Training Model

Add exploit descriptions to `training_model/` folder:
- Text files in `training_model/exploits/`
- Attack diagrams in `training_model/attack_flows/`
- AI will process and convert to executable attacks

### 5. Monitor and Learn

- Watch Celery worker logs: `docker-compose logs -f celery_worker`
- Check MongoDB for learning patterns
- Review generated reports in `reports/` folder

---

## 📞 Getting Help

### Documentation Files

- `SESSION_HANDOFF.md` - Quick reference for resuming work
- `ARCHITECTURE.md` - Complete technical architecture
- `DECISIONS.md` - All architectural decisions
- `IMPLEMENTATION_LOG.md` - Chronological development log
- `README.md` - Project overview

### Logs and Debugging

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f control_plane

# Last 100 lines
docker-compose logs --tail=100 control_plane

# Follow logs for multiple services
docker-compose logs -f control_plane intelligence_plane execution_plane
```

### Common Commands Reference

```bash
# Container management
docker-compose ps                    # List all containers
docker-compose restart <service>     # Restart specific service
docker-compose exec <service> bash   # Shell into container

# Database access
docker-compose exec postgres psql -U aoptool_user -d aoptool
docker-compose exec mongodb mongosh -u aoptool_user -p <password> --authenticationDatabase admin

# Cleanup
docker-compose down                  # Stop all services
docker-compose down -v               # Stop and delete all data
docker system prune -a               # Clean all unused Docker resources
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Docker Desktop is running
- [ ] All containers are "healthy": `docker-compose ps`
- [ ] Web dashboard loads: http://localhost:3000
- [ ] API docs load: http://localhost:8000/docs
- [ ] Can login with admin credentials
- [ ] Can create scope whitelist entry
- [ ] Can create target
- [ ] Can create attack plan
- [ ] Can view audit logs
- [ ] MinIO console accessible: http://localhost:9001

---

## 🎉 You're Ready!

AOPTool is now fully operational. Start by:
1. Adding test targets
2. Creating attack plans
3. Monitoring execution
4. Reviewing evidence

**Remember:** Always get proper authorization before testing any target!

---

**Project Location:** `C:/Users/pavan/Desktop/AOPTool`
**GitHub Repository:** https://github.com/Pavankumar77theblaster/AOPTool
**Version:** 1.0.0-alpha
