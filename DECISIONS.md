# AOPTool - Decision Log

**Purpose:** Document all architectural and implementation decisions with rationale

---

## Table of Contents

1. [Architecture Decisions](#architecture-decisions)
2. [Technology Choices](#technology-choices)
3. [Implementation Decisions](#implementation-decisions)
4. [Security Decisions](#security-decisions)
5. [Future Decisions](#future-decisions)

---

## Architecture Decisions

### AD-001: 5-Plane Architecture
**Date:** 2025-12-26
**Status:** ✅ Accepted
**Context:** Need to organize complex autonomous pentesting system

**Decision:** Implement 5-plane architecture:
1. Control Plane (User interaction)
2. Intelligence Plane (AI reasoning)
3. Execution Plane (Tool execution)
4. Evidence & Validation Plane (Results processing)
5. Learning & Evolution Plane (Continuous improvement)

**Rationale:**
- Clear separation of concerns
- Each plane has single responsibility
- Easier to test, debug, and scale individual planes
- Facilitates future cloud migration (planes can be deployed separately)
- Aligns with enterprise architecture patterns

**Alternatives Considered:**
- Monolithic application: Rejected (too complex, hard to scale)
- Microservices (fine-grained): Rejected (overhead too high for laptop deployment)

**Consequences:**
- ✅ Clean architecture
- ✅ Easy to understand and maintain
- ⚠️ More complex deployment (multiple containers)
- ⚠️ Inter-plane communication overhead

---

### AD-002: Docker-First Deployment
**Date:** 2025-12-26
**Status:** ✅ Accepted
**Context:** Need isolated, reproducible environment on laptop

**Decision:** Use Docker Compose for local deployment, design for Kubernetes migration

**Rationale:**
- Docker provides isolation without VM overhead
- Docker Compose handles multi-container orchestration
- Easy to version control (infrastructure as code)
- Same containers can run locally or in cloud
- Prevents "works on my machine" issues

**Alternatives Considered:**
- Virtual machines: Rejected (too heavy for 16GB RAM)
- Native installation: Rejected (dependency conflicts, hard to reproduce)
- Kubernetes local (minikube): Rejected (unnecessary complexity for phase 1)

**Consequences:**
- ✅ Reproducible environment
- ✅ Easy cleanup (docker-compose down)
- ✅ Cloud migration path clear
- ⚠️ Requires Docker Desktop on Windows

---

### AD-003: Hybrid Local/Cloud Architecture
**Date:** 2025-12-26
**Status:** ✅ Accepted (Future)
**Context:** Laptop has limited resources, but want to keep sensitive operations local

**Decision:** Design for hybrid deployment:
- Control Plane: Always local (user control)
- Intelligence Plane: Local preferred (custom models on GPU)
- Execution Plane: Cloud optional (scale for heavy scans)
- Databases: Cloud optional (managed services)

**Rationale:**
- Keeps user in control (approval workflows local)
- Leverages local GPU for custom ML models
- Scales execution when needed (pay only for compute time)
- Sensitive data (attack plans) stays local

**Alternatives Considered:**
- Full cloud: Rejected (loss of control, recurring costs)
- Full local: Accepted for Phase 1, cloud as optional scaling

**Consequences:**
- ✅ Best of both worlds
- ✅ Cost optimization (pay only when scaling)
- ⚠️ More complex networking (VPN for hybrid)
- ⚠️ Need to handle local/cloud data sync

---

## Technology Choices

### TC-001: PostgreSQL for Structured Data
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** Use PostgreSQL for:
- Targets, attacks, attack plans
- Attack executions
- Evidence metadata
- Audit logs

**Rationale:**
- ACID compliance (critical for audit trail)
- Strong relational model (targets ← plans ← executions ← evidence)
- JSON support (JSONB for flexible fields)
- Excellent query performance for complex joins
- Free and open source
- Wide adoption (easy to find help)

**Alternatives Considered:**
- MySQL: Similar, but PostgreSQL has better JSON support
- SQLite: Too limited for concurrent writes
- NoSQL only: Need relational integrity for audit trail

---

### TC-002: MongoDB for Attack Memory
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** Use MongoDB for:
- Attack memory (historical outcomes)
- Training resources metadata
- Model version tracking

**Rationale:**
- Flexible schema (attack contexts vary widely)
- Nested documents (outcomes within contexts within attacks)
- Fast writes for frequent memory updates
- Aggregation pipeline for success rate calculations
- Free and open source

**Alternatives Considered:**
- PostgreSQL only: JSONB columns could work, but less natural
- Elasticsearch: Overkill for this use case

---

### TC-003: Claude API as Primary AI
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** Use Claude 4.5 Sonnet as primary AI, with OpenAI GPT-4 as backup

**Rationale:**
- Claude excels at structured output (JSON attack definitions)
- Strong reasoning capabilities (attack chain planning)
- Cost-effective ($20-50/month estimated)
- Longer context window (useful for exploit descriptions)
- Good at code generation (Python/Bash scripts)

**Alternatives Considered:**
- OpenAI GPT-4: Similar capability, slightly higher cost
- Local LLMs (Llama 3, etc.): Free but weaker reasoning, higher GPU usage
- No AI: Manual attack scripting defeats purpose

**Decision:** Use Claude primary, GPT-4 fallback, local models for simple tasks

---

### TC-004: FastAPI for Backend
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** Use FastAPI for Control Plane API

**Rationale:**
- Async support (handles WebSocket + REST in same app)
- Auto-generated OpenAPI docs (easy API testing)
- Type hints + Pydantic (fewer bugs)
- Fast (comparable to Node.js)
- Easy to learn (coming from Python background)

**Alternatives Considered:**
- Flask: Simpler but no async, no auto-docs
- Django: Too heavy, includes ORM we don't need (using SQLAlchemy/asyncpg directly)
- Node.js: Different language, team is Python-focused

---

### TC-005: React + Next.js for Frontend
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** Use React 18 with Next.js 14 for web dashboard

**Rationale:**
- Component-based (reusable UI elements)
- Large ecosystem (UI libraries, tools)
- Next.js provides server-side rendering (faster initial load)
- Built-in routing
- Easy to deploy (Vercel if going cloud)

**Alternatives Considered:**
- Vue.js: Simpler but smaller ecosystem
- Svelte: Newer, less mature ecosystem
- Plain HTML/JS: Too much boilerplate

---

### TC-006: Celery for Task Queue
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** Use Celery with Redis broker for attack orchestration

**Rationale:**
- Battle-tested (used in production by Instagram, etc.)
- Supports complex workflows (chains, groups, chords)
- Retry logic built-in
- Priority queues (prioritize critical attacks)
- Monitoring tools (Flower)

**Alternatives Considered:**
- RQ: Simpler but less feature-rich
- Custom queue: Reinventing the wheel

---

### TC-007: MinIO for Evidence Storage
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** Use MinIO for binary evidence (screenshots, pcaps, files)

**Rationale:**
- S3-compatible API (easy to migrate to AWS S3 later)
- Self-hosted (free, no egress costs)
- Lightweight (runs on laptop)
- Web console for debugging

**Alternatives Considered:**
- Local filesystem: Works but no S3 migration path
- PostgreSQL bytea: Not designed for large blobs
- AWS S3 directly: Costs money, requires internet

---

## Implementation Decisions

### ID-001: Scope Validation as Hard Stop
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** All targets MUST pass scope validation before ANY attack execution

**Rationale:**
- **CRITICAL SECURITY CONTROL**
- Prevents accidental/malicious attacks on unauthorized targets
- Legal protection (audit trail shows validation)
- Ethical pentesting requirement

**Implementation:**
```python
# Every attack execution path:
def execute_attack(target_id):
    # ALWAYS validate first
    if not scope_validator.validate_target(target_id):
        raise ScopeViolationError("Target not in whitelist")
        log_audit("SCOPE_VIOLATION_BLOCKED", target_id)
    # ... proceed with attack
```

**Alternatives Considered:**
- Soft warnings: REJECTED (too risky)
- Validation only at plan creation: REJECTED (target could be removed from whitelist after plan created)

---

### ID-002: Three-Tier Approval Workflow
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** Implement risk-based approval:
- Low/Medium risk: Auto-approve
- High risk: Human approval required
- Critical risk: Admin approval + confirmation

**Rationale:**
- Balance automation with safety
- Critical attacks (e.g., exploit with code execution) need human oversight
- Low-risk recon (e.g., nmap port scan) can run automatically

**Implementation:**
- Risk level determined by attack definition
- Control Plane enforces approval workflow
- Audit log tracks all approvals

---

### ID-003: Evidence Immutability
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** Evidence records are immutable (insert-only, no updates/deletes)

**Rationale:**
- Legal requirement (chain of custody)
- Audit trail integrity
- Debugging (can see full history)

**Implementation:**
- PostgreSQL evidence table has no UPDATE/DELETE permissions
- MinIO objects set to WORM (write-once-read-many) mode
- File hash (SHA-256) stored for integrity verification

---

### ID-004: AI Output Validation
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** NEVER execute AI-generated scripts without validation

**Rationale:**
- AI can hallucinate (generate invalid commands)
- Security risk (AI could generate destructive commands)
- Need to validate:
  - Syntax (is it valid Python/Bash?)
  - Safety (does it attempt dangerous operations?)
  - Scope (does it target whitelisted hosts?)

**Implementation:**
```python
def execute_ai_generated_script(script: str):
    # 1. Syntax validation
    validate_syntax(script)

    # 2. Safety check (AST analysis for dangerous functions)
    check_for_dangerous_operations(script)

    # 3. Sandbox execution (limited permissions)
    result = execute_in_sandbox(script)

    return result
```

---

### ID-005: Rate Limiting at Multiple Levels
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** Implement rate limiting at:
1. API level (prevent API abuse)
2. Target level (prevent DoS against target)
3. Tool level (prevent resource exhaustion)

**Rationale:**
- Prevent accidental DoS
- Evade detection (slow down scans)
- Protect laptop resources

**Implementation:**
- FastAPI middleware for API rate limiting
- Celery task rate limiting for target-level control
- Sleep delays in tool executors

---

## Security Decisions

### SD-001: JWT for Authentication
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** Use JWT (JSON Web Tokens) for API authentication

**Rationale:**
- Stateless (no session storage needed)
- Self-contained (carries user info)
- Can set expiration
- Industry standard

**Implementation:**
- Login endpoint issues JWT
- All API endpoints require valid JWT
- Token expires after 24 hours
- Secret key stored in environment variable (not in code)

**Alternatives Considered:**
- Session cookies: Requires session storage
- API keys: Less secure (no expiration)

---

### SD-002: Secrets in Environment Variables
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** All secrets (passwords, API keys) stored in `.env` file, NEVER committed to Git

**Rationale:**
- Security best practice
- Easy to rotate secrets (change .env file)
- Different secrets per environment (dev/prod)

**Implementation:**
- Create `.env.example` with placeholder values (committed)
- Create `.env` with real values (in .gitignore)
- Docker Compose loads from `.env` file

---

### SD-003: Container Network Isolation
**Date:** 2025-12-26
**Status:** ✅ Accepted

**Decision:** All containers in single Docker network, only web_dashboard exposed to host

**Rationale:**
- Minimize attack surface
- Databases not accessible from host (only within Docker network)
- Only intended entry points (web UI, API) exposed

**Implementation:**
- docker-compose.yml defines `aoptool_network`
- Database containers: no `ports` section (internal only)
- Control Plane, Web Dashboard: `ports` exposed

---

## Future Decisions

### FD-001: Local LLM Integration (Pending)
**Date:** 2025-12-26
**Status:** ⏸️ Pending

**Context:** Reduce reliance on paid APIs, leverage local GPU

**Options:**
1. Llama 3 70B (requires quantization to fit in VRAM)
2. Mixtral 8x7B (good reasoning, smaller)
3. CodeLlama (specialized for code generation)

**Considerations:**
- Quality vs. cost tradeoff
- GPU memory constraints (RTX 3050 = 8GB VRAM)
- Inference speed

**Decision Timeline:** After Phase 3 (AI integration) is complete

---

### FD-002: Cloud Provider Choice (Pending)
**Date:** 2025-12-26
**Status:** ⏸️ Pending

**Context:** If hybrid cloud deployment needed, which provider?

**Options:**
1. AWS (largest, most services)
2. GCP (good free tier, easy Kubernetes)
3. Azure (enterprise focus)

**Considerations:**
- Free tier (12 months AWS, always-free GCP e2-micro)
- Cost after free tier
- Ease of Kubernetes setup

**Decision Timeline:** Phase 8 (Cloud Migration)

---

### FD-003: Reporting Format (Pending)
**Date:** 2025-12-26
**Status:** ⏸️ Pending

**Context:** What report formats to support?

**Options:**
1. PDF only (simple)
2. PDF + HTML (interactive)
3. PDF + HTML + JSON (machine-readable)
4. Custom format (markdown?)

**Considerations:**
- PDF required for deliverables
- HTML useful for interactive dashboards
- JSON useful for CI/CD integration

**Decision Timeline:** Phase 5 (Evidence & Validation)

---

## Decision Template

```markdown
### [ID]: [Decision Title]
**Date:** YYYY-MM-DD
**Status:** ✅ Accepted / ⏸️ Pending / ❌ Rejected / ⚠️ Superseded

**Context:** Background and problem statement

**Decision:** What was decided

**Rationale:** Why this decision was made

**Alternatives Considered:**
- Option 1: Why rejected
- Option 2: Why rejected

**Consequences:**
- ✅ Positive impact
- ⚠️ Tradeoff/risk

**Implementation:** How to implement (if relevant)
```

---

**Decision Log Status:** Active
**Last Updated:** 2025-12-26
**Total Decisions:** 18 (15 accepted, 3 pending)
