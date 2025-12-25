// AOPTool MongoDB Initialization Script
// This script runs automatically when the MongoDB container first starts

// Use AOPTool database
db = db.getSiblingDB('aoptool');

print('========================================');
print('Initializing AOPTool MongoDB Database');
print('========================================');

// ================================
// ATTACK_MEMORY COLLECTION
// ================================
db.createCollection('attack_memory', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['attack_id', 'attack_name', 'category'],
            properties: {
                attack_id: {
                    bsonType: 'int',
                    description: 'Reference to attack in PostgreSQL'
                },
                attack_name: {
                    bsonType: 'string',
                    description: 'Name of the attack'
                },
                category: {
                    bsonType: 'string',
                    enum: ['recon', 'scanning', 'exploitation', 'post_exploitation'],
                    description: 'Attack category'
                },
                risk_level: {
                    bsonType: 'string',
                    enum: ['low', 'medium', 'high', 'critical']
                },
                target_contexts: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'object',
                        required: ['context_id', 'tech_stack', 'outcomes'],
                        properties: {
                            context_id: { bsonType: 'string' },
                            tech_stack: { bsonType: 'array' },
                            security_measures: { bsonType: 'array' },
                            target_type: { bsonType: 'string' },
                            outcomes: { bsonType: 'array' },
                            success_rate: { bsonType: 'double' },
                            total_attempts: { bsonType: 'int' }
                        }
                    }
                },
                global_stats: {
                    bsonType: 'object',
                    properties: {
                        total_executions: { bsonType: 'int' },
                        total_successes: { bsonType: 'int' },
                        overall_success_rate: { bsonType: 'double' },
                        avg_confidence_error: { bsonType: 'double' }
                    }
                },
                learning_insights: {
                    bsonType: 'object',
                    properties: {
                        effective_techniques: { bsonType: 'array' },
                        ineffective_techniques: { bsonType: 'array' },
                        recommended_preconditions: { bsonType: 'array' }
                    }
                },
                last_updated: { bsonType: 'date' },
                model_version: { bsonType: 'string' }
            }
        }
    }
});

// Create indexes for attack_memory
db.attack_memory.createIndex({ 'attack_id': 1 }, { unique: true });
db.attack_memory.createIndex({ 'attack_name': 1 });
db.attack_memory.createIndex({ 'category': 1 });
db.attack_memory.createIndex({ 'global_stats.overall_success_rate': -1 });
db.attack_memory.createIndex({ 'last_updated': -1 });

print('✓ Created collection: attack_memory');

// ================================
// TRAINING_RESOURCES COLLECTION
// ================================
db.createCollection('training_resources', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['resource_id', 'resource_type', 'file_path'],
            properties: {
                resource_id: { bsonType: 'string' },
                resource_type: {
                    bsonType: 'string',
                    enum: ['text', 'image', 'pdf', 'video']
                },
                file_path: { bsonType: 'string' },
                category: { bsonType: 'string' },
                subcategory: { bsonType: 'string' },
                ingested_at: { bsonType: 'date' },
                processed_at: { bsonType: 'date' },
                extraction: {
                    bsonType: 'object',
                    properties: {
                        attacks_generated: { bsonType: 'array' },
                        key_techniques: { bsonType: 'array' },
                        success_indicators: { bsonType: 'array' }
                    }
                },
                quality_score: { bsonType: 'double' },
                usage_count: { bsonType: 'int' },
                last_used: { bsonType: 'date' }
            }
        }
    }
});

db.training_resources.createIndex({ 'resource_id': 1 }, { unique: true });
db.training_resources.createIndex({ 'resource_type': 1 });
db.training_resources.createIndex({ 'category': 1, 'subcategory': 1 });
db.training_resources.createIndex({ 'quality_score': -1 });
db.training_resources.createIndex({ 'ingested_at': -1 });

print('✓ Created collection: training_resources');

// ================================
// MODEL_VERSIONS COLLECTION
// ================================
db.createCollection('model_versions', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['version', 'model_type', 'deployed_at'],
            properties: {
                version: { bsonType: 'string' },
                model_type: {
                    bsonType: 'string',
                    enum: ['confidence_predictor', 'attack_selector', 'context_analyzer']
                },
                deployed_at: { bsonType: 'date' },
                training_data: { bsonType: 'object' },
                performance_metrics: { bsonType: 'object' },
                improvements_over_previous: { bsonType: 'object' },
                model_file_path: { bsonType: 'string' },
                rollback_to: { bsonType: 'string' },
                a_b_test_results: { bsonType: 'object' }
            }
        }
    }
});

db.model_versions.createIndex({ 'version': 1, 'model_type': 1 }, { unique: true });
db.model_versions.createIndex({ 'model_type': 1, 'deployed_at': -1 });

print('✓ Created collection: model_versions');

// ================================
// INSERT SAMPLE DATA
// ================================

// Sample attack memory entry
db.attack_memory.insertOne({
    attack_id: 1,
    attack_name: 'Nmap Port Scan',
    category: 'recon',
    risk_level: 'low',
    target_contexts: [
        {
            context_id: 'ctx_default',
            tech_stack: ['unknown'],
            security_measures: [],
            target_type: 'generic',
            outcomes: [],
            success_rate: 0.0,
            total_attempts: 0
        }
    ],
    global_stats: {
        total_executions: 0,
        total_successes: 0,
        overall_success_rate: 0.0,
        avg_confidence_error: 0.0
    },
    learning_insights: {
        effective_techniques: [],
        ineffective_techniques: [],
        recommended_preconditions: []
    },
    last_updated: new Date(),
    model_version: 'v1.0'
});

print('✓ Inserted sample data into attack_memory');

// Sample model version
db.model_versions.insertOne({
    version: 'v1.0',
    model_type: 'confidence_predictor',
    deployed_at: new Date(),
    training_data: {
        total_samples: 0,
        training_samples: 0,
        validation_samples: 0,
        data_date_range: {
            start: new Date('2025-01-01'),
            end: new Date()
        }
    },
    performance_metrics: {
        accuracy: 0.0,
        precision: 0.0,
        recall: 0.0,
        f1_score: 0.0,
        mean_confidence_error: 0.0
    },
    improvements_over_previous: {
        accuracy_delta: 0.0,
        confidence_error_delta: 0.0
    },
    model_file_path: '/models/confidence_predictor_v1.0.pkl',
    rollback_to: null,
    a_b_test_results: {}
});

print('✓ Inserted initial model version');

// ================================
// CREATE HELPER FUNCTIONS
// ================================

// Note: MongoDB doesn't have stored procedures like PostgreSQL,
// but we can create helper functions in application code

print('========================================');
print('MongoDB Initialization Complete');
print('========================================');
print('Database: aoptool');
print('Collections Created: 3');
print('  - attack_memory (with indexes)');
print('  - training_resources (with indexes)');
print('  - model_versions (with indexes)');
print('Sample Data: 2 documents inserted');
print('========================================');
