require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { Issuer, generators } = require('openid-client');
const { initializeDatabase, seedConnections } = require('./db');
const connectionsRouter = require('./routes/connections');

const app = express();

// CORS configuration for Next.js frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let client;
// Initialize OpenID Client
async function initializeClient() {
    const issuer = await Issuer.discover(process.env.COGNITO_ISSUER);
    client = new issuer.Client({
        client_id: process.env.COGNITO_CLIENT_ID,
        client_secret: process.env.COGNITO_CLIENT_SECRET,
        redirect_uris: [`${process.env.BASE_URL}/callback`],
        response_types: ['code']
    });
};
initializeClient().catch(console.error);

// Initialize database
async function initializeApp() {
    try {
        await initializeDatabase();
        await seedConnections();
        console.log('✓ Application initialized successfully');
    } catch (err) {
        console.error('Failed to initialize application:', err);
        process.exit(1);
    }
}
initializeApp();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

const checkAuth = (req, res, next) => {
    if (!req.session.userInfo) {
        req.isAuthenticated = false;
    } else {
        req.isAuthenticated = true;
    }
    next();
};

// API Routes for Next.js frontend
// Get current user info
app.get('/api/user', checkAuth, (req, res) => {
    if (req.isAuthenticated) {
        res.json({
            success: true,
            user: req.session.userInfo
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
});

// Check authentication status
app.get('/api/auth/status', checkAuth, (req, res) => {
    res.json({
        success: true,
        authenticated: req.isAuthenticated,
        user: req.isAuthenticated ? req.session.userInfo : null
    });
});

// Chat endpoint (placeholder for multi-agent system)
app.post('/api/chat', checkAuth, (req, res) => {
    if (!req.isAuthenticated) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const { message, context, selectedAgents } = req.body;
    
    // TODO: Implement multi-agent chat logic
    // For now, return a mock response
    res.json({
        success: true,
        response: {
            id: Date.now().toString(),
            message: `Received your message: "${message}". Multi-agent processing will be implemented here.`,
            agents: selectedAgents || ['default'],
            timestamp: new Date().toISOString()
        }
    });
});

// Get available integrations
app.get('/api/integrations', checkAuth, (req, res) => {
    if (!req.isAuthenticated) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // TODO: Get actual integration status from database
    const integrations = [
        { id: 'jira', name: 'Jira', connected: false, icon: 'jira' },
        { id: 'asana', name: 'Asana', connected: false, icon: 'asana' },
        { id: 'hubspot', name: 'Hubspot', connected: false, icon: 'hubspot' },
        { id: 'linear', name: 'Linear', connected: false, icon: 'linear' }
    ];

    res.json({
        success: true,
        integrations
    });
});

// Mount connections router
app.use('/connections', connectionsRouter);

app.get('/login', (req, res) => {
    const nonce = generators.nonce();
    const state = generators.state();

    req.session.nonce = nonce;
    req.session.state = state;

    const authUrl = client.authorizationUrl({
        scope: 'email openid phone',
        state: state,
        nonce: nonce,
    });

    res.redirect(authUrl);
});

// Helper function to get the path from the URL. Example: "http://localhost/hello" returns "/hello"
function getPathFromURL(urlString) {
    try {
        const url = new URL(urlString);
        return url.pathname;
    } catch (error) {
        console.error('Invalid URL:', error);
        return null;
    }
}

app.get('/callback', async (req, res) => {
    try {
        const params = client.callbackParams(req);
        const tokenSet = await client.callback(
            `${process.env.BASE_URL}/callback`,
            params,
            {
                nonce: req.session.nonce,
                state: req.session.state
            }
        );

        const userInfo = await client.userinfo(tokenSet.access_token);
        req.session.userInfo = userInfo;

        // Redirect to Next.js frontend after successful login
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/dashboard`);
    } catch (err) {
        console.error('Callback error:', err);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(frontendUrl);
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    const logoutUrl = `https://us-east-1vpzfvof3q.auth.us-east-1.amazoncognito.com/logout?client_id=6b84e8a5dkeq43ko0qpp28uiap&logout_uri=<logout uri>`;
    res.redirect(logoutUrl);
});

app.set('view engine', 'ejs');

// serve /auth.html at /auth
app.get('/auth', (req, res) => {
    res.render('auth');
});

// Root route - show user info if authenticated
app.get('/', checkAuth, (req, res) => {
    if (req.isAuthenticated) {
        res.json({
            success: true,
            authenticated: true,
            user: req.session.userInfo,
            message: 'Welcome! Use /connections endpoints to manage your integrations'
        });
    } else {
        res.json({
            success: true,
            authenticated: false,
            message: 'Please login at /login',
            endpoints: {
                login: '/login',
                connections: '/connections (requires auth)',
                enabled_connections: '/connections/enabled (requires auth)',
                enable_connection: 'POST /connections/enable (requires auth)'
            }
        });
    }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`✓ Server is running on port ${PORT}`);
    console.log(`✓ Base URL: ${process.env.BASE_URL}`);
});