const express = require('express');
const router = express.Router();

// Asana MCP Configuration
const ASANA_MCP_BASE_URL = 'https://mcp.asana.com';
const ASANA_CLIENT_ID = process.env.ASANA_CLIENT_ID;
const ASANA_CLIENT_SECRET = process.env.ASANA_CLIENT_SECRET;
const REDIRECT_URI = process.env.ASANA_REDIRECT_URI || 'http://localhost:3003/api/asana/callback';

/**
 * Initiate Asana OAuth flow
 * Redirects user to Asana MCP authorization endpoint
 */
router.get('/login', (req, res) => {
    try {
        // Generate state parameter for security
        const state = Math.random().toString(36).substring(2, 15);
        req.session.asanaState = state;
        
        // Build authorization URL
        const authUrl = new URL('/authorize', ASANA_MCP_BASE_URL);
        authUrl.searchParams.set('client_id', ASANA_CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', 'read write');
        authUrl.searchParams.set('state', state);
        
        console.log(`[Asana OAuth] Redirecting to: ${authUrl.toString()}`);
        res.redirect(authUrl.toString());
        
    } catch (error) {
        console.error('[Asana OAuth] Login error:', error);
        res.status(500).json({
            error: 'Failed to initiate Asana OAuth flow',
            message: error.message
        });
    }
});

/**
 * Handle OAuth callback from Asana MCP
 * Exchanges authorization code for access token
 */
router.get('/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;
        
        // Check for OAuth errors
        if (error) {
            console.error('[Asana OAuth] Authorization error:', error);
            return res.status(400).json({
                error: 'Asana authorization failed',
                message: error
            });
        }
        
        // Verify state parameter
        if (state !== req.session.asanaState) {
            console.error('[Asana OAuth] State mismatch');
            return res.status(400).json({
                error: 'Invalid state parameter',
                message: 'Possible CSRF attack'
            });
        }
        
        // Exchange code for token
        const tokenResponse = await fetch(`${ASANA_MCP_BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${ASANA_CLIENT_ID}:${ASANA_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('[Asana OAuth] Token exchange failed:', errorData);
            throw new Error(`Token exchange failed: ${tokenResponse.status}`);
        }
        
        const tokens = await tokenResponse.json();
        
        // Store tokens in session
        req.session.asanaToken = tokens.access_token;
        req.session.asanaRefreshToken = tokens.refresh_token;
        req.session.asanaTokenExpiry = Date.now() + (tokens.expires_in * 1000);
        
        console.log('[Asana OAuth] Successfully obtained tokens');
        
        // Redirect to dashboard or return success
        res.redirect('/dashboard?asana=connected');
        
    } catch (error) {
        console.error('[Asana OAuth] Callback error:', error);
        res.status(500).json({
            error: 'Failed to complete Asana OAuth flow',
            message: error.message
        });
    }
});

/**
 * Refresh Asana access token
 * Uses refresh token to get new access token
 */
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.session.asanaRefreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({
                error: 'No refresh token available',
                message: 'Please re-authenticate with Asana'
            });
        }
        
        const tokenResponse = await fetch(`${ASANA_MCP_BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${ASANA_CLIENT_ID}:${ASANA_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        });
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('[Asana OAuth] Token refresh failed:', errorData);
            throw new Error(`Token refresh failed: ${tokenResponse.status}`);
        }
        
        const tokens = await tokenResponse.json();
        
        // Update session with new tokens
        req.session.asanaToken = tokens.access_token;
        req.session.asanaRefreshToken = tokens.refresh_token;
        req.session.asanaTokenExpiry = Date.now() + (tokens.expires_in * 1000);
        
        console.log('[Asana OAuth] Successfully refreshed tokens');
        
        res.json({
            success: true,
            message: 'Tokens refreshed successfully'
        });
        
    } catch (error) {
        console.error('[Asana OAuth] Refresh error:', error);
        res.status(500).json({
            error: 'Failed to refresh Asana tokens',
            message: error.message
        });
    }
});

/**
 * Logout from Asana
 * Clears Asana tokens from session
 */
router.post('/logout', (req, res) => {
    try {
        // Clear Asana tokens from session
        delete req.session.asanaToken;
        delete req.session.asanaRefreshToken;
        delete req.session.asanaTokenExpiry;
        delete req.session.asanaState;
        
        console.log('[Asana OAuth] User logged out from Asana');
        
        res.json({
            success: true,
            message: 'Successfully logged out from Asana'
        });
        
    } catch (error) {
        console.error('[Asana OAuth] Logout error:', error);
        res.status(500).json({
            error: 'Failed to logout from Asana',
            message: error.message
        });
    }
});

/**
 * Get Asana connection status
 * Returns current authentication status
 */
router.get('/status', (req, res) => {
    try {
        const isConnected = !!req.session.asanaToken;
        const tokenExpiry = req.session.asanaTokenExpiry;
        const isExpired = tokenExpiry && Date.now() > tokenExpiry;
        
        res.json({
            connected: isConnected && !isExpired,
            tokenExpiry: tokenExpiry,
            needsRefresh: isExpired,
            hasRefreshToken: !!req.session.asanaRefreshToken
        });
        
    } catch (error) {
        console.error('[Asana OAuth] Status error:', error);
        res.status(500).json({
            error: 'Failed to get Asana status',
            message: error.message
        });
    }
});

module.exports = router;
