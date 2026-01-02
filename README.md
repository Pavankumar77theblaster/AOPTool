# AOPTool - AI-Powered Autonomous Penetration Testing Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](https://github.com/Pavankumar77theblaster/AOPTool)
[![Python: 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Completion: 100%](https://img.shields.io/badge/Completion-100%25-success.svg)](LIVE_PROGRESS.md)

> **⚠️ LEGAL WARNING:** This tool is designed for **authorized security testing ONLY**. Unauthorized use against systems you don't own or have explicit permission to test is **illegal and unethical**. You are solely responsible for your actions.

---

## 🎯 What is AOPTool?

AOPTool is a **production-ready, AI-orchestrated penetration testing platform** that combines artificial intelligence with 30+ industry-standard security tools to perform comprehensive Vulnerability Assessment and Penetration Testing (VAPT).

**NEW:** Features an **Intelligent Workflow System** with automatic tool chaining - discovers open ports, detects services, and automatically triggers appropriate vulnerability tests based on findings. Port 3306 MySQL found? System automatically runs SQLMap. Port 80 HTTP found? Automatically executes Nuclei, FFuf, 403 bypass testing, and OWASP scans. **Zero manual intervention required.**

### Why AOPTool?

| Feature | Traditional Tools | AOPTool |
|---------|------------------|---------|
| **Planning** | Manual attack chains | 🤖 AI-driven attack sequencing |
| **Intelligence** | Static workflows | 🧠 Learns and adapts from outcomes |
| **Execution** | Scattered tools | ⚡ Orchestrated 30+ tools |
| **Workflow** | Manual tool selection | 🔗 Automatic tool chaining based on findings |
| **Evidence** | Manual collection | 📦 Automated immutable storage |
| **Reporting** | Template-based | 📊 Professional PDF with CVSS scoring |
| **Interface** | CLI only | 🎨 Modern web dashboard + Real-time workflow |

---

## ✨ Key Features

### 🚀 **Fully Autonomous**
- **AI-Powered Planning**: Describe attacks in natural language → AI translates to executable sequences
- **30 Pre-configured Attacks**: Reconnaissance, scanning, web app, network, and exploitation
- **Real-Time Monitoring**: Live execution tracking with auto-refresh
- **Smart Sequencing**: AI optimizes attack order based on target characteristics

### 🎨 **Modern Web Interface**
- Beautiful dark-themed dashboard optimized for security operations
- Real-time execution monitoring with 3-5 second updates
- Target management with scope validation
- Evidence browser with file preview
- Mobile-responsive design

### 📊 **Professional Reporting**
- **PDF Reports**: Executive summaries and technical details
- **CVSS v3.1 Scoring**: Automatic vulnerability severity calculation
- **Multiple Formats**: PDF, HTML, JSON, CSV
- **Charts & Graphs**: Severity distribution, attack timelines, success rates
- **Evidence Integration**: Automatic attachment of screenshots and logs

### 🔒 **Security First**
- **Scope Validation**: Hard-stop enforcement (no attacks outside whitelist)
- **Approval Workflows**: High-risk attacks require manual approval
- **Immutable Evidence**: SHA-256 hashes, write-once storage
- **Container Isolation**: Each tool runs in isolated Docker container
- **Audit Trail**: Complete log of all actions

### 🧠 **AI Integration**
- **Claude/GPT Support**: Primary AI for exploit translation and reasoning
- **Natural Language**: "Scan for SQL injection vulnerabilities" → Full attack plan
- **Context Aware**: Detects tech stack, WAF, authentication mechanisms
- **Continuous Learning**: Improves from execution outcomes (optional ML)

### 🔗 **Intelligent Workflow System** (NEW!)
- **Automatic Tool Chaining**: Port scanning triggers appropriate vulnerability tests
- **Service-Based Automation**: MySQL → SQLMap, Web → Nuclei/FFuf/403 bypass
- **Real-Time WebSocket Updates**: Live progress tracking with instant findings
- **Finding-Driven Workflow**: Each discovery triggers next logical test
- **Zero Manual Steps**: Continuous vulnerability discovery from scan to exploitation
- **Tested & Working**: Scans complete in ~3 seconds, successfully tested on scanme.nmap.org

**Example Workflow:**
```
Port 80 HTTP found → WAF Detection → Nuclei Scan → Directory Fuzzing
                  → If 403: Bypass Testing → OWASP Advanced Tests
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           CONTROL PLANE (Port 8000)             │
│   REST API + Orchestration + Scope Validation  │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│        INTELLIGENCE PLANE (Port 5000)           │
│   AI Translator + 30 Attack Definitions         │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│         EXECUTION PLANE (Celery)                │
│   Nmap, SQLMap, Metasploit, ZAP, Nuclei, etc. │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│    INTELLIGENT WORKFLOW (Port 5000) [NEW!]     │
│   Auto Tool Chaining + Real-Time WebSocket     │
│   Port Scan → Service Detection → Auto Testing │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│        REPORTING PLANE (Port 6000)              │
│   PDF/HTML/JSON/CSV + CVSS Scoring + Charts    │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│         WEB DASHBOARD (Port 3000)               │
│   React + Next.js + Real-Time Monitoring       │
└─────────────────────────────────────────────────┘
```

**Infrastructure:** PostgreSQL, MongoDB, Redis, MinIO, 12 Docker containers + Intelligent Workflow Engine

📖 **Detailed Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 📦 What's Included

### 🛠️ **30 Pre-configured Attack Techniques**

#### Reconnaissance (6 attacks)
- Nmap Port Scanning
- Subdomain Enumeration (Subfinder)
- Technology Detection (WhatWeb)
- Whois Domain Information
- DNS Enumeration
- Certificate Transparency

#### Vulnerability Scanning (6 attacks)
- Nuclei Template Scanning
- Nikto Web Server Scan
- SSL/TLS Analysis (SSLyze)
- Security Headers Check
- CVE Database Search
- Open Port Vulnerability Analysis

#### Web Application (6 attacks)
- SQL Injection (SQLMap)
- Cross-Site Scripting (XSStrike)
- Directory Brute Force (Gobuster)
- Fuzzing (FFUF)
- JWT Token Analysis
- CORS Misconfiguration

#### Network (6 attacks)
- Mass Port Scanning (Masscan)
- Network Connectivity (Netcat)
- Packet Capture (TCPDump)
- Route Tracing
- Ping Sweep
- ARP Scanning

#### Exploitation (6 attacks)
- Metasploit Framework
- Exploit-DB Search
- Password Attacks
- Brute Force Attacks
- Custom Exploit Execution
- Post-Exploitation

### 📊 **Report Formats**
- **Executive Summary PDF**: For stakeholders/management
- **Technical Report PDF**: Full vulnerability details with CVSS
- **HTML Reports**: Web-viewable with embedded charts
- **JSON Export**: API integration and automation
- **CSV Export**: Spreadsheet analysis

### 🎨 **Web Dashboard Pages**
- **Dashboard**: Real-time statistics and quick actions
- **Targets**: Create, edit, manage test targets
- **Attack Library**: Browse 30 attacks with filtering
- **Attack Planning**: AI-powered natural language planner
- **Executions**: Real-time monitoring with live logs
- **Evidence**: Browse and download collected files
- **Reports**: Generate and download PDF/HTML reports
- **Settings**: Whitelist management
- **Intelligent Workflow** (NEW!): Real-time automatic tool chaining dashboard

### 🔗 **Intelligent Workflow Components** (NEW!)
- **Port Scanner**: Async scanning with service detection and banner grabbing
- **Workflow Orchestrator**: Automatic tool chaining based on findings
- **WAF Detector**: Web Application Firewall detection (bug fixes applied)
- **403 Bypass Module**: Advanced bypass techniques with v3.0 validation
- **Kali Tools Integration**: Nuclei, FFuf, SQLMap, WPScan, and more
- **OWASP Advanced Scanner**: JWT, IDOR, CSRF, Mass Assignment tests
- **Real-Time Dashboard**: WebSocket-powered live progress tracking

**Intelligent Workflow Location**: `intelligent_workflow/`

**Quick Start Intelligent Workflow:**
```bash
cd intelligent_workflow/
pip3 install -r requirements.txt --break-system-packages
python3 app_v3.py
# Access: http://localhost:5000
```

---

## 🚀 Quick Start

### Prerequisites

**System Requirements:**
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 20GB free space
- **CPU**: 2+ cores recommended
- **OS**: Linux (Kali Linux recommended), Windows 11, macOS 12+

**Software Requirements:**
- Docker 24.0+ and Docker Compose 2.0+
- Git 2.30+
- (Optional) GPU for local ML models

### Installation

**⚡ Want just the commands?** See **[QUICK_COMMANDS.md](QUICK_COMMANDS.md)** for copy-paste ready commands!

See detailed installation guides:
- **[Kali Linux Installation Guide](KALI_INSTALL.md)** ⭐ Recommended for pentesters
- **[Windows Installation Guide](WINDOWS_INSTALL.md)**
- **[macOS Installation Guide](MACOS_INSTALL.md)**

#### Quick Install (Linux/Kali)

```bash
# 1. Clone repository
git clone https://github.com/Pavankumar77theblaster/AOPTool.git
cd AOPTool

# 2. Copy environment template
cp .env.example .env

# 3. Edit environment variables (REQUIRED)
nano .env
# Set your API keys:
# - CLAUDE_API_KEY or OPENAI_API_KEY (for AI features)
# - Change default passwords for security

# 4. Start all services
docker-compose up -d

# 5. Verify services are running
docker-compose ps
# All services should show "Up (healthy)"

# 6. Access web dashboard
# Open http://localhost:3000 in your browser
```

**First Login:**
- Username: `admin`
- Password: `Admin@2025!Secure` (change this in `.env` before starting)

---

## 📖 Usage Guide

See **[USAGE_GUIDE.md](USAGE_GUIDE.md)** for comprehensive documentation.

### Basic Workflow

```
1. Add Target → 2. Create Attack Plan → 3. Execute → 4. Monitor → 5. Generate Report
```

### Quick Example

**1. Add Target to Scope (Web Dashboard)**
```
Navigate to: http://localhost:3000/targets/new
- Name: "Test Website"
- URL: "https://example.com"
- Scope: "In Scope"
- Risk Tolerance: "Medium"
- Owner Approval: ✓ Checked
```

**2. Create AI-Powered Attack Plan**
```
Navigate to: http://localhost:3000/plans/new
- Select Target: "Test Website"
- AI Description: "Scan this website for SQL injection and XSS vulnerabilities"
- Click "Generate Plan"
- AI translates to attack sequence
- Click "Create Plan"
```

**3. Monitor Execution**
```
Navigate to: http://localhost:3000/executions/monitor
- View real-time progress
- See live logs
- Track attack status
```

**4. Generate Report**
```
Navigate to: http://localhost:3000/executions/{id}
- Click "Generate Report"
- Select formats: PDF, HTML, JSON, CSV
- Download professional pentest report
```

### API Examples

**Using cURL:**

```bash
# 1. Login and get JWT token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2025!Secure"}' \
  | jq -r '.access_token'

# 2. Create target
curl -X POST http://localhost:8000/targets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Target",
    "url_or_ip": "https://testsite.com",
    "scope": "in_scope",
    "risk_tolerance": "medium",
    "owner_approval": true
  }'

# 3. Generate report
curl -X POST http://localhost:6000/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "execution_id": 1,
    "formats": ["pdf", "html", "json"]
  }'
```

---

## 🛠️ Tech Stack

### **Backend**
- **FastAPI**: High-performance REST API
- **Python 3.11**: Core application logic
- **Celery**: Distributed task queue for attack execution
- **PostgreSQL**: Structured data (targets, plans, executions)
- **MongoDB**: Attack history and learning data
- **Redis**: Task queue broker and caching
- **MinIO**: S3-compatible object storage for evidence

### **Frontend**
- **Next.js 14**: React framework with SSR
- **TypeScript**: Type-safe development
- **Tailwind CSS 3**: Utility-first styling
- **SWR**: Data fetching with real-time updates
- **React Hook Form + Zod**: Form validation

### **AI/ML**
- **Claude 4.5 Sonnet**: Primary AI for attack planning
- **OpenAI GPT-4**: Backup AI support
- **Matplotlib**: Chart generation for reports

### **Security Tools**
- Nmap, Metasploit, SQLMap, OWASP ZAP, Nuclei, Gobuster, Subfinder, WhatWeb, Nikto, SSLyze, XSStrike, FFUF, Masscan, and more

### **Infrastructure**
- **Docker & Docker Compose**: Container orchestration
- **12 Microservices**: Scalable architecture
- **WeasyPrint**: Professional PDF generation

---

## 📊 Project Status

**Current Status:** ✅ **100% COMPLETE - PRODUCTION READY**

| Component | Status | Progress |
|-----------|--------|----------|
| Infrastructure | ✅ Complete | 100% |
| Control Plane API | ✅ Complete | 100% |
| Intelligence Plane (AI) | ✅ Complete | 100% |
| Execution Plane | ✅ Complete | 100% |
| Web Dashboard | ✅ Complete | 100% |
| Reporting System | ✅ Complete | 100% |
| Documentation | ✅ Complete | 100% |

**Total:** 150+ files, 18,000+ lines of code

📈 **Detailed Progress**: [LIVE_PROGRESS.md](LIVE_PROGRESS.md)

---

## 📚 Documentation

### Essential Reading
- **[QUICK_COMMANDS.md](QUICK_COMMANDS.md)** ⭐ - Copy-paste commands for Windows & Kali
- **[KALI_INSTALL.md](KALI_INSTALL.md)** - Kali Linux installation (recommended)
- **[WEB_DASHBOARD_GUIDE.md](WEB_DASHBOARD_GUIDE.md)** - Complete web dashboard user guide
- **[USAGE_GUIDE.md](USAGE_GUIDE.md)** - API and CLI usage guide with examples
- **[LIVE_PROGRESS.md](LIVE_PROGRESS.md)** - Real-time project status

### Intelligent Workflow Documentation (NEW!)
- **[intelligent_workflow/README.md](intelligent_workflow/README.md)** - Component overview
- **[intelligent_workflow/INTELLIGENT_WORKFLOW_GUIDE.md](intelligent_workflow/INTELLIGENT_WORKFLOW_GUIDE.md)** - Complete workflow guide
- **[intelligent_workflow/QUICKSTART.md](intelligent_workflow/QUICKSTART.md)** - Quick start guide

### Technical Documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[DECISIONS.md](DECISIONS.md)** - Architectural decisions
- **[QUICK_START.md](QUICK_START.md)** - Fast setup guide

### API Documentation
- **Control Plane**: http://localhost:8000/docs (Swagger UI)
- **Intelligence Plane**: http://localhost:5000/docs
- **Reporting Plane**: http://localhost:6000/docs

---

## 🔒 Security & Legal

### ⚠️ Legal Disclaimer

**YOU ARE RESPONSIBLE FOR YOUR ACTIONS.**

**Authorized Use:**
- ✅ Penetration testing on systems you own
- ✅ Security research in controlled environments
- ✅ Bug bounty programs with explicit permission
- ✅ Educational purposes (with proper authorization)

**Illegal Use:**
- ❌ Unauthorized access to any system
- ❌ Malicious hacking or data theft
- ❌ Any activity without explicit written permission

**Penalties:** Criminal prosecution, civil liability, imprisonment up to 20 years (depending on jurisdiction)

### Security Features

- **Scope Validation**: Whitelist enforcement prevents unauthorized attacks
- **Approval Workflows**: High-risk attacks require manual approval
- **Audit Trail**: Immutable log of all actions with timestamps
- **Container Isolation**: Tools run in isolated Docker environments
- **Secrets Management**: All credentials stored in environment variables
- **Evidence Chain of Custody**: SHA-256 hashes for integrity

---

## 🐛 Troubleshooting

### Common Issues

**Docker containers won't start:**
```bash
# Check Docker is running
docker info

# View container logs
docker-compose logs -f control_plane

# Restart services
docker-compose down && docker-compose up -d
```

**Can't access web dashboard:**
```bash
# Verify web_dashboard is running
docker-compose ps web_dashboard

# Check logs
docker-compose logs -f web_dashboard

# Try accessing: http://localhost:3000
```

**AI not responding:**
```bash
# Verify API key is set
docker-compose exec intelligence_plane env | grep CLAUDE_API_KEY

# Check intelligence plane logs
docker-compose logs -f intelligence_plane
```

**Out of memory:**
```bash
# Check resource usage
docker stats

# Reduce Celery worker concurrency in docker-compose.yml:
# command: celery -A tasks worker --concurrency=2  # Reduce from 4
```

**Database connection errors:**
```bash
# Check PostgreSQL
docker-compose exec postgres psql -U aoptool_user -d aoptool -c "SELECT 1;"

# Check MongoDB
docker-compose exec mongodb mongosh -u aoptool_user
```

📖 **Full Troubleshooting Guide**: [USAGE_GUIDE.md#troubleshooting](USAGE_GUIDE.md#troubleshooting)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow existing code style and patterns
4. Write tests for new features
5. Update documentation
6. Commit with descriptive messages
7. Push and create a Pull Request

**Before contributing**, please read:
- [DECISIONS.md](DECISIONS.md) - Understand architectural choices
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design

---

## 📜 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

**Copyright © 2025 AOPTool Project**

---

## 🙏 Acknowledgments

- **OWASP** - Vulnerable applications for testing
- **Anthropic** - Claude AI API
- **Project Discovery** - Nuclei vulnerability scanner
- **Metasploit Project** - Exploitation framework
- **All open-source security tool maintainers**

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Pavankumar77theblaster/AOPTool/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Pavankumar77theblaster/AOPTool/discussions)
- **Security Vulnerabilities**: Please report privately via GitHub Security Advisories

---

## 🗺️ Roadmap

### ✅ Completed
- Core infrastructure and architecture
- AI-powered attack planning
- 30 pre-configured attack techniques
- Web dashboard with real-time monitoring
- Professional PDF reporting with CVSS scoring
- Complete API documentation
- **Intelligent Workflow System** (NEW!) - Automatic tool chaining based on findings

### 🚀 Future Enhancements (Optional)
- Extended attack library (60+ additional attacks)
- Machine learning for attack success prediction
- Email/Slack notifications
- Cloud deployment templates (AWS, GCP, Azure)
- Multi-user support with RBAC
- Custom attack script builder

---

## 📈 Statistics

- **Total Files**: 162+ (includes intelligent workflow)
- **Lines of Code**: 23,381+ (includes 5,381 lines from intelligent workflow)
- **Docker Containers**: 12
- **API Endpoints**: 50+
- **Attack Techniques**: 30+
- **Intelligent Workflow Modules**: 6 core modules
- **Documentation Files**: 18
- **Development Time**: 120+ hours
- **Completion**: 100%

### Intelligent Workflow Stats (NEW!)
- **Files Added**: 12
- **Lines of Code**: 5,381
- **Modules**: 6 (port scanner, workflow orchestrator, WAF detector, 403 bypass, Kali integration, OWASP scanner)
- **Scan Speed**: ~3 seconds for top 100 ports
- **Test Coverage**: Tested on scanme.nmap.org
- **Automatic Triggers**: Service-based tool chaining (MySQL→SQLMap, Web→Nuclei/FFuf)

---

<div align="center">

**Built with 🧠 AI + 🔧 Security + ⚡ Automation**

[⬆ Back to Top](#aoptool---ai-powered-autonomous-penetration-testing-platform)

</div>
