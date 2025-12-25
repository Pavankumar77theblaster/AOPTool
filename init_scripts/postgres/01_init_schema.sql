-- AOPTool PostgreSQL Database Schema Initialization
-- This script runs automatically when the PostgreSQL container first starts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- ================================
-- TARGETS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS targets (
    target_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url_or_ip VARCHAR(500) NOT NULL,
    scope VARCHAR(50) CHECK (scope IN ('in_scope', 'out_of_scope')) DEFAULT 'out_of_scope',
    risk_tolerance VARCHAR(50) CHECK (risk_tolerance IN ('low', 'medium', 'high')) DEFAULT 'low',
    owner_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_targets_scope ON targets(scope);
CREATE INDEX idx_targets_approval ON targets(owner_approval);
CREATE INDEX idx_targets_created_at ON targets(created_at DESC);

COMMENT ON TABLE targets IS 'Stores target systems for penetration testing';
COMMENT ON COLUMN targets.scope IS 'Whether target is authorized for testing';
COMMENT ON COLUMN targets.owner_approval IS 'Whether target owner has approved testing';

-- ================================
-- ATTACKS LIBRARY
-- ================================
CREATE TABLE IF NOT EXISTS attacks (
    attack_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100) CHECK (category IN ('recon', 'scanning', 'exploitation', 'post_exploitation')),
    risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    preconditions JSONB DEFAULT '{}'::jsonb,
    execution_script TEXT,
    validation_script TEXT,
    success_rate DECIMAL(5,2) DEFAULT 0.0 CHECK (success_rate >= 0 AND success_rate <= 100),
    avg_execution_time INTEGER DEFAULT 0,  -- in seconds
    total_executions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attacks_category ON attacks(category);
CREATE INDEX idx_attacks_risk ON attacks(risk_level);
CREATE INDEX idx_attacks_success_rate ON attacks(success_rate DESC);
CREATE INDEX idx_attacks_name ON attacks(name);

COMMENT ON TABLE attacks IS 'Library of available attack definitions';
COMMENT ON COLUMN attacks.preconditions IS 'Required conditions for attack (JSON)';
COMMENT ON COLUMN attacks.execution_script IS 'Python/Bash script to execute attack';
COMMENT ON COLUMN attacks.validation_script IS 'Script to validate attack success';

-- ================================
-- ATTACK PLANS
-- ================================
CREATE TABLE IF NOT EXISTS attack_plans (
    plan_id SERIAL PRIMARY KEY,
    target_id INTEGER REFERENCES targets(target_id) ON DELETE CASCADE,
    attack_sequence INTEGER[] NOT NULL,  -- Array of attack IDs
    scheduling VARCHAR(100) CHECK (scheduling IN ('immediate', 'scheduled', 'manual_trigger')) DEFAULT 'manual_trigger',
    max_risk_level VARCHAR(50) CHECK (max_risk_level IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'running', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
);

CREATE INDEX idx_attack_plans_target ON attack_plans(target_id);
CREATE INDEX idx_attack_plans_status ON attack_plans(status);
CREATE INDEX idx_attack_plans_created_at ON attack_plans(created_at DESC);

COMMENT ON TABLE attack_plans IS 'Planned sequences of attacks against targets';
COMMENT ON COLUMN attack_plans.attack_sequence IS 'Ordered list of attack IDs to execute';

-- ================================
-- ATTACK EXECUTIONS
-- ================================
CREATE TABLE IF NOT EXISTS attack_executions (
    execution_id SERIAL PRIMARY KEY,
    attack_id INTEGER REFERENCES attacks(attack_id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES attack_plans(plan_id) ON DELETE CASCADE,
    target_id INTEGER REFERENCES targets(target_id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('queued', 'running', 'completed', 'failed', 'timeout', 'cancelled')) DEFAULT 'queued',
    celery_task_id VARCHAR(255),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTEGER,  -- in seconds
    output TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_executions_attack ON attack_executions(attack_id);
CREATE INDEX idx_executions_plan ON attack_executions(plan_id);
CREATE INDEX idx_executions_target ON attack_executions(target_id);
CREATE INDEX idx_executions_status ON attack_executions(status);
CREATE INDEX idx_executions_celery_task ON attack_executions(celery_task_id);
CREATE INDEX idx_executions_created_at ON attack_executions(created_at DESC);

COMMENT ON TABLE attack_executions IS 'Individual attack execution records';
COMMENT ON COLUMN attack_executions.celery_task_id IS 'Celery task ID for async tracking';

-- ================================
-- EVIDENCE
-- ================================
CREATE TABLE IF NOT EXISTS evidence (
    evidence_id SERIAL PRIMARY KEY,
    execution_id INTEGER REFERENCES attack_executions(execution_id) ON DELETE CASCADE,
    evidence_type VARCHAR(100) CHECK (evidence_type IN ('screenshot', 'log', 'pcap', 'exploit_proof', 'file', 'other')),
    storage_path TEXT NOT NULL,  -- MinIO object path
    file_hash VARCHAR(64) NOT NULL,  -- SHA-256 for integrity
    file_size BIGINT,  -- in bytes
    metadata JSONB DEFAULT '{}'::jsonb,
    validated BOOLEAN DEFAULT FALSE,
    captured_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_evidence_execution ON evidence(execution_id);
CREATE INDEX idx_evidence_type ON evidence(evidence_type);
CREATE INDEX idx_evidence_validated ON evidence(validated);
CREATE INDEX idx_evidence_file_hash ON evidence(file_hash);
CREATE INDEX idx_evidence_captured_at ON evidence(captured_at DESC);

COMMENT ON TABLE evidence IS 'Immutable evidence collected during attacks';
COMMENT ON COLUMN evidence.storage_path IS 'Path to file in MinIO (e.g., s3://bucket/object)';
COMMENT ON COLUMN evidence.file_hash IS 'SHA-256 hash for integrity verification';

-- ================================
-- VALIDATIONS
-- ================================
CREATE TABLE IF NOT EXISTS validations (
    validation_id SERIAL PRIMARY KEY,
    evidence_id INTEGER REFERENCES evidence(evidence_id) ON DELETE CASCADE,
    validated BOOLEAN NOT NULL,
    confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
    proof TEXT,
    indicators_matched TEXT[],
    false_positive BOOLEAN DEFAULT FALSE,
    validated_at TIMESTAMP DEFAULT NOW(),
    validator_version VARCHAR(50)  -- Track which validation algorithm was used
);

CREATE INDEX idx_validations_evidence ON validations(evidence_id);
CREATE INDEX idx_validations_validated ON validations(validated);
CREATE INDEX idx_validations_confidence ON validations(confidence DESC);
CREATE INDEX idx_validations_validated_at ON validations(validated_at DESC);

COMMENT ON TABLE validations IS 'Validation results for collected evidence';
COMMENT ON COLUMN validations.indicators_matched IS 'List of success indicators found in evidence';
COMMENT ON COLUMN validations.validator_version IS 'Version of validation algorithm used';

-- ================================
-- AUDIT LOG
-- ================================
CREATE TABLE IF NOT EXISTS audit_log (
    log_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    target_id INTEGER REFERENCES targets(target_id) ON DELETE SET NULL,
    plan_id INTEGER REFERENCES attack_plans(plan_id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_target ON audit_log(target_id) WHERE target_id IS NOT NULL;
CREATE INDEX idx_audit_plan ON audit_log(plan_id) WHERE plan_id IS NOT NULL;

COMMENT ON TABLE audit_log IS 'Immutable audit trail of all user actions';

-- ================================
-- SCOPE WHITELIST
-- ================================
CREATE TABLE IF NOT EXISTS scope_whitelist (
    whitelist_id SERIAL PRIMARY KEY,
    entry_type VARCHAR(50) CHECK (entry_type IN ('cidr', 'domain', 'ip')) NOT NULL,
    value VARCHAR(500) NOT NULL,
    description TEXT,
    added_by VARCHAR(255),
    added_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_whitelist_unique ON scope_whitelist(entry_type, value);
CREATE INDEX idx_whitelist_type ON scope_whitelist(entry_type);

COMMENT ON TABLE scope_whitelist IS 'Authorized targets for penetration testing';
COMMENT ON COLUMN scope_whitelist.entry_type IS 'Type of entry (CIDR range, domain, or single IP)';

-- ================================
-- TRIGGERS FOR UPDATED_AT
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_targets_updated_at
    BEFORE UPDATE ON targets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attacks_updated_at
    BEFORE UPDATE ON attacks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- INSERT INITIAL DATA
-- ================================

-- Insert sample attacks (these will be expanded by AI later)
INSERT INTO attacks (name, description, category, risk_level, execution_script, validation_script, success_rate) VALUES
('Nmap Port Scan', 'Basic TCP port scan to identify open ports and services', 'recon', 'low',
 'nmap -sV -T4 {target}',
 'check_open_ports(output)',
 95.0),

('Nmap Service Version Detection', 'Detailed service version detection on discovered ports', 'scanning', 'low',
 'nmap -sV -sC -A {target}',
 'check_service_versions(output)',
 90.0),

('Nuclei CVE Scan', 'Scan for known CVEs using Nuclei templates', 'scanning', 'medium',
 'nuclei -u {target} -t cves/ -json',
 'check_for_vulnerabilities(output)',
 75.0),

('SQLMap Basic Scan', 'Automated SQL injection detection and exploitation', 'exploitation', 'high',
 'sqlmap -u {target} --batch --level=1 --risk=1',
 'validate_sql_injection(output)',
 65.0),

('Gobuster Directory Enumeration', 'Brute force discovery of hidden directories and files', 'recon', 'low',
 'gobuster dir -u {target} -w /wordlists/common.txt',
 'check_discovered_paths(output)',
 80.0)

ON CONFLICT (name) DO NOTHING;

-- Insert sample scope whitelist entries (localhost for testing)
INSERT INTO scope_whitelist (entry_type, value, description, added_by) VALUES
('ip', '127.0.0.1', 'Localhost for testing', 'system'),
('domain', 'localhost', 'Localhost domain for testing', 'system'),
('cidr', '172.17.0.0/16', 'Docker bridge network', 'system')
ON CONFLICT DO NOTHING;

-- ================================
-- VIEWS FOR COMMON QUERIES
-- ================================

CREATE OR REPLACE VIEW active_attack_plans AS
SELECT
    ap.plan_id,
    ap.target_id,
    t.name AS target_name,
    t.url_or_ip,
    ap.status,
    ap.max_risk_level,
    ap.created_at,
    ap.approved_by,
    COUNT(ae.execution_id) AS total_executions,
    COUNT(CASE WHEN ae.status = 'completed' THEN 1 END) AS completed_executions,
    COUNT(CASE WHEN ae.status = 'failed' THEN 1 END) AS failed_executions
FROM attack_plans ap
JOIN targets t ON ap.target_id = t.target_id
LEFT JOIN attack_executions ae ON ap.plan_id = ae.plan_id
WHERE ap.status IN ('approved', 'running')
GROUP BY ap.plan_id, t.name, t.url_or_ip;

COMMENT ON VIEW active_attack_plans IS 'Currently active attack plans with execution statistics';

-- ================================
-- FUNCTIONS FOR STATISTICS
-- ================================

CREATE OR REPLACE FUNCTION get_attack_success_rate(p_attack_id INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    total_count INTEGER;
    success_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM attack_executions ae
    JOIN validations v ON ae.execution_id IN (
        SELECT execution_id FROM evidence WHERE evidence_id = v.evidence_id
    )
    WHERE ae.attack_id = p_attack_id;

    IF total_count = 0 THEN
        RETURN 0.0;
    END IF;

    SELECT COUNT(*) INTO success_count
    FROM attack_executions ae
    JOIN evidence e ON ae.execution_id = e.execution_id
    JOIN validations v ON e.evidence_id = v.evidence_id
    WHERE ae.attack_id = p_attack_id AND v.validated = TRUE;

    RETURN (success_count::DECIMAL / total_count::DECIMAL * 100.0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_attack_success_rate IS 'Calculate actual success rate for an attack based on validations';

-- ================================
-- MLFLOW DATABASE (for ML experiment tracking)
-- ================================

CREATE DATABASE mlflow;

-- ================================
-- COMPLETION MESSAGE
-- ================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'AOPTool Database Schema Initialized';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database: aoptool';
    RAISE NOTICE 'Tables Created: 8';
    RAISE NOTICE 'Sample Data: 5 attacks, 3 scope entries';
    RAISE NOTICE 'Views: 1';
    RAISE NOTICE 'Functions: 1';
    RAISE NOTICE '========================================';
END $$;
