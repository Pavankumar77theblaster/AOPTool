# AOPTool Web Dashboard - Complete User Guide

**A Simple, Detailed Guide to Using the AOPTool Web Interface**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Layout Overview](#dashboard-layout-overview)
3. [Homepage (Dashboard)](#homepage-dashboard)
4. [Targets Page](#targets-page)
5. [Attacks Library](#attacks-library)
6. [Attack Plans](#attack-plans)
7. [Executions & Monitoring](#executions--monitoring)
8. [Evidence Browser](#evidence-browser)
9. [Settings & Whitelist](#settings--whitelist)
10. [Common Workflows](#common-workflows)
11. [Tips & Tricks](#tips--tricks)

---

## Getting Started

### Accessing the Dashboard

1. **Open your web browser** (Chrome, Firefox, Edge, or Safari)
2. **Navigate to**: `http://localhost:3000`
3. **You'll see the login page**

### First Login

**Login Page:**
```
┌─────────────────────────────────┐
│      AOPTool Login              │
│                                 │
│  Username: [ admin          ]   │
│  Password: [ ************** ]   │
│                                 │
│     [ Login Button ]            │
└─────────────────────────────────┘
```

**Default credentials:**
- **Username**: `admin`
- **Password**: `Admin@2025!Secure` (or whatever you set in `.env`)

**After login**, you'll be redirected to the main dashboard.

---

## Dashboard Layout Overview

### Understanding the Interface

**The dashboard has 3 main parts:**

```
┌─────────────────────────────────────────────────────────┐
│  [Logo] AOPTool                                [Profile] │  ← Top Header
├────────┬────────────────────────────────────────────────┤
│        │                                                │
│ MENU   │         MAIN CONTENT AREA                      │
│ SIDE   │         (Changes based on what you click)      │
│ BAR    │                                                │
│        │                                                │
│ 🏠 Dash│                                                │
│ 🎯 Targ│                                                │
│ ⚔️  Att│                                                │
│ 📋 Plan│                                                │
│ 🚀 Exec│                                                │
│ 📄 Evid│                                                │
│ ⚙️  Sett│                                                │
│        │                                                │
└────────┴────────────────────────────────────────────────┘
   ↑                           ↑
Sidebar Menu          Main Content Changes Here
```

### Sidebar Menu Explained

**Each icon takes you to a different page:**

| Icon | Name | Purpose |
|------|------|---------|
| 🏠 | **Dashboard** | Overview and statistics |
| 🎯 | **Targets** | Manage systems you're testing |
| ⚔️ | **Attacks** | Browse 30 attack techniques |
| 📋 | **Plans** | Create attack sequences |
| 🚀 | **Executions** | Monitor running attacks |
| 📄 | **Evidence** | View collected screenshots/files |
| ⚙️ | **Settings** | Whitelist management |

---

## Homepage (Dashboard)

### What You See When You Login

The dashboard homepage shows you everything at a glance.

### Section 1: System Health (Top Row)

```
┌──────────────────┬──────────────────┬──────────────────┐
│ Control Plane    │ Intelligence     │ Resource Usage   │
│                  │ Plane            │                  │
│   Healthy ✓      │   Healthy ✓      │  🔥 CPU: 45%    │
│   (Green)        │   (Cyan)         │  💾 MEM: 62%    │
└──────────────────┴──────────────────┴──────────────────┘
```

**What this means:**

- **Control Plane**: Main system (should show "Healthy" in green)
- **Intelligence Plane**: AI system (should show "Healthy" in cyan)
- **Resource Usage**: How much CPU and Memory your system is using
  - **Green** = Good (under 70%)
  - **Orange** = Warning (70-90%)
  - **Red** = Critical (over 90%)

**If you see "Offline" in red**: Something is wrong! Check the [Troubleshooting](#troubleshooting) section.

### Section 2: Statistics Cards

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total        │ Attack       │ Active       │ Evidence     │
│ Targets      │ Plans        │ Executions   │ Collected    │
│              │              │              │              │
│    15        │    8         │    2         │    47        │
│ View all →   │ View all →   │ Monitor →    │ Browse →     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**What each number means:**

1. **Total Targets**: How many systems you've added for testing
2. **Attack Plans**: How many attack sequences you've created
3. **Active Executions**: How many attacks are running RIGHT NOW
4. **Evidence Collected**: Screenshots, logs, and files gathered

**Click "View all →"** to go to that section.

### Section 3: Recent Executions & Vulnerability Chart

```
┌──────────────────────────────┬──────────────────┐
│ Recent Executions            │ Vulnerability    │
│                              │ Distribution     │
│ Nmap Port Scan               │                  │
│ example.com                  │   [Donut Chart]  │
│ [Completed] 2 mins ago       │                  │
│                              │   38 Total       │
│ SQL Injection Test           │   Risks          │
│ testsite.com                 │                  │
│ [Running] 30 secs ago        │  Critical: 3     │
│                              │  High: 8         │
│ ...                          │  Medium: 15      │
│                              │  Low: 12         │
└──────────────────────────────┴──────────────────┘
```

**Recent Executions:**
- Shows your latest attack executions
- **Status badges**:
  - **Green**: Completed
  - **Blue (pulsing)**: Running
  - **Orange**: Pending/Queued
  - **Red**: Failed

**Vulnerability Distribution Chart:**
- **Critical** (Red): VERY dangerous vulnerabilities
- **High** (Orange): Serious issues
- **Medium** (Cyan): Moderate risks
- **Low** (Green): Minor issues

### Section 4: Live Activity Feed

```
┌─────────────────────────────────────────────────────────┐
│ Live Activity Feed                    ⏸ Pause│● Live    │
│                                                          │
│ system@aoptool:~$                                        │
│ ┌────────────────────────────────────────────────────┐  │
│ │ [10:30:45] › Initializing Nmap port scan...        │  │
│ │ [10:30:47] ✓ Discovered 22 open ports             │  │
│ │ [10:31:02] › SQL injection test running...         │  │
│ │ [10:31:15] ⚠ XSS vulnerability detected            │  │
│ │ [10:31:32] › Technology: Nginx 1.21.3              │  │
│ │ [10:31:45] ✓ Attack sequence completed             │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ● Live  •  6 entries                                     │
└─────────────────────────────────────────────────────────┘
```

**What this shows:**
- **Real-time logs** of what's happening in the background
- **Symbols**:
  - `›` = Info (cyan)
  - `✓` = Success (green)
  - `⚠` = Warning (orange)
  - `✗` = Error (red)

**Features:**
- **Auto-scroll**: Automatically shows newest logs
- **Hover to pause**: Move your mouse over the terminal to pause scrolling
- **Pause button**: Click to manually pause/resume

### Section 5: Quick Actions

```
┌──────────────┬──────────────┬──────────────┐
│   +          │   📋         │   👁️         │
│ New Target   │ Create Plan  │ Monitor      │
│ Add a new    │ Generate AI  │ View live    │
│ pentesting   │ attack plan  │ execution    │
│ target       │              │ status       │
└──────────────┴──────────────┴──────────────┘
```

**Click these boxes** for quick access to common tasks.

### Section 6: Security Warning (Bottom)

```
┌─────────────────────────────────────────────────────────┐
│ ⚠ Authorized Use Only                                   │
│                                                          │
│ This tool is for authorized security testing only.      │
│ Ensure proper permissions before testing.               │
└─────────────────────────────────────────────────────────┘
```

**Important reminder**: Always have written permission!

---

## Targets Page

### What Are Targets?

**Targets** are the systems you want to test. This could be:
- A website (like `https://example.com`)
- A web application
- A server IP address
- A network range

### Viewing All Targets

**Click** 🎯 **Targets** in the sidebar.

**You'll see a table:**

```
┌─────────────────────────────────────────────────────────────┐
│ Targets                                    [+ New Target]    │
├──────────────┬────────────────┬────────┬──────────┬─────────┤
│ Name         │ URL/IP         │ Scope  │ Risk     │ Actions │
├──────────────┼────────────────┼────────┼──────────┼─────────┤
│ Example Site │ example.com    │ ✓ In   │ Medium   │ View    │
│              │                │ Scope  │          │ Edit    │
│              │                │        │          │ Delete  │
├──────────────┼────────────────┼────────┼──────────┼─────────┤
│ Test Server  │ 192.168.1.100  │ ✓ In   │ Low      │ View    │
│              │                │ Scope  │          │ Edit    │
│              │                │        │          │ Delete  │
└──────────────┴────────────────┴────────┴──────────┴─────────┘
```

**Columns explained:**
- **Name**: Your label for the target
- **URL/IP**: The actual address
- **Scope**:
  - ✓ **In Scope** (green) = Authorized for testing
  - ✗ **Out of Scope** (red) = NOT authorized
- **Risk Tolerance**: How aggressive you can be
  - **Low**: Safe, non-invasive tests only
  - **Medium**: Standard penetration testing
  - **High**: Aggressive attacks (use carefully!)

### Creating a New Target

**Step-by-step:**

1. **Click** the `[+ New Target]` button (top right)

2. **You'll see a form:**

```
┌─────────────────────────────────────────────────────────┐
│ Create New Target                                        │
│                                                          │
│ Name *                                                   │
│ [ My Test Website                    ]                  │
│                                                          │
│ URL or IP Address *                                      │
│ [ https://example.com                ]                  │
│                                                          │
│ Description                                              │
│ [ E-commerce site for pentesting     ]                  │
│                                                          │
│ Scope *                                                  │
│ ( ) In Scope  (✓) Out of Scope                          │
│                                                          │
│ Risk Tolerance *                                         │
│ ( ) Low  (✓) Medium  ( ) High                           │
│                                                          │
│ ✓ I have owner approval to test this target             │
│                                                          │
│     [Cancel]              [Create Target]                │
└─────────────────────────────────────────────────────────┘
```

3. **Fill in the form:**

**Field by field explanation:**

**a) Name** (Required)
- Give it a friendly name you'll remember
- Example: "Company Website", "Test Lab Server"

**b) URL or IP Address** (Required)
- The system you want to test
- Examples:
  - Website: `https://example.com`
  - IP address: `192.168.1.100`
  - With port: `http://testsite.com:8080`

**c) Description** (Optional)
- Notes about this target
- Example: "Production e-commerce site - test after hours only"

**d) Scope** (Required)
- **In Scope**: You CAN attack this (use this!)
- **Out of Scope**: You CANNOT attack this (documentation only)

⚠️ **IMPORTANT**: The system will **BLOCK** attacks on "Out of Scope" targets!

**e) Risk Tolerance** (Required)
- **Low**: Safe scanning only (port scans, passive detection)
- **Medium**: Standard pentesting (SQL injection, XSS tests)
- **High**: Aggressive attacks (exploitation, brute force)

**f) Owner Approval Checkbox** (Required)
- ✓ You MUST check this box
- This confirms you have permission to test

4. **Click** `[Create Target]`

5. **Success!** You'll see:
```
✓ Target created successfully!
```

### ⚠️ BEFORE Creating a Target: Whitelist It!

**CRITICAL STEP**: You MUST add the target to your whitelist first!

**Why?** The system has **hard-stop protection** - it won't let you attack anything not on the whitelist.

**How to whitelist** (do this FIRST):

1. Click ⚙️ **Settings** → **Whitelist**
2. Click `[+ Add Entry]`
3. Fill in:
   - **Entry Type**: Domain (or IP/CIDR)
   - **Value**: `example.com` (your target)
   - **Description**: "Authorized pentest target"
4. Click `[Add to Whitelist]`

**NOW** you can create your target!

### Editing a Target

1. In the Targets table, click `[Edit]` next to the target
2. Change any fields
3. Click `[Update Target]`

### Deleting a Target

1. Click `[Delete]` next to the target
2. **Confirmation dialog appears:**
   ```
   ⚠️ Delete Target?

   Are you sure you want to delete "My Test Website"?
   This will also delete all associated plans and executions.

   [Cancel]  [Yes, Delete]
   ```
3. Click `[Yes, Delete]` to confirm

⚠️ **Warning**: This deletes EVERYTHING - plans, executions, evidence!

---

## Attacks Library

### What Is the Attacks Library?

This is a catalog of **30 pre-configured attack techniques** you can use.

### Accessing the Library

**Click** ⚔️ **Attacks** in the sidebar.

### What You'll See

```
┌─────────────────────────────────────────────────────────┐
│ Attack Library                                           │
│                                                          │
│ Filter by:  [All Categories ▾]  [All Risk Levels ▾]    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ RECONNAISSANCE (6 attacks)                               │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ #1  Nmap Port Scan                        [Low Risk]│ │
│ │                                                     │ │
│ │ Comprehensive port scanning to discover open       │ │
│ │ services and potential entry points                │ │
│ │                                                     │ │
│ │ Tool: Nmap                                          │ │
│ │ Category: Reconnaissance                            │ │
│ │                                                     │ │
│ │                           [View Details]            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ #2  Subdomain Enumeration               [Low Risk] │ │
│ │ ...                                                 │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ VULNERABILITY SCANNING (6 attacks)                       │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘
```

### Attack Categories

The 30 attacks are organized into 5 categories:

**1. RECONNAISSANCE (6 attacks)**
- Finding information about your target
- Examples:
  - Nmap Port Scan
  - Subdomain Enumeration
  - Technology Detection (WhatWeb)
  - Whois Lookup
  - DNS Enumeration
  - Certificate Transparency

**2. VULNERABILITY SCANNING (6 attacks)**
- Finding security weaknesses
- Examples:
  - Nuclei Template Scanning
  - Nikto Web Server Scan
  - SSL/TLS Analysis
  - Security Headers Check
  - CVE Database Search

**3. WEB APPLICATION (6 attacks)**
- Testing web apps for vulnerabilities
- Examples:
  - SQL Injection (SQLMap)
  - Cross-Site Scripting (XSStrike)
  - Directory Brute Force (Gobuster)
  - Fuzzing (FFUF)
  - JWT Token Analysis
  - CORS Misconfiguration

**4. NETWORK (6 attacks)**
- Network-level attacks
- Examples:
  - Mass Port Scanning (Masscan)
  - Netcat Testing
  - Packet Capture
  - Route Tracing
  - Ping Sweep
  - ARP Scanning

**5. EXPLOITATION (6 attacks)**
- Actually exploiting found vulnerabilities
- Examples:
  - Metasploit Framework
  - Exploit-DB Search
  - Password Attacks
  - Brute Force
  - Custom Exploit Execution

### Risk Levels Explained

Each attack has a risk level:

| Badge | Risk Level | What It Means | Example |
|-------|------------|---------------|---------|
| 🟢 | **Low** | Safe, passive | Port scanning |
| 🟡 | **Medium** | Standard testing | SQL injection tests |
| 🟠 | **High** | Aggressive | Password cracking |
| 🔴 | **Critical** | Very aggressive | Active exploitation |

### Viewing Attack Details

**Click** `[View Details]` on any attack.

**You'll see:**

```
┌─────────────────────────────────────────────────────────┐
│ Attack Details                                   [Close] │
│                                                          │
│ Nmap Port Scan                                           │
│ Risk Level: Low                                          │
│                                                          │
│ Description:                                             │
│ Comprehensive port scanning using Nmap to discover      │
│ open services, operating systems, and potential entry   │
│ points on target systems.                               │
│                                                          │
│ Tool: Nmap 7.94                                          │
│ Category: Reconnaissance                                 │
│ Estimated Duration: 2-5 minutes                          │
│                                                          │
│ Parameters:                                              │
│ • Target IP/Domain (required)                            │
│ • Scan Type: -sS (SYN scan)                              │
│ • Port Range: 1-65535                                    │
│                                                          │
│ Output:                                                  │
│ • Open ports list                                        │
│ • Service versions                                       │
│ • OS detection results                                   │
│                                                          │
│ Evidence Collected:                                      │
│ • nmap_scan_output.txt                                   │
│ • nmap_results.xml                                       │
│                                                          │
│                           [Add to Plan]                  │
└─────────────────────────────────────────────────────────┘
```

### Using Filters

**Filter by Category:**
Click the dropdown: `[All Categories ▾]`
```
✓ All Categories
  Reconnaissance
  Vulnerability Scanning
  Web Application
  Network
  Exploitation
```

**Filter by Risk:**
Click the dropdown: `[All Risk Levels ▾]`
```
✓ All Risk Levels
  Low
  Medium
  High
  Critical
```

**Filters stack!** You can select both category AND risk level.

---

## Attack Plans

### What Is an Attack Plan?

An **Attack Plan** is a **sequence of attacks** you want to run against a target.

**Example:**
```
Plan: "Web App Security Test"
Target: example.com

Attack Sequence:
1. Nmap Port Scan (find open ports)
2. Technology Detection (see what's running)
3. SQL Injection Test (test for SQL vulnerabilities)
4. XSS Detection (test for script injection)
```

The attacks run **in order**, one after another.

### Viewing Your Plans

**Click** 📋 **Plans** in the sidebar.

**You'll see:**

```
┌─────────────────────────────────────────────────────────┐
│ Attack Plans                              [+ New Plan]   │
├───────────────┬──────────┬────────┬──────────┬──────────┤
│ Plan Name     │ Target   │ Attacks│ Status   │ Actions  │
├───────────────┼──────────┼────────┼──────────┼──────────┤
│ Web App Test  │ example  │ 4      │ Draft    │ View     │
│               │ .com     │        │          │ Execute  │
│               │          │        │          │ Delete   │
├───────────────┼──────────┼────────┼──────────┼──────────┤
│ Network Scan  │ 192.168  │ 6      │ Completed│ View     │
│               │ .1.0/24  │        │          │ Delete   │
└───────────────┴──────────┴────────┴──────────┴──────────┘
```

**Status explained:**
- **Draft**: Created but never run
- **Running**: Currently executing
- **Completed**: Finished successfully
- **Failed**: Something went wrong

### Creating a Plan (AI Method) ⭐ RECOMMENDED

**This is the EASY way!** Just tell the AI what you want in plain English.

**Step-by-step:**

1. **Click** `[+ New Plan]` button

2. **You'll see two options:**

```
┌─────────────────────────────────────────────────────────┐
│ Create New Attack Plan                                   │
│                                                          │
│ Select Target *                                          │
│ [example.com                    ▾]                       │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ METHOD 1: AI-Powered Planning (Recommended)         │ │
│ │                                                     │ │
│ │ Describe what you want to test in plain English    │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐│ │
│ │ │ Example: "Scan for SQL injection and XSS       ││ │
│ │ │ vulnerabilities on this web application"       ││ │
│ │ │                                                 ││ │
│ │ │ [                                              ]││ │
│ │ │ [                                              ]││ │
│ │ │ [                                              ]││ │
│ │ └─────────────────────────────────────────────────┘│ │
│ │                                                     │ │
│ │                   [Generate Plan with AI]           │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

3. **Select your target** from dropdown

4. **Type what you want to test** in plain English:

**Example descriptions you can use:**

```
"Scan this website for SQL injection and XSS vulnerabilities"

"Perform a full reconnaissance and vulnerability scan"

"Test for authentication bypass and session hijacking"

"Check for common web vulnerabilities"

"Do a complete penetration test on this web application"

"Find all subdomains and check for security issues"

"Test API endpoints for injection attacks"
```

5. **Click** `[Generate Plan with AI]`

6. **Wait 5-10 seconds** while AI processes...

7. **AI shows you its plan:**

```
┌─────────────────────────────────────────────────────────┐
│ AI-Generated Attack Plan                                 │
│                                                          │
│ 🧠 AI Reasoning:                                         │
│ Target appears to be a web application. I've selected   │
│ attacks focusing on common web vulnerabilities:          │
│                                                          │
│ 1. Reconnaissance phase (Nmap + Technology Detection)   │
│ 2. SQL Injection testing (SQLMap)                       │
│ 3. Cross-Site Scripting detection (XSStrike)            │
│                                                          │
│ Estimated Duration: 15-20 minutes                        │
│ Risk Level: Medium                                       │
│                                                          │
│ ✓ Attack Sequence:                                       │
│ [1] Nmap Port Scan                                       │
│ [2] WhatWeb Technology Detection                         │
│ [3] SQL Injection Test (SQLMap)                          │
│ [4] Cross-Site Scripting (XSStrike)                      │
│                                                          │
│ Plan Name:                                               │
│ [ SQL and XSS Security Test                   ]          │
│                                                          │
│     [Regenerate]              [Create Plan]              │
└─────────────────────────────────────────────────────────┘
```

8. **Review the plan:**
   - Check the attack sequence makes sense
   - Verify risk level is appropriate
   - Edit the plan name if you want

9. **Click** `[Create Plan]`

10. **Success!**
```
✓ Attack plan created successfully!
```

**Not happy with AI's suggestions?**
- Click `[Regenerate]` to try again
- Or switch to manual method (see below)

### Creating a Plan (Manual Method)

**For advanced users who know exactly what they want.**

**Scroll down on the same page to see:**

```
┌─────────────────────────────────────────────────────────┐
│ METHOD 2: Manual Attack Selection                        │
│                                                          │
│ Plan Name *                                              │
│ [ My Custom Plan                         ]               │
│                                                          │
│ Select Attacks from Library:                             │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Available Attacks                                   │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ ☐ #1  Nmap Port Scan              [Low]        │ │ │
│ │ │ ☐ #2  Subdomain Enumeration       [Low]        │ │ │
│ │ │ ☑ #10 SQL Injection (SQLMap)      [Medium]     │ │ │
│ │ │ ☑ #11 XSS Detection (XSStrike)    [Medium]     │ │ │
│ │ │ ☐ #15 Directory Brute Force       [Medium]     │ │ │
│ │ │ ...                                             │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Selected Attacks: 2                                      │
│ Estimated Duration: 10-15 minutes                        │
│                                                          │
│ Risk Level: Medium                                       │
│                                                          │
│                           [Create Plan]                  │
└─────────────────────────────────────────────────────────┘
```

**Steps:**
1. Give your plan a name
2. Check the boxes for attacks you want
3. They'll run in the order you select them
4. Click `[Create Plan]`

### Viewing Plan Details

1. In the Plans table, click `[View]`

2. **You'll see:**

```
┌─────────────────────────────────────────────────────────┐
│ Plan: Web App Security Test                     [Edit]   │
│                                                          │
│ Target: example.com                                      │
│ Created: 2025-01-26 10:30 AM                             │
│ Status: Draft                                            │
│                                                          │
│ Attack Sequence (4 attacks):                             │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 1️⃣ Nmap Port Scan                      [Low Risk]   │ │
│ │    Estimated: 2-5 minutes                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 2️⃣ Technology Detection               [Low Risk]   │ │
│ │    Estimated: 1-2 minutes                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 3️⃣ SQL Injection Test                 [Medium Risk]│ │
│ │    Estimated: 5-10 minutes                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 4️⃣ XSS Detection                      [Medium Risk]│ │
│ │    Estimated: 3-5 minutes                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ Total Estimated Duration: 15-20 minutes                  │
│ Overall Risk Level: Medium                               │
│                                                          │
│              [Delete Plan]  [Start Execution]            │
└─────────────────────────────────────────────────────────┘
```

### Starting an Execution

**When you're ready to run the attacks:**

1. Click `[Start Execution]`

2. **Confirmation dialog:**
```
⚠️ Start Execution?

You are about to execute 4 attacks against:
example.com

This will take approximately 15-20 minutes.

Make sure you have authorization to test this target!

[Cancel]  [Yes, Start Execution]
```

3. Click `[Yes, Start Execution]`

4. **Redirected to Execution Monitor** (see next section)

---

## Executions & Monitoring

### What Is an Execution?

An **Execution** is when your attack plan is **actually running**.

### Monitoring Active Executions

**Click** 🚀 **Executions** → **Monitor** in the sidebar.

**You'll see:**

```
┌─────────────────────────────────────────────────────────┐
│ Execution Monitor                    🔄 Auto-refresh: 3s │
│                                                          │
│ ACTIVE EXECUTIONS (2 running)                            │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Execution #123                                      │ │
│ │ Plan: Web App Security Test                         │ │
│ │ Target: example.com                                 │ │
│ │                                                     │ │
│ │ Status: Running  Started: 5 mins ago               │ │
│ │                                                     │ │
│ │ Progress: [████████░░░░░░░░] 50% (2/4 attacks)     │ │
│ │                                                     │ │
│ │ Current: SQL Injection Test (2m 15s)               │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐│ │
│ │ │ Live Logs:                                      ││ │
│ │ │ [10:35:45] Starting SQL injection test...       ││ │
│ │ │ [10:36:02] Testing GET parameter 'id'           ││ │
│ │ │ [10:36:15] Potential SQL injection found!       ││ │
│ │ │ [10:36:30] Confirming vulnerability...          ││ │
│ │ └─────────────────────────────────────────────────┘│ │
│ │                                                     │ │
│ │           [Pause]  [Cancel]  [View Details]         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ COMPLETED EXECUTIONS                                     │
│ ...                                                      │
└─────────────────────────────────────────────────────────┘
```

**Understanding the interface:**

**Status Badges:**
- 🔵 **Queued** (Blue): Waiting to start
- 🔵 **Running** (Blue, pulsing): Currently executing
- 🟢 **Completed** (Green): Finished successfully
- 🔴 **Failed** (Red): Errors occurred
- 🟡 **Cancelled** (Orange): Manually stopped

**Progress Bar:**
- Shows how many attacks completed vs total
- Example: `50% (2/4 attacks)` = 2 done, 2 remaining

**Live Logs:**
- Real-time output from tools
- Auto-scrolls to show latest
- Hover to pause scrolling

**Auto-refresh:**
- Page updates every 3 seconds automatically
- You'll see new logs appear without refreshing

### Viewing Execution Details

**Click** `[View Details]` on any execution.

**Detailed view with tabs:**

```
┌─────────────────────────────────────────────────────────┐
│ Execution #123                                           │
│ ┌──────┬──────┬──────┬─────────┬──────────┐             │
│ │ Over │Attack│ Logs │ Evidence│ Report   │             │
│ │ view │Sequen│      │         │          │             │
│ └──────┴──────┴──────┴─────────┴──────────┘             │
│                                                          │
│ [OVERVIEW TAB SHOWN]                                     │
│                                                          │
│ Status: Running                                          │
│ Started: 2025-01-26 10:30:45                             │
│ Duration: 5m 32s                                         │
│ Attacks: 4 total (2 completed, 1 running, 1 queued)     │
│                                                          │
│ Target: example.com                                      │
│ Plan: Web App Security Test                              │
│                                                          │
│ Findings So Far:                                         │
│ • 22 open ports discovered                               │
│ • Technology: Nginx 1.21.3, PHP 8.1                      │
│ • Potential SQL injection in /login (testing...)         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Click different tabs to see:**

**1. OVERVIEW Tab:**
- Execution summary
- Current status
- Key findings

**2. ATTACK SEQUENCE Tab:**
```
┌─────────────────────────────────────────────────────────┐
│ Attack Progress                                          │
│                                                          │
│ ✅ 1. Nmap Port Scan                                    │
│    Completed in 45 seconds                               │
│    Found: 22 open ports                                  │
│                                                          │
│ ✅ 2. Technology Detection                              │
│    Completed in 12 seconds                               │
│    Found: Nginx 1.21.3, PHP 8.1.2                        │
│                                                          │
│ ⏳ 3. SQL Injection Test                                │
│    Running... (2m 15s elapsed)                           │
│    Status: Testing parameter 'id'                        │
│                                                          │
│ ⏸️ 4. XSS Detection                                     │
│    Queued - waiting for #3 to finish                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**3. LOGS Tab:**
```
┌─────────────────────────────────────────────────────────┐
│ Full Execution Logs                    [Download Logs]   │
│                                                          │
│ [10:30:45] === Execution #123 Started ===               │
│ [10:30:46] Target: example.com                           │
│ [10:30:47] Starting Attack #1: Nmap Port Scan            │
│ [10:30:48] Running: nmap -sS -sV example.com             │
│ [10:31:15] Nmap found 22 open ports                      │
│ [10:31:32] Attack #1 completed successfully              │
│ [10:31:33] Starting Attack #2: Technology Detection      │
│ [10:31:34] Running: whatweb example.com                  │
│ [10:31:45] Detected: Nginx 1.21.3, PHP 8.1.2             │
│ [10:31:46] Attack #2 completed successfully              │
│ [10:31:47] Starting Attack #3: SQL Injection Test        │
│ [10:31:48] Running: sqlmap -u "http://example.com/..."   │
│ [10:32:05] Testing parameter: id                         │
│ [10:32:22] Possible SQL injection detected!              │
│ [10:32:45] Confirming with time-based technique...       │
│ ...                                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**4. EVIDENCE Tab:**
```
┌─────────────────────────────────────────────────────────┐
│ Collected Evidence                                       │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📄 nmap_scan_output.txt                             │ │
│ │ Size: 15 KB  •  Collected: 10:31:32                 │ │
│ │                             [Preview]  [Download]   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📊 nmap_results.xml                                 │ │
│ │ Size: 8 KB  •  Collected: 10:31:32                  │ │
│ │                             [Preview]  [Download]   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📷 screenshot_sql_injection.png                     │ │
│ │ Size: 234 KB  •  Collected: 10:33:15                │ │
│ │                             [Preview]  [Download]   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**5. REPORT Tab:**
```
┌─────────────────────────────────────────────────────────┐
│ Generate Report                                          │
│                                                          │
│ ⚠️ Execution must be completed to generate report        │
│                                                          │
│ Current Status: Running (50% complete)                   │
│ Estimated completion: 10 minutes                         │
│                                                          │
│ [Report will be available when execution completes]      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Cancelling an Execution

**If you need to stop an execution:**

1. Click `[Cancel]` button
2. **Confirmation:**
```
⚠️ Cancel Execution?

Are you sure you want to cancel this execution?

Currently running attack will be stopped immediately.
Results collected so far will be saved.

[No, Continue]  [Yes, Cancel]
```
3. Click `[Yes, Cancel]`

**What happens:**
- Current attack stops immediately
- Evidence collected so far is saved
- You can still view results and generate partial report

---

## Evidence Browser

### What Is Evidence?

**Evidence** is proof of what the tools found:
- **Screenshots** of vulnerabilities
- **Log files** from tools
- **Output data** in various formats
- **Proof-of-concept** files

### Accessing Evidence

**Click** 📄 **Evidence** in the sidebar.

**You'll see:**

```
┌─────────────────────────────────────────────────────────┐
│ Evidence Browser                                         │
│                                                          │
│ Filter:  [All Executions ▾]  [All Types ▾]              │
│                                                          │
├──────────┬──────────────┬────────┬──────────┬──────────┤
│ File     │ Execution    │ Type   │ Size     │ Actions  │
├──────────┼──────────────┼────────┼──────────┼──────────┤
│ nmap_    │ Exec #123    │ TXT    │ 15 KB    │ Preview  │
│ scan.txt │ example.com  │        │          │ Download │
├──────────┼──────────────┼────────┼──────────┼──────────┤
│ sql_inj_ │ Exec #123    │ PNG    │ 234 KB   │ Preview  │
│ proof.png│ example.com  │        │          │ Download │
├──────────┼──────────────┼────────┼──────────┼──────────┤
│ vuln_    │ Exec #123    │ JSON   │ 8 KB     │ Preview  │
│ scan.json│ example.com  │        │          │ Download │
└──────────┴──────────────┴────────┴──────────┴──────────┘
```

### Previewing Evidence

**Click** `[Preview]` on any file.

**For images (PNG, JPG):**
```
┌─────────────────────────────────────────────────────────┐
│ Evidence Preview: sql_injection_proof.png       [Close] │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │         [Screenshot of SQL error displayed]         │ │
│ │                                                     │ │
│ │  Error: You have an error in your SQL syntax...    │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ File: sql_injection_proof.png                            │
│ Size: 234 KB                                             │
│ Execution: #123 (example.com)                            │
│ Collected: 2025-01-26 10:33:15                           │
│ Hash: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f            │
│                                                          │
│                           [Download]                     │
└─────────────────────────────────────────────────────────┘
```

**For text files:**
```
┌─────────────────────────────────────────────────────────┐
│ Evidence Preview: nmap_scan.txt                 [Close] │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Starting Nmap 7.94                                  │ │
│ │ Nmap scan report for example.com (93.184.216.34)   │ │
│ │                                                     │ │
│ │ PORT     STATE SERVICE    VERSION                   │ │
│ │ 22/tcp   open  ssh        OpenSSH 8.2              │ │
│ │ 80/tcp   open  http       Nginx 1.21.3             │ │
│ │ 443/tcp  open  ssl/http   Nginx 1.21.3             │ │
│ │                                                     │ │
│ │ OS detection: Linux 5.4.0                           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│                           [Download]                     │
└─────────────────────────────────────────────────────────┘
```

### Downloading Evidence

**Click** `[Download]` to save the file to your computer.

**Browser will download:** `nmap_scan.txt` (or whatever file)

**Use this for:**
- Including in reports
- Further analysis
- Client deliverables

### Filtering Evidence

**By Execution:**
```
[All Executions ▾]
  All Executions
  Execution #123 (example.com)
  Execution #122 (testsite.com)
  Execution #121 (192.168.1.100)
```

**By File Type:**
```
[All Types ▾]
  All Types
  Images (PNG, JPG)
  Text Files (TXT, LOG)
  Data Files (JSON, XML, CSV)
  Screenshots
```

---

## Settings & Whitelist

### Understanding the Whitelist

**The whitelist is CRITICAL for safety.**

**How it works:**
```
┌─────────────────────────────────────────────────────────┐
│                   WHITELIST CHECK                        │
│                                                          │
│  You try to attack: example.com                          │
│                                                          │
│           ↓                                              │
│                                                          │
│  Is example.com in whitelist?                            │
│                                                          │
│     YES ✓                        NO ✗                    │
│     Attack runs                  BLOCKED!                │
│     normally                     Error message           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**⚠️ IMPORTANT**: The system will **REFUSE** to attack anything not whitelisted!

### Managing the Whitelist

**Click** ⚙️ **Settings** → **Whitelist** in sidebar.

**You'll see:**

```
┌─────────────────────────────────────────────────────────┐
│ Scope Whitelist Management             [+ Add Entry]     │
│                                                          │
│ The whitelist defines which targets are authorized for  │
│ testing. Attacks on non-whitelisted targets will be      │
│ blocked by the system.                                   │
│                                                          │
├────────────┬──────────────┬────────────────┬───────────┤
│ Type       │ Value        │ Description    │ Actions   │
├────────────┼──────────────┼────────────────┼───────────┤
│ Domain     │ example.com  │ Test website   │ Edit      │
│            │              │ - authorized   │ Delete    │
├────────────┼──────────────┼────────────────┼───────────┤
│ IP         │ 192.168.1.   │ Internal test  │ Edit      │
│            │ 100          │ server         │ Delete    │
├────────────┼──────────────┼────────────────┼───────────┤
│ CIDR       │ 10.0.0.0/24  │ Test network   │ Edit      │
│            │              │ range          │ Delete    │
└────────────┴──────────────┴────────────────┴───────────┘
```

### Adding to Whitelist

**Step-by-step:**

1. **Click** `[+ Add Entry]`

2. **Fill in the form:**

```
┌─────────────────────────────────────────────────────────┐
│ Add Whitelist Entry                                      │
│                                                          │
│ Entry Type *                                             │
│ ( ) Domain  (✓) IP Address  ( ) CIDR Range              │
│                                                          │
│ Value *                                                  │
│ [ example.com                           ]                │
│                                                          │
│ Description *                                            │
│ [ Test website - written authorization received  ]       │
│                                                          │
│              [Cancel]  [Add to Whitelist]                │
└─────────────────────────────────────────────────────────┘
```

**Entry Types:**

**a) Domain**
- For websites
- Examples:
  - `example.com`
  - `testsite.com`
  - `*.example.com` (all subdomains)

**b) IP Address**
- For specific servers
- Examples:
  - `192.168.1.100`
  - `10.0.0.50`
  - `203.0.113.45`

**c) CIDR Range**
- For network ranges
- Examples:
  - `192.168.1.0/24` (192.168.1.1 to 192.168.1.254)
  - `10.0.0.0/16` (all 10.0.x.x addresses)
  - `172.16.0.0/12` (internal network)

3. **Click** `[Add to Whitelist]`

4. **Success!**
```
✓ Entry added to whitelist successfully
```

### Editing Whitelist Entries

1. Click `[Edit]` next to entry
2. Modify value or description
3. Click `[Update]`

### Deleting Whitelist Entries

1. Click `[Delete]` next to entry
2. **Confirmation:**
```
⚠️ Delete Whitelist Entry?

Are you sure you want to remove example.com from the whitelist?

This will prevent all attacks against this target!

[Cancel]  [Yes, Delete]
```
3. Click `[Yes, Delete]`

**⚠️ WARNING**: Deleting a whitelist entry will **BLOCK** all future attacks on that target!

---

## Common Workflows

### Workflow 1: Quick Website Security Test

**Goal:** Test a website for common vulnerabilities

**Steps:**

1. **Add to whitelist** (Settings → Whitelist → Add Entry)
   ```
   Type: Domain
   Value: example.com
   Description: Test website - authorized
   ```

2. **Create target** (Targets → New Target)
   ```
   Name: Example Website
   URL: https://example.com
   Scope: In Scope
   Risk: Medium
   ✓ Owner approval
   ```

3. **Create AI plan** (Plans → New Plan)
   ```
   Target: Example Website
   Description: "Scan for common web vulnerabilities"
   Click: Generate Plan with AI
   ```

4. **Review and start**
   ```
   Review AI's attack sequence
   Click: Create Plan
   Click: Start Execution
   ```

5. **Monitor progress** (Executions → Monitor)
   ```
   Watch live logs
   Wait for completion (10-30 minutes)
   ```

6. **Generate report**
   ```
   Click execution
   Go to Report tab
   Generate PDF
   Download and review
   ```

**Done!** You have a professional pentest report.

### Workflow 2: Deep Network Penetration Test

**Goal:** Comprehensive network security assessment

**Steps:**

1. **Whitelist network range**
   ```
   Type: CIDR
   Value: 192.168.1.0/24
   Description: Internal network - authorized
   ```

2. **Create target**
   ```
   Name: Internal Network
   URL: 192.168.1.0/24
   Scope: In Scope
   Risk: High
   ```

3. **Manual attack plan**
   ```
   Select:
   ✓ Nmap Full Port Scan
   ✓ Service Version Detection
   ✓ Vulnerability Scan
   ✓ Exploit Search
   ✓ Brute Force (if authorized)
   ```

4. **Execute and monitor**
   ```
   Start execution
   Monitor for several hours
   Check findings as they come in
   ```

5. **Review evidence**
   ```
   Browse Evidence page
   Download important findings
   Organize for client delivery
   ```

### Workflow 3: Continuous Security Scanning

**Goal:** Regular automated scans of your infrastructure

**Steps:**

1. **Set up targets** (one-time)
   ```
   Add all authorized systems
   Whitelist all domains/IPs
   ```

2. **Create standard plans** (one-time)
   ```
   Plan 1: Weekly Quick Scan
   Plan 2: Monthly Deep Scan
   Plan 3: Critical Systems Daily
   ```

3. **Use API for automation** (advanced)
   ```bash
   # Schedule via cron
   0 2 * * * curl -X POST http://localhost:8000/plans/1/execute \
     -H "Authorization: Bearer $TOKEN"
   ```

4. **Review dashboards daily**
   ```
   Check for new vulnerabilities
   Download reports
   Track trends over time
   ```

---

## Tips & Tricks

### Dashboard Pro Tips

**1. Use keyboard shortcuts:**
- `Ctrl + K`: Quick search (if implemented)
- `Escape`: Close modals/dialogs

**2. Watch the resource gauges:**
- If CPU hits 90%+, slow down (reduce concurrent attacks)
- If Memory is high, wait for current executions to finish

**3. Live feed is your friend:**
- Hover to pause and read details
- Look for warning symbols (⚠)
- Green checkmarks (✓) mean progress

**4. Color meanings:**
- **Green**: Good, success, healthy
- **Cyan/Blue**: Info, running, neutral
- **Orange**: Warning, medium risk
- **Red**: Error, critical, danger

### Target Management Tips

**1. Use descriptive names:**
- ❌ Bad: "Target 1", "Test"
- ✅ Good: "Company E-commerce Site", "Staging API Server"

**2. Add detailed descriptions:**
```
Good description:
"Production customer portal - Test only on weekends after 6 PM.
Contact: security@company.com if issues arise.
Authorization: Pentest agreement #2025-001"
```

**3. Set appropriate risk tolerance:**
- **Production systems**: Low or Medium
- **Staging/Test**: Medium or High
- **Internal lab**: High

### Attack Planning Tips

**1. AI descriptions work best when specific:**
- ❌ Bad: "test the site"
- ✅ Good: "Scan for SQL injection in login form and search functionality"

**2. Start small:**
- First plan: Just reconnaissance
- Second plan: Vulnerability scanning
- Third plan: Active exploitation

**3. Check AI reasoning:**
- AI explains why it chose each attack
- If it doesn't make sense, regenerate

### Execution Monitoring Tips

**1. Check logs for errors early:**
- First 30 seconds often show config issues
- Fix and restart rather than wait for failure

**2. Cancel if needed:**
- Don't waste time on stuck executions
- You keep evidence collected so far

**3. Download logs immediately:**
- Evidence can be deleted to save space
- Download important findings right away

### Evidence Management Tips

**1. Organize by execution:**
- Use the filter: "Execution #123"
- Download all at once for that test

**2. Screenshot proof:**
- Most valuable evidence
- Include in client reports

**3. Check file hashes:**
- Proves evidence integrity
- Important for legal/compliance

---

## Troubleshooting

### Problem 1: Can't Login

**Symptoms:**
- "Invalid credentials" error
- Login button does nothing

**Solutions:**

1. **Check default password:**
   ```
   Username: admin
   Password: Admin@2025!Secure
   ```

2. **Verify in .env file:**
   ```bash
   cat .env | grep ADMIN_PASSWORD
   ```

3. **Reset password:**
   ```bash
   # Edit .env
   nano .env

   # Change ADMIN_PASSWORD
   ADMIN_PASSWORD=YourNewPassword123!

   # Restart services
   docker-compose restart control_plane
   ```

### Problem 2: "Target not in whitelist" Error

**Symptoms:**
```
❌ Error: Target not in authorized whitelist
Attack execution blocked
```

**Solution:**

1. Go to **Settings → Whitelist**
2. Click `[+ Add Entry]`
3. Add your target domain/IP
4. Try execution again

### Problem 3: Execution Stuck at "Running"

**Symptoms:**
- Progress bar not moving
- No new logs for 5+ minutes
- Status stuck at "Running"

**Solutions:**

1. **Check backend logs:**
   ```bash
   docker-compose logs -f celery_worker
   ```

2. **Restart worker:**
   ```bash
   docker-compose restart celery_worker
   ```

3. **Cancel and retry:**
   - Click `[Cancel]` on execution
   - Create new execution of same plan

### Problem 4: Control Plane Shows "Offline"

**Symptoms:**
- Red "Offline" badge
- Can't create targets/plans

**Solutions:**

1. **Check Docker:**
   ```bash
   docker-compose ps control_plane
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f control_plane
   ```

3. **Restart service:**
   ```bash
   docker-compose restart control_plane
   ```

### Problem 5: Reports Not Generating

**Symptoms:**
- "Generate Report" button does nothing
- Error when clicking download

**Solutions:**

1. **Wait for execution to complete:**
   - Reports only work on completed executions
   - Check status is "Completed" (green)

2. **Check reporting service:**
   ```bash
   docker-compose ps reporting_plane
   docker-compose logs -f reporting_plane
   ```

3. **Retry generation:**
   - Wait 30 seconds
   - Click "Generate Report" again

### Problem 6: Slow Performance

**Symptoms:**
- Dashboard takes long to load
- Executions very slow
- Browser freezes

**Solutions:**

1. **Check resource usage:**
   - Look at CPU/Memory gauges on dashboard
   - If over 90%, wait for executions to finish

2. **Reduce concurrent attacks:**
   ```bash
   # Edit docker-compose.yml
   # Change CELERY_WORKER_CONCURRENCY from 4 to 2
   docker-compose restart celery_worker
   ```

3. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear cache and cookies
   - Refresh page

### Problem 7: AI Not Generating Plans

**Symptoms:**
- "Generate Plan" button spins forever
- Error: "AI service unavailable"

**Solutions:**

1. **Check API key:**
   ```bash
   docker-compose exec intelligence_plane env | grep CLAUDE_API_KEY
   ```

2. **Verify in .env:**
   ```bash
   cat .env | grep CLAUDE_API_KEY
   ```

3. **Restart intelligence plane:**
   ```bash
   docker-compose restart intelligence_plane
   ```

4. **Check logs:**
   ```bash
   docker-compose logs -f intelligence_plane
   ```

---

## Quick Reference

### Port Reference

| Service | Port | URL |
|---------|------|-----|
| Web Dashboard | 3000 | http://localhost:3000 |
| Control Plane API | 8000 | http://localhost:8000/docs |
| Intelligence Plane | 5000 | http://localhost:5000/docs |
| Reporting Plane | 6000 | http://localhost:6000/docs |

### Status Badge Colors

| Color | Meaning |
|-------|---------|
| 🟢 Green | Completed, Healthy, Success |
| 🔵 Blue | Running, Active, Info |
| 🟡 Orange | Pending, Warning |
| 🔴 Red | Failed, Error, Critical |

### Risk Level Colors

| Badge | Risk | When to Use |
|-------|------|-------------|
| 🟢 Low | Safe scanning | Port scans, passive recon |
| 🟡 Medium | Standard tests | SQL injection, XSS tests |
| 🟠 High | Aggressive | Password attacks, fuzzing |
| 🔴 Critical | Very aggressive | Active exploitation |

### File Type Icons

| Icon | Type | Examples |
|------|------|----------|
| 📄 | Text | .txt, .log, .md |
| 📊 | Data | .json, .xml, .csv |
| 📷 | Image | .png, .jpg, .jpeg |
| 📦 | Archive | .zip, .tar, .gz |

---

## Need More Help?

### Documentation

- **Installation Guide**: See [KALI_INSTALL.md](KALI_INSTALL.md)
- **Usage Guide**: See [USAGE_GUIDE.md](USAGE_GUIDE.md)
- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)

### API Documentation

- Control Plane: http://localhost:8000/docs
- Intelligence Plane: http://localhost:5000/docs
- Reporting Plane: http://localhost:6000/docs

### Support

- **GitHub Issues**: https://github.com/Pavankumar77theblaster/AOPTool/issues
- **Discussions**: https://github.com/Pavankumar77theblaster/AOPTool/discussions

---

**Remember: ALWAYS get written authorization before testing any system!** 🔐

[⬆ Back to Top](#aoptool-web-dashboard---complete-user-guide)
