# AOPTool - Quick Start Guide

**Get started in 5 minutes!**

---

## ✅ Prerequisites Check

```bash
# 1. Verify Docker is running
docker --version
docker-compose --version

# 2. Navigate to project
cd C:\Users\pavan\Desktop\AOPTool

# 3. Check all containers are up
docker-compose ps
```

**All should show "Up" or "healthy"** ✅

---

## 🚀 First-Time Setup (One-Time)

If containers aren't running:

```bash
# Start everything
docker-compose up -d

# Wait 30 seconds for databases to initialize

# Check status
docker-compose ps
```

---

## 🎯 Your First Attack Plan (Step-by-Step)

### Step 1: Get Authentication Token

```bash
curl -X POST http://localhost:8000/token \
  -d "username=admin&password=Admin@2025!Secure"
```

**Copy the `access_token` value** - you'll need it for next steps.

Or save it to a variable:

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/token \
  -d "username=admin&password=Admin@2025!Secure" | jq -r .access_token)

echo $TOKEN  # Should show: eyJhbGci...
```

### Step 2: Add Target to Whitelist

**⚠️ CRITICAL:** You MUST whitelist targets before testing!

```bash
curl -X POST http://localhost:8000/scope/whitelist \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entry_type": "domain",
    "value": "example.com",
    "description": "Test target - authorized"
  }'
```

**Response:** `{"success": true, ...}`

### Step 3: Create Target

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

**Response:** `{"target_id": 1, ...}`

**Note the `target_id`** - you'll use it next.

### Step 4: Generate Attack Plan with AI

```bash
curl -X POST http://localhost:5000/translate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Scan for web vulnerabilities and check security headers",
    "target_id": 1,
    "risk_level": "low"
  }'
```

**Response:**
```json
{
  "success": true,
  "attack_plan_id": 1,
  "attack_sequence": [6, 10, 16],
  "reasoning": "Start with HTTP headers check, then Nikto scan, followed by Nuclei vulnerability scan",
  "estimated_duration_minutes": 45,
  "risk_assessment": "low",
  "ai_model": "rule_based"
}
```

**Note the `attack_plan_id`** - this is your attack plan!

### Step 5: View Your Attack Plan

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/attack_plans/1
```

**You'll see:**
- Target details
- Attack sequence
- Status: "pending"
- Metadata

### Step 6: Execute the Plan (Optional - requires Python)

**If you have Python with Celery:**

```python
from celery import Celery

app = Celery(broker='redis://localhost:6379/0')

# Execute the plan
result = app.send_task('aoptool.orchestrate_attack_plan', args=[1])

# Wait for completion (may take several minutes)
print(result.get(timeout=600))
```

**Or manually approve via API:**

```bash
curl -X POST http://localhost:8000/attack_plans/1/approve \
  -H "Authorization: Bearer $TOKEN"
```

### Step 7: View Execution Results

```bash
# Check execution status
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/attack_executions?plan_id=1"

# View evidence collected
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/evidence
```

---

## 📚 Useful Commands

### View All Available Attacks

```bash
curl http://localhost:5000/attacks | jq '.attacks[] | {id, name, category, risk_level}'
```

**Returns 30 attacks** organized by category.

### Filter Attacks by Category

```bash
# Reconnaissance only
curl http://localhost:5000/attacks | jq '.attacks[] | select(.category=="recon")'

# Low risk only
curl http://localhost:5000/attacks | jq '.attacks[] | select(.risk_level=="low")'
```

### View Attack History

```bash
# See history for specific attack
curl http://localhost:5000/history/11  # Attack ID 11 (SQL Injection Scan)
```

### Check System Health

```bash
# Control Plane
curl http://localhost:8000/health

# Intelligence Plane
curl http://localhost:5000/health

# All containers
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f intelligence_plane
docker-compose logs -f celery_worker

# Last 50 lines
docker-compose logs --tail=50 control_plane
```

---

## 🎨 Example Attack Scenarios

### Scenario 1: Basic Web Reconnaissance

```bash
curl -X POST http://localhost:5000/translate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Perform basic reconnaissance on the web application",
    "target_id": 1,
    "risk_level": "low"
  }'
```

**AI suggests:** HTTP Headers → Technology Detection → Port Scan

### Scenario 2: Vulnerability Scanning

```bash
curl -X POST http://localhost:5000/translate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Find common web vulnerabilities like SQL injection and XSS",
    "target_id": 1,
    "risk_level": "medium"
  }'
```

