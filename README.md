# AOPTool - AI-Orchestrated Autonomous Pentesting Tool

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-orange)](https://github.com/yourusername/aoptool)
[![Python: 3.11+](https://img.shields.io/badge/Python-3.11+-blue)](https://www.python.org/)

> **WARNING:** This tool is designed for authorized security testing only. Unauthorized use against systems you don't own or have explicit permission to test is illegal and unethical.

---

## 🎯 Overview

AOPTool is an **intelligent, autonomous penetration testing platform** that combines AI reasoning with industry-standard security tools to perform end-to-end Vulnerability Assessment and Penetration Testing (VAPT).

### What Makes AOPTool Different?

| Feature | Traditional Tools | AOPTool |
|---------|------------------|---------|
| **Planning** | Manual attack chains | AI-driven attack sequencing |
| **Adaptation** | Static workflows | Learns from outcomes, adapts strategy |
| **Context Awareness** | Limited | Detects tech stack, WAF, auth mechanisms |
| **Knowledge Growth** | Manual script updates | AI translates new exploit descriptions |
| **Evidence** | Scattered logs | Centralized, immutable evidence store |
| **Reporting** | Template-based | Context-aware, risk-scored reports |

### Key Features

- ✅ **Autonomous Attack Chaining**: Recon → Scanning → Exploitation → Post-Exploitation
- ✅ **AI-Powered Reasoning**: Claude/GPT-based attack planning and adaptation
- ✅ **Context-Aware**: Detects target tech stack, security measures, and adapts
- ✅ **Continuous Learning**: Improves success rates by learning from outcomes
- ✅ **Training Model**: Drop exploit descriptions (text/images) into folder, AI implements them
- ✅ **Scope Validation**: Hard-stop enforcement prevents unauthorized attacks
- ✅ **Evidence Collection**: Immutable evidence store with chain of custody
- ✅ **Risk-Based Approvals**: High-risk attacks require human approval
- ✅ **Comprehensive Reporting**: PDF/HTML reports with CVSS scoring

---

## 🏗️ Architecture

AOPTool follows a **5-Plane Architecture**:

```
┌─────────────────────────────────────────────┐
│        CONTROL PLANE                         │
│   Web Dashboard + Orchestrator              │
│   (User interaction, scope validation)      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│       INTELLIGENCE PLANE                     │
│   AI Translator + Reasoning Engine          │
│   (Convert exploits → executable logic)     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│        EXECUTION PLANE                       │
│   Nmap, SQLMap, Metasploit, ZAP, Nuclei   │
│   (Orchestrated attack execution)           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│    EVIDENCE & VALIDATION PLANE               │
│   Evidence Store + Validator + Reporter     │
│   (Results validation and reporting)        │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│     LEARNING & EVOLUTION PLANE               │
│   Attack Memory + Feedback Loop + ML        │
│   (Continuous improvement)                  │
└─────────────────────────────────────────────┘
```

**📖 Detailed Documentation:** See [ARCHITECTURE.md](ARCHITECTURE.md) for complete technical details.

---

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- **16GB RAM** minimum (32GB recommended)
- **GPU** optional (NVIDIA RTX 3050+ for local ML models)
- **Storage:** 20GB free space
- **OS:** Windows 11, macOS 12+, or Linux (Ubuntu 22.04+)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/aoptool.git
cd aoptool

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env and add your API keys
# Required: CLAUDE_API_KEY or OPENAI_API_KEY
# Generate secure passwords for databases
nano .env

# 4. Start all services
docker-compose up -d

# 5. Verify all containers are running
docker-compose ps

# 6. Access web dashboard
# Open http://localhost:3000 in your browser
```

### First Login

**Default Credentials:**
- Username: `admin`
- Password: (set in `.env` as `ADMIN_PASSWORD`)

**⚠️ Change default password immediately in production!**

---

## 📋 Usage

### 1. Add Target to Scope

```bash
# Add to whitelist first (security requirement)
curl -X POST http://localhost:8000/scope/whitelist \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entry_type": "domain",
    "value": "testsite.com",
    "description": "Authorized test target"
  }'

# Create target
curl -X POST http://localhost:8000/targets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Website",
    "url_or_ip": "https://testsite.com",
    "scope": "in_scope",
    "risk_tolerance": "medium",
    "owner_approval": true
  }'
```

### 2. Create Attack Plan

```bash
curl -X POST http://localhost:8000/attack_plans \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "target_id": 1,
    "attack_sequence": [1, 2, 3, 4],  # Attack IDs from library
    "scheduling": "manual_trigger",
    "max_risk_level": "medium"
  }'
