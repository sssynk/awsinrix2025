const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

// Asana MCP Configuration
const ASANA_MCP_URL = process.env.ASANA_MCP_URL || 'https://mcp.asana.com';

/**
 * Middleware to check Asana authentication
 * Ensures user has valid Asana token before accessing MCP endpoints
 */
const requireAsanaAuth = (req, res, next) => {
    // Check if user is authenticated with Cognito
    if (!req.session.userInfo) {
        return res.status(401).json({
            error: 'AWS Cognito authentication required',
            message: 'Please log in with AWS Cognito first'
        });
    }
    
    // Check if user has Asana token
    if (!req.session.asanaToken) {
        return res.status(401).json({
            error: 'Asana authentication required',
            message: 'Please connect your Asana account first',
            action: 'connect_asana',
            loginUrl: '/api/asana/login'
        });
    }
    
    // Check if token is expired
    const tokenExpiry = req.session.asanaTokenExpiry;
    if (tokenExpiry && Date.now() > tokenExpiry) {
        return res.status(401).json({
            error: 'Asana token expired',
            message: 'Please refresh your Asana connection',
            action: 'refresh_token',
            refreshUrl: '/api/asana/refresh'
        });
    }
    
    next();
};

/**
 * Proxy middleware configuration for Asana MCP server
 */
const proxyOptions = {
    target: ASANA_MCP_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/asana/mcp': '', // Remove /api/asana/mcp prefix when forwarding to MCP server
    },
    onProxyReq: (proxyReq, req, res) => {
        // Add Asana access token to request headers
        if (req.session.asanaToken) {
            proxyReq.setHeader('Authorization', `Bearer ${req.session.asanaToken}`);
        }
        
        // Add user information for analytics
        if (req.session.userInfo) {
            proxyReq.setHeader('X-User-ID', req.session.userInfo.sub);
            proxyReq.setHeader('X-User-Email', req.session.userInfo.email);
        }
        
        // Log the proxy request
        console.log(`[Asana MCP Proxy] ${req.method} ${req.url} -> ${ASANA_MCP_URL}${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        // Log the proxy response
        console.log(`[Asana MCP Proxy] Response: ${proxyRes.statusCode} for ${req.url}`);
        
        // Add CORS headers for frontend access
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    },
    onError: (err, req, res) => {
        console.error(`[Asana MCP Proxy Error] ${err.message} for ${req.url}`);
        res.status(502).json({
            error: 'Asana MCP service unavailable',
            message: 'Unable to connect to Asana MCP server',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

/**
 * Health check endpoint for Asana MCP service
 * No authentication required - used for service monitoring
 */
router.get('/health', async (req, res) => {
    try {
        // Test connection to Asana MCP server
        const response = await fetch(`${ASANA_MCP_URL}/health`, {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            const data = await response.json();
            res.json({
                status: 'healthy',
                service: 'asana-mcp-proxy',
                asana_mcp_server: data,
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(502).json({
                status: 'unhealthy',
                service: 'asana-mcp-proxy',
                error: 'Asana MCP server not responding',
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(502).json({
            status: 'unhealthy',
            service: 'asana-mcp-proxy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Get available Asana MCP tools
 * Returns list of available tools and their descriptions
 */
router.get('/tools', requireAsanaAuth, async (req, res) => {
    try {
        const response = await fetch(`${ASANA_MCP_URL}/tools`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${req.session.asanaToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const tools = await response.json();
            res.json({
                success: true,
                tools: tools,
                timestamp: new Date().toISOString()
            });
        } else {
            throw new Error(`Failed to fetch tools: ${response.status}`);
        }
    } catch (error) {
        console.error('[Asana MCP] Tools fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch Asana MCP tools',
            message: error.message
        });
    }
});

/**
 * Execute Asana MCP tool
 * Generic endpoint for executing MCP tools
 */
router.post('/execute', requireAsanaAuth, async (req, res) => {
    try {
        const { tool, parameters } = req.body;
        
        if (!tool) {
            return res.status(400).json({
                error: 'Tool name is required',
                message: 'Please specify which Asana MCP tool to execute'
            });
        }
        
        const response = await fetch(`${ASANA_MCP_URL}/execute`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${req.session.asanaToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tool: tool,
                parameters: parameters || {}
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            res.json({
                success: true,
                result: result,
                timestamp: new Date().toISOString()
            });
        } else {
            const errorData = await response.text();
            throw new Error(`Tool execution failed: ${response.status} - ${errorData}`);
        }
    } catch (error) {
        console.error('[Asana MCP] Execute error:', error);
        res.status(500).json({
            error: 'Failed to execute Asana MCP tool',
            message: error.message,
            tool: req.body.tool
        });
    }
});

/**
 * Proxy all other requests to Asana MCP server
 * This handles the actual MCP protocol communication
 */
router.use('/mcp', requireAsanaAuth, createProxyMiddleware(proxyOptions));

module.exports = router;
