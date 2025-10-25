/**
 * Example: Using MCP Connections with AWS Bedrock
 * 
 * This shows how to retrieve user's connection tokens and use them
 * with AWS Bedrock + MCP (Model Context Protocol)
 */

require('dotenv').config();
const axios = require('axios');

/**
 * Get all enabled connections for a user
 * (In practice, this would be called from your backend with the user's session)
 */
async function getUserConnections(sessionCookie) {
    const response = await axios.get('http://localhost:3003/connections/enabled', {
        headers: {
            Cookie: sessionCookie
        }
    });
    return response.data.connections;
}

/**
 * Get access token for a specific connection
 */
async function getConnectionToken(connectionName, sessionCookie) {
    const response = await axios.get(`http://localhost:3003/connections/${connectionName}/token`, {
        headers: {
            Cookie: sessionCookie
        }
    });
    return response.data;
}

/**
 * Build MCP context object for Bedrock
 */
async function buildMCPContext(sessionCookie) {
    const connections = await getUserConnections(sessionCookie);
    const mcpContext = {};

    for (const conn of connections) {
        try {
            const tokenData = await getConnectionToken(conn.name, sessionCookie);
            
            mcpContext[conn.name] = {
                type: conn.auth_type,
                token: tokenData.access_token,
                display_name: conn.display_name,
                category: conn.category
            };

            console.log(`✓ Added ${conn.display_name} to MCP context`);
        } catch (err) {
            console.error(`✗ Failed to get token for ${conn.name}:`, err.message);
        }
    }

    return mcpContext;
}

/**
 * Example: Call AWS Bedrock with MCP context
 */
async function callBedrockWithMCP(userMessage, sessionCookie) {
    // 1. Build MCP context from user's connections
    const mcpContext = await buildMCPContext(sessionCookie);

    // 2. Prepare Bedrock request
    const bedrockRequest = {
        modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        messages: [
            {
                role: 'user',
                content: userMessage
            }
        ],
        // MCP servers configuration
        // Note: Actual AWS Bedrock MCP integration may vary
        // This is a conceptual example
        additionalModelRequestFields: {
            mcp_servers: {
                github: {
                    enabled: !!mcpContext.github,
                    auth: mcpContext.github ? {
                        type: 'bearer',
                        token: mcpContext.github.token
                    } : null
                },
                linear: {
                    enabled: !!mcpContext.linear,
                    auth: mcpContext.linear ? {
                        type: 'bearer',
                        token: mcpContext.linear.token
                    } : null
                },
                // ... other connections
            }
        }
    };

    console.log('\nBedrock Request with MCP Context:');
    console.log(JSON.stringify(bedrockRequest, null, 2));

    // 3. Call AWS Bedrock (you would use AWS SDK here)
    // const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });
    // const response = await bedrock.invokeModel({
    //     modelId: bedrockRequest.modelId,
    //     body: JSON.stringify(bedrockRequest)
    // });

    return bedrockRequest;
}

/**
 * Example usage scenarios
 */
async function exampleUsage() {
    // You would get this from the user's session
    const SESSION_COOKIE = 'connect.sid=your_session_cookie_here';

    console.log('Example 1: Get user\'s enabled connections\n');
    try {
        const connections = await getUserConnections(SESSION_COOKIE);
        console.log(`Found ${connections.length} enabled connections:`);
        connections.forEach(c => {
            console.log(`  - ${c.display_name} (${c.name})`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    }

    console.log('\n---\n');

    console.log('Example 2: Build MCP context for Bedrock\n');
    try {
        const mcpContext = await buildMCPContext(SESSION_COOKIE);
        console.log('\nMCP Context:');
        console.log(JSON.stringify(mcpContext, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }

    console.log('\n---\n');

    console.log('Example 3: Call Bedrock with MCP\n');
    try {
        await callBedrockWithMCP(
            'List my recent GitHub issues and create a Linear ticket for the most important one',
            SESSION_COOKIE
        );
    } catch (err) {
        console.error('Error:', err.message);
    }
}

/**
 * Real-world integration pattern
 */
class MCPConnectionManager {
    constructor(sessionCookie) {
        this.sessionCookie = sessionCookie;
        this.baseUrl = 'http://localhost:3003';
        this.connectionCache = new Map();
    }

    async getConnection(name) {
        // Check cache first
        if (this.connectionCache.has(name)) {
            const cached = this.connectionCache.get(name);
            // Check if token is expired
            if (cached.expiresAt && new Date(cached.expiresAt) > new Date()) {
                return cached.token;
            }
        }

        // Fetch fresh token
        const response = await axios.get(
            `${this.baseUrl}/connections/${name}/token`,
            { headers: { Cookie: this.sessionCookie } }
        );

        // Cache it
        this.connectionCache.set(name, {
            token: response.data.access_token,
            expiresAt: response.data.expires_at || null
        });

        return response.data.access_token;
    }

    async listEnabled() {
        const response = await axios.get(
            `${this.baseUrl}/connections/enabled`,
            { headers: { Cookie: this.sessionCookie } }
        );
        return response.data.connections;
    }

    async enableConnection(name, credentials = {}) {
        const response = await axios.post(
            `${this.baseUrl}/connections/enable`,
            { connection_name: name, ...credentials },
            { headers: { Cookie: this.sessionCookie } }
        );
        return response.data;
    }

    async getMCPServerConfig() {
        const enabled = await this.listEnabled();
        const config = {};

        for (const conn of enabled) {
            const token = await this.getConnection(conn.name);
            config[conn.name] = {
                command: 'npx',
                args: [`@modelcontextprotocol/${conn.name}-mcp-server`],
                env: {
                    [`${conn.name.toUpperCase()}_TOKEN`]: token
                }
            };
        }

        return config;
    }
}

/**
 * Example: Using the connection manager
 */
async function exampleWithManager() {
    const manager = new MCPConnectionManager('connect.sid=your_session_cookie');

    // Get MCP server configuration
    const mcpConfig = await manager.getMCPServerConfig();
    
    console.log('MCP Server Configuration:');
    console.log(JSON.stringify(mcpConfig, null, 2));

    // Use with Bedrock
    // const bedrock = new BedrockWithMCP(mcpConfig);
    // const response = await bedrock.chat('Show me my GitHub repos');
}

// Export for use in other files
module.exports = {
    getUserConnections,
    getConnectionToken,
    buildMCPContext,
    callBedrockWithMCP,
    MCPConnectionManager
};

// Run examples if called directly
if (require.main === module) {
    console.log('=== MCP + Bedrock Integration Examples ===\n');
    console.log('Note: Make sure you have a valid session cookie from logging in first!\n');
    // exampleUsage();
    console.log('Uncomment exampleUsage() to run the examples');
}