```

### 3. Monitor Execution

- **Web Dashboard:** http://localhost:3000/plans
- **Real-time updates:** WebSocket at `ws://localhost:8000/ws`
- **Logs:** `docker-compose logs -f execution_plane`

### 4. View Reports

- **Download PDF:** http://localhost:3000/reports/{plan_id}
- **View online:** http://localhost:3000/evidence

---

## 🧠 Training the AI

AOPTool can learn new attacks by processing resources you provide:

### 1. Add Exploit Description (Text)

```bash
# Create file: training_model/exploits/my_new_exploit.txt
echo "SQL Injection via time-based blind technique:
1. Inject payload: ' OR IF(1=1, SLEEP(5), 0)--
2. Measure response time
3. If delayed by 5 seconds, vulnerability confirmed
4. Extract data byte-by-byte using SUBSTRING and SLEEP" > training_model/exploits/my_new_exploit.txt
```

### 2. Add Attack Flow Diagram (Image)

```bash
# Drop image file into folder
cp ~/Downloads/attack_flow_diagram.png training_model/attack_flows/
```

### 3. Trigger AI Processing

```bash
curl -X POST http://localhost:8000/intelligence/process_resources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**AI Output:**
- Parses text/images
- Generates Python/Bash attack scripts
- Creates validation logic
- Adds to Attack Library
- Ready for use in next attack plan

---

## 🗄️ Tech Stack

### Core Infrastructure
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL** - Structured data (targets, attacks, evidence metadata)
- **MongoDB** - Attack memory, learning data
- **Redis** - Task queue broker
- **MinIO** - S3-compatible object storage (evidence files)

### Backend
- **FastAPI** - REST API + WebSocket
- **Python 3.11** - Core logic
- **Celery** - Distributed task queue
- **SQLAlchemy** - Database ORM

### Frontend
- **React 18** - UI framework
- **Next.js 14** - Server-side rendering
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### AI/ML
- **Claude 4.5 Sonnet** - Primary AI (exploit translation, reasoning)
- **OpenAI GPT-4** - Backup AI
- **scikit-learn, XGBoost** - Local ML (confidence scoring)
- **MLflow** - Experiment tracking

### Security Tools
- **Nmap** - Network scanning
- **Metasploit** - Exploitation framework
- **SQLMap** - SQL injection
- **OWASP ZAP** - Web app scanning
- **Nuclei** - Vulnerability scanning
- **Gobuster** - Directory brute-forcing
- **Sublist3r** - Subdomain enumeration

---

## 📊 Project Status

**Current Phase:** Phase 1 - Infrastructure Setup
**Progress:** 5%

| Phase | Status | Progress |
|-------|--------|----------|
| 1. Infrastructure Setup | 🔄 IN PROGRESS | 5% |
| 2. Control Plane | ⏸️ PENDING | 0% |
| 3. Intelligence Plane | ⏸️ PENDING | 0% |
| 4. Execution Plane | ⏸️ PENDING | 0% |
| 5. Evidence & Validation | ⏸️ PENDING | 0% |
| 6. Learning & Evolution | ⏸️ PENDING | 0% |
| 7. Testing & Hardening | ⏸️ PENDING | 0% |
| 8. Cloud Migration (Optional) | ⏸️ PENDING | 0% |

**📈 Detailed Status:** See [PROJECT_STATUS.md](PROJECT_STATUS.md)

---

## 📚 Documentation

- **[SESSION_HANDOFF.md](SESSION_HANDOFF.md)** - 🚨 READ THIS FIRST (session continuity)
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete technical architecture
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Detailed progress tracking
- **[IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md)** - Chronological action log
- **[DECISIONS.md](DECISIONS.md)** - Architectural and implementation decisions

---

## 🔒 Security & Ethics

### ⚠️ Legal Disclaimer

**YOU ARE RESPONSIBLE FOR YOUR ACTIONS.**

This tool is designed for:
- ✅ Authorized penetration testing
- ✅ Security research on owned systems
- ✅ Educational purposes in controlled environments
- ✅ Bug bounty programs with explicit permission

This tool is **NOT** for:
- ❌ Unauthorized access to systems
- ❌ Malicious hacking
- ❌ Data theft or destruction
- ❌ Any illegal activity

**Penalties for unauthorized use:** Criminal prosecution, civil liability, imprisonment.

### Security Controls

1. **Scope Validation:** Hard-stop enforcement (no attacks outside whitelist)
2. **Approval Workflows:** High-risk attacks require human approval
3. **Audit Trail:** Immutable log of all actions
4. **Rate Limiting:** Prevents accidental DoS
5. **Container Isolation:** Each tool runs in isolated Docker container
6. **Secrets Management:** All credentials in environment variables
7. **Evidence Integrity:** SHA-256 hashes, WORM storage

---

## 💰 Cost Analysis

### Free (Local Only)
- All infrastructure: Docker, databases, tools
- **Total:** $0/year

### Paid AI APIs (Recommended)
- Claude API: ~$20-50/month
- **Total:** ~$240-600/year

### Cloud Hybrid (Optional)
- AWS/GCP free tier: $0 (Year 1)
- After free tier: ~$24/month
- **Total:** ~$288/year

**Target Budget:** <$100/year ✅ (achievable with local deployment + occasional AI usage)

---

## 🛠️ Development

### Project Structure

```
AOPTool/
├── control_plane/         # FastAPI backend
├── intelligence_plane/    # AI integration
├── execution_plane/       # Tool orchestration
├── evidence_plane/        # Validation & reporting
├── learning_plane/        # Feedback loops & ML
├── web_dashboard/         # React frontend
├── training_model/        # AI training resources
│   ├── exploits/          # Text exploit descriptions
│   ├── attack_flows/      # Attack flow diagrams (images)
│   ├── heuristics/        # Success/failure patterns
│   └── updates/           # CVE feeds, new techniques
├── init_scripts/          # Database initialization SQL
├── models/                # Trained ML models
├── wordlists/             # Pentesting wordlists
├── docker-compose.yml     # Container orchestration
├── .env.example           # Environment template
└── README.md              # This file
```

### Running Tests

```bash
# Unit tests
docker-compose run --rm control_plane pytest

