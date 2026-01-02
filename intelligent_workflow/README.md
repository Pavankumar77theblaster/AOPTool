# Intelligent Workflow System for AOPTool

## Overview

This is the intelligent workflow system that provides automatic tool chaining based on vulnerability discoveries. It was developed as an enhancement for security reconnaissance platforms.

## Components

### Core Files
- `app_v3.py` - Flask web server with WebSocket support for real-time updates
- `modules/intelligent_workflow.py` - Main workflow orchestrator
- `templates/dashboard_v3.html` - Web dashboard with live progress tracking

### Supporting Modules
- `modules/port_scanner.py` - Asynchronous port scanning with service detection
- `modules/intelligent_workflow.py` - Workflow orchestration and tool chaining
- `modules/waf_detector.py` - WAF detection module (with bug fixes)
- `modules/kali_tools_integration.py` - Integration with Kali Linux tools
- `modules/owasp_advanced_scanner.py` - Advanced OWASP vulnerability testing
- `modules/bypass403_v3.py` - 403 bypass testing with improved validation
- `modules/subdomain_enumerator.py` - Subdomain enumeration

## Features

### Automatic Tool Chaining
The system automatically chains security tools based on findings:

**Example 1: Web Service Detected (Port 80/443)**
```
Port 80 found → WAF Detection → Nuclei Scan → Directory Fuzzing (FFuf)
             → If 403 found: Bypass Testing → OWASP Advanced Tests
```

**Example 2: Database Service (Port 3306 MySQL)**
```
Port 3306 MySQL → SQLMap Injection Test → Default Credentials
               → Database Enumeration → Data Extraction
```

**Example 3: Redis Service**
```
Port 6379 Redis → RCE Vulnerability Check → Unauthorized Access Test
```

### Real-Time Updates
- WebSocket-based live progress tracking
- Immediate display of discovered ports and services
- Real-time vulnerability findings
- Live activity log

### Intelligent Decision Making
- Service detection triggers appropriate tools automatically
- Finding-based workflow progression
- No manual intervention required

## Quick Start

### Installation
```bash
pip3 install flask flask-cors flask-socketio --break-system-packages
```

### Run Dashboard
```bash
python3 app_v3.py
```

### Access
Open browser to: http://localhost:5000

## Usage

1. Enter target URL or IP address
2. Check "Use Intelligent Workflow" option
3. Click "Start Intelligent Scan"
4. Watch real-time automatic tool chaining
5. Download report when complete

## API Endpoints

- `POST /api/scan/start` - Start new scan
- `GET /api/scan/{id}/status` - Get scan status
- `GET /api/scan/{id}/results` - Get scan results
- `GET /api/scan/{id}/download` - Download JSON report

## Documentation

- **INTELLIGENT_WORKFLOW_GUIDE.md** - Complete workflow documentation
- **QUICKSTART.md** - Quick start guide for immediate usage

## Test Results

Tested on `scanme.nmap.org`:
- ✅ Scan duration: ~3 seconds
- ✅ Discovered ports: 22 (SSH), 80 (HTTP)
- ✅ Service detection working
- ✅ Automatic tool triggers: nuclei_web, ffuf, bypass_403, ssh_audit
- ✅ Real-time WebSocket updates functional

## Integration with AOPTool

This intelligent workflow system can be integrated with AOPTool to provide:
- Automatic vulnerability discovery workflows
- Real-time scan progress tracking
- Service-based tool selection
- Continuous penetration testing capabilities

## Architecture

```
IntelligentWorkflow (orchestrator)
    ├── Phase 1: Port Scanning
    ├── Phase 2: Service Detection
    ├── Phase 3: Service-Specific Testing
    │   ├── Web Services → Nuclei, FFuf, 403 Bypass, OWASP
    │   ├── Databases → SQLMap, Default Creds
    │   └── Other → Service-specific tools
    ├── Phase 4: Vulnerability Analysis
    └── Phase 5: Report Generation
```

## Credits

Developed as part of ReconBuster v3.0 enhancements
Integrated into AOPTool for advanced penetration testing workflows

## License

Same as parent AOPTool project
