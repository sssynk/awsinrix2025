require('dotenv').config();
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false // AWS RDS requires SSL
    }
});

// Test connection
pool.on('connect', () => {
    console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Initialize database schema
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create connections table (master list of all possible connections)
        await client.query(`
            CREATE TABLE IF NOT EXISTS connections (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                display_name VARCHAR(100) NOT NULL,
                category VARCHAR(20) NOT NULL,
                auth_type VARCHAR(20) NOT NULL,
                description TEXT,
                icon_url TEXT,
                oauth_authorize_url TEXT,
                oauth_token_url TEXT,
                oauth_scopes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create user_connections table (stores user-specific OAuth tokens)
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_connections (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                connection_id INTEGER REFERENCES connections(id) ON DELETE CASCADE,
                access_token TEXT NOT NULL,
                refresh_token TEXT,
                token_expires_at TIMESTAMP,
                oauth_state VARCHAR(255),
                additional_data JSONB,
                enabled BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, connection_id)
            )
        `);

        // Create index for faster lookups
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_connections_user_id 
            ON user_connections(user_id)
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_user_connections_enabled 
            ON user_connections(user_id, enabled)
        `);

        await client.query('COMMIT');
        console.log('✓ Database schema initialized successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error initializing database:', err);
        throw err;
    } finally {
        client.release();
    }
}

// Seed connections data
async function seedConnections() {
    const client = await pool.connect();
    try {
        const connections = [
            // Database Connections
            {
                name: 'neon',
                display_name: 'Neon',
                category: 'database',
                auth_type: 'api_key',
                description: 'Serverless PostgreSQL database',
                oauth_authorize_url: null,
                oauth_token_url: null,
                oauth_scopes: null
            },
            {
                name: 'postgres',
                display_name: 'PostgreSQL',
                category: 'database',
                auth_type: 'connection_string',
                description: 'PostgreSQL database connection',
                oauth_authorize_url: null,
                oauth_token_url: null,
                oauth_scopes: null
            },
            // CRM Connections
            {
                name: 'github',
                display_name: 'GitHub',
                category: 'code',
                auth_type: 'oauth2',
                description: 'Code repository and project management',
                oauth_authorize_url: 'https://github.com/login/oauth/authorize',
                oauth_token_url: 'https://github.com/login/oauth/access_token',
                oauth_scopes: 'repo,user,read:org'
            },
            {
                name: 'linear',
                display_name: 'Linear',
                category: 'crm',
                auth_type: 'oauth2',
                description: 'Issue tracking and project management',
                oauth_authorize_url: 'https://linear.app/oauth/authorize',
                oauth_token_url: 'https://api.linear.app/oauth/token',
                oauth_scopes: 'read,write'
            },
            {
                name: 'asana',
                display_name: 'Asana',
                category: 'crm',
                auth_type: 'oauth2',
                description: 'Work management platform',
                oauth_authorize_url: 'https://app.asana.com/-/oauth_authorize',
                oauth_token_url: 'https://app.asana.com/-/oauth_token',
                oauth_scopes: 'default'
            },
            {
                name: 'trello',
                display_name: 'Trello',
                category: 'crm',
                auth_type: 'oauth1',
                description: 'Visual project management',
                oauth_authorize_url: 'https://trello.com/1/authorize',
                oauth_token_url: 'https://trello.com/1/OAuthGetAccessToken',
                oauth_scopes: 'read,write'
            },
            {
                name: 'jira',
                display_name: 'Jira',
                category: 'crm',
                auth_type: 'oauth2',
                description: 'Issue and project tracking',
                oauth_authorize_url: 'https://auth.atlassian.com/authorize',
                oauth_token_url: 'https://auth.atlassian.com/oauth/token',
                oauth_scopes: 'read:jira-work write:jira-work'
            },
            {
                name: 'hubspot',
                display_name: 'HubSpot',
                category: 'crm',
                auth_type: 'oauth2',
                description: 'CRM and marketing platform',
                oauth_authorize_url: 'https://app.hubspot.com/oauth/authorize',
                oauth_token_url: 'https://api.hubapi.com/oauth/v1/token',
                oauth_scopes: 'crm.objects.contacts.read crm.objects.companies.read'
            },
            // Docs Connections
            {
                name: 'confluence',
                display_name: 'Confluence',
                category: 'docs',
                auth_type: 'oauth2',
                description: 'Team collaboration and documentation',
                oauth_authorize_url: 'https://auth.atlassian.com/authorize',
                oauth_token_url: 'https://auth.atlassian.com/oauth/token',
                oauth_scopes: 'read:confluence-content.all write:confluence-content'
            }
        ];

        for (const conn of connections) {
            await client.query(`
                INSERT INTO connections (
                    name, display_name, category, auth_type, description,
                    oauth_authorize_url, oauth_token_url, oauth_scopes
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (name) DO UPDATE SET
                    display_name = EXCLUDED.display_name,
                    category = EXCLUDED.category,
                    auth_type = EXCLUDED.auth_type,
                    description = EXCLUDED.description,
                    oauth_authorize_url = EXCLUDED.oauth_authorize_url,
                    oauth_token_url = EXCLUDED.oauth_token_url,
                    oauth_scopes = EXCLUDED.oauth_scopes,
                    updated_at = CURRENT_TIMESTAMP
            `, [
                conn.name,
                conn.display_name,
                conn.category,
                conn.auth_type,
                conn.description,
                conn.oauth_authorize_url,
                conn.oauth_token_url,
                conn.oauth_scopes
            ]);
        }

        console.log('✓ Connections seeded successfully');
    } catch (err) {
        console.error('Error seeding connections:', err);
        throw err;
    } finally {
        client.release();
    }
}

// Query helper functions
async function query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
}

async function getClient() {
    const client = await pool.connect();
    return client;
}

module.exports = {
    pool,
    query,
    getClient,
    initializeDatabase,
    seedConnections
};

