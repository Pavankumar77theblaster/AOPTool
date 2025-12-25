# AOPTool - Complete Usage Guide

**Learn how to use AOPTool for professional penetration testing**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Web Dashboard Guide](#web-dashboard-guide)
3. [Creating Your First Target](#creating-your-first-target)
4. [AI-Powered Attack Planning](#ai-powered-attack-planning)
5. [Monitoring Executions](#monitoring-executions)
6. [Generating Reports](#generating-reports)
7. [API Usage](#api-usage)
8. [Best Practices](#best-practices)
9. [Advanced Features](#advanced-features)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

Ensure AOPTool is installed and running:
- See [KALI_INSTALL.md](KALI_INSTALL.md) for installation
- All services should be running: `docker-compose ps`
- Web dashboard accessible: `http://localhost:3000`

### First Login

1. Open browser: `http://localhost:3000`
2. Login with credentials from `.env`:
   - **Username**: `admin`
   - **Password**: (your `ADMIN_PASSWORD`)

---

## Web Dashboard Guide

### Dashboard Overview

The dashboard (`http://localhost:3000`) provides:

- **Real-time Statistics**: Targets, plans, executions, findings
- **Health Monitoring**: Control & Intelligence Plane status
- **Quick Actions**: Create target, plan attack, view reports
- **Recent Activity**: Latest executions with status

### Navigation

**Sidebar Menu:**
- 🏠 **Dashboard** - Overview and statistics
- 🎯 **Targets** - Manage test targets
- ⚔️ **Attacks** - Browse attack library (30 attacks)
- 📋 **Plans** - Create and manage attack plans
- 🚀 **Executions** - Monitor running attacks
- 📄 **Evidence** - Browse collected evidence
- ⚙️ **Settings** - Whitelist management

---

## Creating Your First Target

### Step 1: Add to Whitelist (REQUIRED)

**Why**: Scope validation prevents unauthorized attacks

**Navigate to**: Settings → Whitelist (`/settings/whitelist`)

**Click**: "Add Entry"

**Fill form:**
```
Entry Type: Domain
Value: example.com
Description: Test website - authorized by owner
```

**Click**: "Add to Whitelist"

**Verification**: Entry appears in whitelist table

### Step 2: Create Target

**Navigate to**: Targets → New Target (`/targets/new`)

**Fill form:**
```
Name: Example Test Website
URL/IP: https://example.com
Description: E-commerce website penetration test
Scope: In Scope
Risk Tolerance: Medium
Owner Approval: ✓ Checked (REQUIRED)
```

**Click**: "Create Target"

**Result**: Target created, redirected to target details

### Step 3: View Target Details

**Navigate to**: Targets (`/targets`)

**Click**: Target name

**View:**
- Target information
- Scope status
- Quick actions (Edit, Delete, Create Plan)

---

## AI-Powered Attack Planning

### Method 1: Natural Language (AI-Powered)

**Navigate to**: Plans → New Plan (`/plans/new`)

**Select**: Target from dropdown

**Enter AI Description**:
```
Example 1: "Scan this website for SQL injection and XSS vulnerabilities"
Example 2: "Perform full reconnaissance and vulnerability scanning"
Example 3: "Test for authentication bypass and session hijacking"
```

**Click**: "Generate Plan with AI"

**AI Processing:**
1. Analyzes your description
2. Selects appropriate attacks from library
3. Optimizes attack sequence
4. Estimates duration and risk

**Review AI Output:**
```
✓ AI Reasoning
  "Target appears to be a web application. Selected attacks:
   1. Nmap port scan (reconnaissance)
   2. Technology detection (recon)
   3. SQLMap (SQL injection testing)
   4. XSStrike (XSS detection)
   Estimated duration: 15-20 minutes
   Risk level: Medium"

✓ Attack Sequence
  [1] Nmap Port Scan
  [2] WhatWeb Technology Detection
  [3] SQL Injection Test (SQLMap)
  [4] Cross-Site Scripting (XSStrike)
```

**Click**: "Create Plan"

**Result**: Plan created and ready for execution

### Method 2: Manual Selection

**Navigate to**: Attacks (`/attacks`)

**Browse**: Attack library (filter by category/risk)

**Select**: Desired attacks (note their IDs)

**Create Plan**:
```
Plan Name: Custom Web App Test
Target: Example Website
Attack Sequence: [1, 5, 10, 15]  # Attack IDs
Risk Level: Medium
```

---

## Monitoring Executions

### Start Execution

**From Plan Details**:
1. Navigate to: Plans (`/plans`)
2. Click: Plan name
3. Click: "Start Execution"
4. Confirm: "Yes, Start"

**Result**: Redirected to execution monitor

### Real-Time Monitoring

**Navigate to**: Executions → Monitor (`/executions/monitor`)

**View:**
- **Active Executions**: Currently running (auto-refresh every 3s)
- **Progress Bars**: Visual execution progress
- **Status Badges**: Queued, Running, Completed, Failed
- **Logs**: Real-time attack output

**Features:**
- Auto-scroll logs
- Pause on hover
- Filter by status
- Quick actions (Cancel, View Details)

### Execution Details

**Click**: Execution name

**View Tabs:**

**1. Overview**
```
Status: Running / Completed / Failed
Started: 2025-01-26 10:30:45
Duration: 5m 32s
Attacks: 4 total (3 completed, 1 running)
```

**2. Attack Sequence**
```
[✓] Nmap Port Scan - Completed (45s)
[✓] Technology Detection - Completed (12s)
[⏳] SQL Injection Test - Running (2m 15s)
[ ] XSS Detection - Queued
```

**3. Logs**
```
[10:30:45] Starting execution #123
[10:30:46] Attack #1: Nmap Port Scan
[10:31:32] Nmap completed: 22 ports open
[10:31:33] Attack #2: WhatWeb
...
```

**4. Evidence**
- Screenshots
- Output files
- Vulnerability proofs

---

## Generating Reports

### From Web Dashboard

**Navigate to**: Executions → Details (`/executions/{id}`)

**Click**: "Generate Report"

**Select Formats:**
- ✓ PDF (Professional report)
- ✓ HTML (Web-viewable)
- ✓ JSON (API integration)
- ✓ CSV (Spreadsheet analysis)

**Click**: "Generate"

**Wait**: Processing (10-30 seconds)

**Download**:
- Click download links
- Or view HTML in browser

### Report Contents

**Executive Summary PDF:**
```
✓ Overview
✓ Key Statistics
✓ Risk Assessment (Critical/High/Medium/Low)
✓ Top Findings Summary
✓ Immediate Actions Required
✓ Charts (Severity, Category, Timeline)
```

**Technical Report PDF:**
```
✓ Test Overview & Statistics
✓ Detailed Findings
  - CVSS v3.1 Scores
  - Vulnerability Descriptions
  - Remediation Guidance
  - Evidence Files
✓ Attack Execution Timeline
✓ Complete Attack List
✓ Evidence Summary
```

### Using API

```bash
# Generate report via API
curl -X POST http://localhost:6000/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "execution_id": 123,
    "formats": ["pdf", "html", "json", "csv"]
  }'

# Download PDF
curl -o report.pdf \
  http://localhost:6000/reports/123/download/pdf

# Download HTML
curl -o report.html \
  http://localhost:6000/reports/123/download/html
```

---

## API Usage

### Authentication

**Get JWT Token:**
```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2025!Secure"}' \
  | jq -r '.access_token'

# Save token
export TOKEN="eyJ..."
```

**Use Token:**
```bash
# All requests need Authorization header
curl -X GET http://localhost:8000/targets \
  -H "Authorization: Bearer $TOKEN"
```

### Target Management

**List Targets:**
```bash
curl -X GET http://localhost:8000/targets \
  -H "Authorization: Bearer $TOKEN"
```

**Create Target:**
```bash
curl -X POST http://localhost:8000/targets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Site",
    "url_or_ip": "https://testsite.com",
    "scope": "in_scope",
    "risk_tolerance": "medium",
    "owner_approval": true
  }'
```

**Update Target:**
```bash
curl -X PUT http://localhost:8000/targets/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

**Delete Target:**
```bash
curl -X DELETE http://localhost:8000/targets/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Attack Plans

**List Attacks:**
```bash
curl -X GET http://localhost:5000/attacks \
  -H "Authorization: Bearer $TOKEN"
```

**AI Translation:**
```bash
curl -X POST http://localhost:5000/translate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Scan for SQL injection vulnerabilities",
    "target_id": 1,
    "risk_level": "medium"
  }'
```

**Create Plan:**
```bash
curl -X POST http://localhost:8000/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_id": 1,
    "name": "Web App Test",
    "attack_ids": [1, 5, 10],
    "risk_level": "medium"
  }'
```

### Executions

**Start Execution:**
```bash
curl -X POST http://localhost:8000/plans/1/execute \
  -H "Authorization: Bearer $TOKEN"
```

**Get Execution Status:**
```bash
curl -X GET http://localhost:8000/executions/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Cancel Execution:**
```bash
curl -X POST http://localhost:8000/executions/1/cancel \
  -H "Authorization: Bearer $TOKEN"
```

### Evidence

**List Evidence:**
```bash
curl -X GET http://localhost:8000/evidence?execution_id=1 \
  -H "Authorization: Bearer $TOKEN"
```

**Download Evidence:**
```bash
curl -X GET http://localhost:8000/evidence/1/download \
  -H "Authorization: Bearer $TOKEN" \
  -o evidence_file.png
```

---

## Best Practices

### Security

1. **Always Get Permission**
   - Written authorization before testing
   - Scope agreement documented
   - Emergency contacts defined

2. **Use Scope Validation**
   - Whitelist ALL authorized targets
   - Double-check scope before execution
   - Use "Out of Scope" marking for exceptions

3. **Monitor Executions**
   - Watch for unexpected behavior
   - Stop attacks if issues arise
   - Review logs regularly

4. **Secure Your Instance**
   - Change default passwords
   - Use strong JWT secrets
   - Keep API keys private
   - Update regularly

### Performance

1. **Resource Management**
   - Don't run too many concurrent executions
   - Reduce worker concurrency if low RAM
   - Use rate limiting for aggressive attacks

2. **Database Maintenance**
   - Regular backups (see KALI_INSTALL.md)
   - Clean old evidence files
   - Optimize database periodically

3. **Network Considerations**
   - Test from appropriate network location
   - Consider rate limiting
   - Avoid DoS-like behavior

### Reporting

1. **Generate Reports Promptly**
   - Create reports immediately after execution
   - Review findings while fresh
   - Archive important tests

2. **Evidence Management**
   - Organize evidence by execution
   - Add descriptions to findings
   - Maintain chain of custody

3. **Client Communication**
   - Use Executive Summary for management
   - Technical Report for dev teams
   - CSV for tracking/metrics

---

## Advanced Features

### Whitelist Patterns

**Domain Wildcards:**
```
*.example.com  → Matches all subdomains
example.*      → Matches all TLDs
```

**IP Ranges (CIDR):**
```
192.168.1.0/24   → 192.168.1.1 - 192.168.1.254
10.0.0.0/8       → All 10.x.x.x addresses
```

### Custom Attack Sequences

**Based on Target Type:**
```
Web App: Recon → Vuln Scan → Web Attacks → Exploitation
Network: Port Scan → Service Detection → Network Attacks
API: Tech Detection → Endpoint Discovery → API Attacks
```

### Automation

**Schedule Regular Scans:**
```bash
# Cron job for daily scan
0 2 * * * curl -X POST http://localhost:8000/plans/1/execute \
  -H "Authorization: Bearer $TOKEN"
```

**CI/CD Integration:**
```yaml
# GitHub Actions example
name: Security Scan
on: [push]
jobs:
  pentest:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger AOPTool Scan
        run: |
          curl -X POST ${{ secrets.AOPTOOL_URL }}/plans/${{ secrets.PLAN_ID }}/execute \
            -H "Authorization: Bearer ${{ secrets.AOPTOOL_TOKEN }}"
```

---

## Troubleshooting

### Common Issues

**"Target not in whitelist"**
```
Solution: Add target to whitelist first in Settings
```

**"Execution stuck at 'Running'"**
```
Check: docker-compose logs celery_worker
Solution: Restart celery_worker if needed
```

**"AI not responding"**
```
Verify: CLAUDE_API_KEY in .env
Test: curl https://api.anthropic.com/v1/messages with your key
```

**"Out of memory"**
```
Check: docker stats
Solution: Reduce CELERY_WORKER_CONCURRENCY in .env
```

**"Report generation failed"**
```
Check: docker-compose logs reporting_plane
Solution: Ensure execution is completed first
```

### Getting Help

1. Check logs: `docker-compose logs -f`
2. Review [KALI_INSTALL.md](KALI_INSTALL.md) troubleshooting
3. GitHub Issues: [Create Issue](https://github.com/Pavankumar77theblaster/AOPTool/issues)
4. API Docs: http://localhost:8000/docs

---

## Example Workflows

### Workflow 1: Quick Web App Test

```
1. Add domain to whitelist
2. Create target (website URL)
3. AI Plan: "Scan for common web vulnerabilities"
4. Execute plan
5. Monitor in real-time
6. Generate PDF report
7. Review findings
```

### Workflow 2: Comprehensive Network Scan

```
1. Add IP range to whitelist (CIDR)
2. Create target (network range)
3. Manual Plan:
   - Nmap Full Port Scan
   - Service Detection
   - Vulnerability Scan
   - Exploit Search
4. Execute with high concurrency
5. Generate technical report
6. Export CSV for tracking
```

### Workflow 3: API Security Test

```
1. Add API domain to whitelist
2. Create target (API base URL)
3. AI Plan: "Test API for authentication bypass and injection"
4. Execute plan
5. Review evidence (request/response logs)
6. Generate JSON export for CI/CD
```

---

**Happy Testing! Remember: ONLY test authorized systems** 🔐

[⬆ Back to Top](#aoptool---complete-usage-guide)
