-- AOPTool - Attack Definitions
-- Comprehensive pentesting attack library covering OWASP Top 10 and common techniques

-- Clear existing attacks (if re-running)
TRUNCATE TABLE attacks RESTART IDENTITY CASCADE;

-- ================================
-- RECONNAISSANCE ATTACKS
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('Port Scan - Quick', 'Quick TCP port scan of common ports', 'reconnaissance', 'any', 'low', 'nmap', 'nmap -F {target}', '[]', 'Open ports list', true),
('Port Scan - Full', 'Comprehensive TCP port scan (all 65535 ports)', 'reconnaissance', 'any', 'low', 'nmap', 'nmap -p- {target}', '[]', 'Complete port enumeration', true),
('Service Detection', 'Detect services and versions on open ports', 'reconnaissance', 'any', 'low', 'nmap', 'nmap -sV {target}', '[]', 'Service versions', true),
('OS Detection', 'Identify target operating system', 'reconnaissance', 'any', 'low', 'nmap', 'nmap -O {target}', '[]', 'OS fingerprint', true),
('DNS Enumeration', 'Enumerate DNS records', 'reconnaissance', 'domain', 'low', 'nmap', 'nmap -sn --script dns-brute {target}', '[]', 'DNS records', true),
('SSL/TLS Scan', 'Scan SSL/TLS configuration and certificates', 'reconnaissance', 'web_app', 'low', 'nmap', 'nmap --script ssl-enum-ciphers -p 443 {target}', '[]', 'SSL/TLS details', true),
('Subdomain Enumeration', 'Find subdomains of target domain', 'reconnaissance', 'domain', 'low', 'subfinder', 'subfinder -d {target}', '[]', 'Subdomain list', true),
('Web Technology Detection', 'Identify web technologies in use', 'reconnaissance', 'web_app', 'low', 'whatweb', 'whatweb {url}', '[]', 'Technology stack', true);

-- ================================
-- WEB APPLICATION ATTACKS
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('Directory Brute Force', 'Discover hidden directories and files', 'web_enumeration', 'web_app', 'low', 'ffuf', 'ffuf -u {url}/FUZZ -w /wordlists/common.txt', '[]', 'Hidden paths', true),
('Web Crawler', 'Crawl website to map all pages', 'web_enumeration', 'web_app', 'low', 'gospider', 'gospider -s {url} -d 3', '[]', 'Site map', true),
('Nikto Web Scan', 'Comprehensive web server vulnerability scan', 'vulnerability_scanning', 'web_app', 'medium', 'nikto', 'nikto -h {url}', '[]', 'Web vulnerabilities', true),
('SQL Injection Test', 'Test for SQL injection vulnerabilities', 'injection', 'web_app', 'high', 'sqlmap', 'sqlmap -u {url} --batch --level=1 --risk=1', '[]', 'SQL injection points', true),
('XSS Scanner', 'Scan for Cross-Site Scripting vulnerabilities', 'injection', 'web_app', 'medium', 'xsstrike', 'xsstrike -u {url}', '[]', 'XSS vulnerabilities', true),
('CORS Misconfiguration', 'Test for CORS policy issues', 'misconfiguration', 'web_app', 'medium', 'curl', 'curl -H "Origin: https://evil.com" -I {url}', '[]', 'CORS headers', true),
('Security Headers Check', 'Check for missing security headers', 'misconfiguration', 'web_app', 'low', 'curl', 'curl -I {url}', '[]', 'HTTP headers', true);

-- ================================
-- INJECTION ATTACKS
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('Command Injection Test', 'Test for OS command injection', 'injection', 'web_app', 'high', 'commix', 'commix --url={url}', '[]', 'Command injection points', true),
('LDAP Injection Test', 'Test for LDAP injection vulnerabilities', 'injection', 'web_app', 'high', 'custom', 'python /tools/ldap_inject.py {url}', '[]', 'LDAP injection results', true),
('XXE Attack Test', 'Test for XML External Entity vulnerabilities', 'injection', 'web_app', 'high', 'custom', 'python /tools/xxe_test.py {url}', '[]', 'XXE vulnerabilities', true),
('Template Injection', 'Test for Server-Side Template Injection', 'injection', 'web_app', 'high', 'tplmap', 'tplmap -u {url}', '[]', 'SSTI vulnerabilities', true);