# Integration tests
docker-compose run --rm execution_plane pytest tests/integration/

# Test on vulnerable app (OWASP Juice Shop)
docker run -d -p 3001:3000 bkimminich/juice-shop
# Add localhost:3001 to scope, create attack plan
```

### Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow [DECISIONS.md](DECISIONS.md) for architectural consistency
4. Update [IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md) with changes
5. Write tests
6. Commit with descriptive messages
7. Push and create Pull Request

---

## 🐛 Troubleshooting

### Docker containers won't start

```bash
# Check Docker is running
docker info

# View logs for specific container
docker-compose logs control_plane

# Restart all services
docker-compose down
docker-compose up -d
```

### Can't connect to databases

```bash
# Verify containers are healthy
docker-compose ps

# Check PostgreSQL connection
docker-compose exec postgres psql -U aoptool_user -d aoptool -c "SELECT 1;"

# Check MongoDB connection
docker-compose exec mongodb mongosh -u aoptool_user -p changeme --authenticationDatabase admin
```

### AI not responding

```bash
# Verify API key is set
docker-compose exec intelligence_plane env | grep CLAUDE_API_KEY

# Check API key validity
curl -X GET "https://api.anthropic.com/v1/models" \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

### Out of memory

```bash
# Check resource usage
docker stats

# Reduce Celery worker concurrency
# Edit docker-compose.yml:
# command: celery -A tasks worker --concurrency=2  # Reduce from 4 to 2
```

---

## 📜 License

MIT License - See [LICENSE](LICENSE) for details

**Copyright © 2025 AOPTool Project**

---

## 🙏 Acknowledgments

- **OWASP** - For vulnerable apps used in testing
- **Anthropic** - Claude AI API
- **Project Discovery** - Nuclei vulnerability scanner
- **Metasploit Project** - Exploitation framework
- **All open-source security tool maintainers**

---

## 📞 Contact

- **Issues:** https://github.com/yourusername/aoptool/issues
- **Discussions:** https://github.com/yourusername/aoptool/discussions
- **Security:** security@aoptool.local (for security vulnerabilities only)

---

## 🗺️ Roadmap

### Phase 1-2 (Current): Foundation ✅
- Docker infrastructure
- Control Plane API
- Web dashboard

### Phase 3-4: AI & Execution 🔄
- Claude API integration
- Tool executors
- Attack orchestration

### Phase 5-6: Intelligence 📅
- Results validation
- Evidence reporting
- Learning loops

### Phase 7-8: Production 🚀
- Security hardening
- Performance optimization
- Cloud migration (optional)

---

**Built with 🧠 AI + 🔧 Security + ⚡ Automation**