**AI suggests:** Nikto → SQL Scan → XSS Scanner → Nuclei

### Scenario 3: WordPress Security Audit

```bash
curl -X POST http://localhost:5000/translate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Audit WordPress site for security issues",
    "target_id": 1,
    "risk_level": "medium"
  }'
```

**AI suggests:** HTTP Headers → WordPress Scan → Plugin Enumeration

---

## 🔧 Troubleshooting

### "Connection refused" errors

```bash
# Check if services are running
docker-compose ps

# Restart if needed
docker-compose restart control_plane intelligence_plane

# Wait 10 seconds then try again
```

### "401 Unauthorized"

```bash
# Token expired - get a new one
TOKEN=$(curl -s -X POST http://localhost:8000/token \
  -d "username=admin&password=Admin@2025!Secure" | jq -r .access_token)
```

### "Target not in whitelist"

```bash
# Add target to whitelist first
curl -X POST http://localhost:8000/scope/whitelist \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entry_type": "domain", "value": "your-target.com"}'
```

### Celery tasks not executing

```bash
# Check worker status
docker logs aoptool_celery_worker --tail 20

# Should see: "celery@... ready"

# Restart if needed
docker-compose restart celery_worker celery_beat
```

---

## 📊 Monitoring

### Database Queries

```bash
# View recent executions
docker exec aoptool_postgres psql -U aoptool_user -d aoptool -c \
  "SELECT execution_id, attack_id, status, started_at FROM attack_executions ORDER BY started_at DESC LIMIT 5;"

# View all targets
docker exec aoptool_postgres psql -U aoptool_user -d aoptool -c \
  "SELECT target_id, name, url_or_ip, scope FROM targets;"

# View whitelist
docker exec aoptool_postgres psql -U aoptool_user -d aoptool -c \
  "SELECT * FROM scope_whitelist;"
```

### MinIO Console

1. Open browser: http://localhost:9001
2. Login with credentials from `.env`
3. Browse `aoptool-evidence` bucket
4. Download evidence files

---

## 🎓 Advanced Features

### Use AI (Claude/GPT-4)

1. Get API key from https://console.anthropic.com/
2. Edit `.env` file:
   ```
   CLAUDE_API_KEY=sk-ant-your-key-here
   ```
3. Restart Intelligence Plane:
   ```bash
   docker-compose restart intelligence_plane
   ```

Now your attack plans will use actual AI reasoning!

### Custom Attack Sequences

Instead of using AI, create manual sequences:

```bash
curl -X POST http://localhost:8000/attack_plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_id": 1,
    "attack_sequence": [1, 3, 6, 10],
    "scheduling": "manual_trigger",
    "max_risk_level": "medium"
  }'
```

### Scheduled Scans

```python
from celery import Celery

app = Celery(broker='redis://localhost:6379/0')

# Schedule weekly scan
app.send_task(
    'aoptool.schedule_periodic_scan',
    args=[1, [1, 3, 6], 168]  # target_id, attacks, hours
)
```

---

## 📱 API Documentation

**Full interactive API docs:**
- Control Plane: http://localhost:8000/docs
- Try all endpoints directly in browser
- See request/response schemas
- Test authentication

---

## ✅ Quick Verification

Run this to verify everything works:

```bash
#!/bin/bash

echo "=== AOPTool Quick Health Check ==="

echo -n "1. Control Plane: "
curl -s http://localhost:8000/health | jq -r .status

echo -n "2. Intelligence Plane: "
curl -s http://localhost:5000/health | jq -r .status

echo -n "3. Available Attacks: "
curl -s http://localhost:5000/attacks | jq -r .count

echo -n "4. Containers Running: "
docker-compose ps | grep -c "Up"

echo "=== All systems operational! ==="
```

Expected output:
```
=== AOPTool Quick Health Check ===
1. Control Plane: healthy
2. Intelligence Plane: healthy
3. Available Attacks: 30
4. Containers Running: 9
=== All systems operational! ===
```

---

## 🎉 You're Ready!

**Next Steps:**
1. ✅ Create your first target
2. ✅ Generate an AI-powered attack plan
3. ✅ Execute and monitor
4. ✅ Review evidence

**Need Help?**
- Check `FINAL_STATUS.md` for detailed system info
- Check `IMPLEMENTATION_COMPLETE.md` for technical details
- Check logs: `docker-compose logs -f`

**Happy Pentesting! 🎯**

---

**Important:** Always ensure you have proper authorization before testing any target. Use the scope whitelist to enforce authorized targets only.