-- ================================
-- AUTHENTICATION & SESSION
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('Password Brute Force', 'Brute force authentication', 'brute_force', 'web_app', 'medium', 'hydra', 'hydra -L /wordlists/users.txt -P /wordlists/passwords.txt {target} http-post-form', '[]', 'Valid credentials', true),
('Session Fixation Test', 'Test for session fixation vulnerabilities', 'authentication', 'web_app', 'medium', 'custom', 'python /tools/session_test.py {url}', '[]', 'Session issues', true),
('JWT Security Test', 'Test JWT token security', 'authentication', 'web_app', 'medium', 'jwt_tool', 'jwt_tool {token}', '[]', 'JWT vulnerabilities', true),
('Cookie Security Test', 'Check cookie security attributes', 'authentication', 'web_app', 'low', 'curl', 'curl -c cookies.txt {url}', '[]', 'Cookie attributes', true);

-- ================================
-- API SECURITY
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('API Endpoint Discovery', 'Discover API endpoints', 'api_testing', 'api', 'low', 'ffuf', 'ffuf -u {url}/api/FUZZ -w /wordlists/api-endpoints.txt', '[]', 'API endpoints', true),
('REST API Fuzzing', 'Fuzz REST API parameters', 'api_testing', 'api', 'medium', 'ffuf', 'ffuf -u {url} -w /wordlists/params.txt', '[]', 'API vulnerabilities', true),
('GraphQL Introspection', 'Query GraphQL schema', 'api_testing', 'api', 'low', 'graphql-cop', 'graphql-cop -t {url}/graphql', '[]', 'GraphQL schema', true),
('API Rate Limit Test', 'Test API rate limiting', 'api_testing', 'api', 'low', 'custom', 'python /tools/rate_limit_test.py {url}', '[]', 'Rate limit config', true);

-- ================================
-- ACCESS CONTROL
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('IDOR Test', 'Test for Insecure Direct Object References', 'access_control', 'web_app', 'high', 'custom', 'python /tools/idor_test.py {url}', '[]', 'IDOR vulnerabilities', true),
('Path Traversal Test', 'Test for directory traversal vulnerabilities', 'access_control', 'web_app', 'high', 'ffuf', 'ffuf -u {url}?file=FUZZ -w /wordlists/lfi.txt', '[]', 'Path traversal', true),
('Privilege Escalation Test', 'Test for horizontal/vertical privilege escalation', 'access_control', 'web_app', 'high', 'custom', 'python /tools/privesc_test.py {url}', '[]', 'Privilege issues', true),
('Forced Browsing', 'Test for unprotected admin pages', 'access_control', 'web_app', 'medium', 'ffuf', 'ffuf -u {url}/FUZZ -w /wordlists/admin-panels.txt', '[]', 'Unprotected pages', true);

-- ================================
-- WORDPRESS SPECIFIC
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('WordPress Scan', 'Comprehensive WordPress security scan', 'cms_testing', 'web_app', 'medium', 'wpscan', 'wpscan --url {url} --enumerate p,t,u', '[]', 'WP vulnerabilities', true),
('WordPress Plugin Enumeration', 'Enumerate WordPress plugins', 'cms_testing', 'web_app', 'low', 'wpscan', 'wpscan --url {url} --enumerate p', '[]', 'Plugin list', true),
('WordPress User Enumeration', 'Enumerate WordPress users', 'cms_testing', 'web_app', 'low', 'wpscan', 'wpscan --url {url} --enumerate u', '[]', 'User list', true),
('WordPress XML-RPC Test', 'Test WordPress XML-RPC vulnerabilities', 'cms_testing', 'web_app', 'medium', 'wpscan', 'wpscan --url {url} --enumerate xmlrpc', '[]', 'XML-RPC issues', true);

-- ================================
-- FILE UPLOAD
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('File Upload Bypass', 'Test file upload restrictions', 'file_upload', 'web_app', 'high', 'custom', 'python /tools/upload_bypass.py {url}', '[]', 'Upload vulnerabilities', true),
('Malicious File Upload', 'Attempt to upload web shell', 'file_upload', 'web_app', 'high', 'custom', 'python /tools/webshell_upload.py {url}', '[]', 'File upload results', true);

-- ================================
-- NETWORK ATTACKS
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('SMB Enumeration', 'Enumerate SMB shares and users', 'network_enumeration', 'network', 'low', 'enum4linux', 'enum4linux {target}', '[]', 'SMB information', true),
('SNMP Enumeration', 'Enumerate SNMP information', 'network_enumeration', 'network', 'low', 'snmpwalk', 'snmpwalk -v2c -c public {target}', '[]', 'SNMP data', true),
('SSH Brute Force', 'Brute force SSH authentication', 'brute_force', 'network', 'medium', 'hydra', 'hydra -L /wordlists/users.txt -P /wordlists/passwords.txt {target} ssh', '[]', 'SSH credentials', true),
('FTP Anonymous Login', 'Test for FTP anonymous access', 'misconfiguration', 'network', 'low', 'nmap', 'nmap --script ftp-anon {target}', '[]', 'FTP access', true);

-- ================================
-- VULNERABILITY SCANNING
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('Nuclei Vulnerability Scan', 'Scan using Nuclei templates', 'vulnerability_scanning', 'any', 'medium', 'nuclei', 'nuclei -u {url} -t /nuclei-templates/', '[]', 'Vulnerabilities', true),
('OpenVAS Scan', 'Comprehensive vulnerability scan', 'vulnerability_scanning', 'any', 'low', 'openvas', 'gvm-cli --gmp-username admin --gmp-password admin socket --socketpath /var/run/gvmd.sock --xml "<create_task><name>Scan {target}</name><target>{target}</target></create_task>"', '[]', 'Vulnerability report', true),
('SSL Vulnerability Scan', 'Scan for SSL/TLS vulnerabilities', 'vulnerability_scanning', 'web_app', 'low', 'sslscan', 'sslscan {target}', '[]', 'SSL issues', true),
('Heartbleed Test', 'Test for Heartbleed vulnerability', 'vulnerability_scanning', 'any', 'high', 'nmap', 'nmap --script ssl-heartbleed {target}', '[]', 'Heartbleed status', true);

-- ================================
-- CLOUD & INFRASTRUCTURE
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('S3 Bucket Enumeration', 'Find and test S3 buckets', 'cloud_security', 'cloud', 'medium', 'aws', 'aws s3 ls s3://{target} --no-sign-request', '[]', 'S3 bucket contents', true),
('Cloud Metadata Access', 'Test for cloud metadata exposure', 'cloud_security', 'cloud', 'high', 'curl', 'curl http://169.254.169.254/latest/meta-data/', '[]', 'Metadata', true),
('Docker API Exposure', 'Test for exposed Docker API', 'misconfiguration', 'network', 'high', 'curl', 'curl http://{target}:2375/containers/json', '[]', 'Docker containers', true);

-- ================================
-- BUSINESS LOGIC
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('Race Condition Test', 'Test for race condition vulnerabilities', 'business_logic', 'web_app', 'high', 'custom', 'python /tools/race_condition.py {url}', '[]', 'Race conditions', true),
('Payment Logic Test', 'Test payment workflow security', 'business_logic', 'web_app', 'high', 'custom', 'python /tools/payment_test.py {url}', '[]', 'Payment issues', true),
('Coupon/Voucher Abuse', 'Test for coupon code vulnerabilities', 'business_logic', 'web_app', 'medium', 'custom', 'python /tools/coupon_test.py {url}', '[]', 'Coupon abuse', true);

-- ================================
-- MOBILE & API
-- ================================

INSERT INTO attacks (name, description, category, target_type, risk_level, tool_name, command_template, prerequisites, expected_output, enabled) VALUES
('Mobile App API Test', 'Test mobile app backend API security', 'mobile_testing', 'api', 'medium', 'mitmproxy', 'mitmproxy -s /tools/mobile_api_test.py', '[]', 'API issues', true),
('Certificate Pinning Bypass', 'Test for weak certificate pinning', 'mobile_testing', 'mobile', 'medium', 'objection', 'objection -g {app} explore', '[]', 'Pinning status', true);

-- Show summary
SELECT
    category,
    COUNT(*) as count,
    string_agg(DISTINCT risk_level, ', ' ORDER BY risk_level) as risk_levels
FROM attacks
WHERE enabled = true
GROUP BY category
ORDER BY count DESC;

-- Show total count
SELECT COUNT(*) as total_attacks,
       COUNT(CASE WHEN enabled THEN 1 END) as enabled_attacks
FROM attacks;
