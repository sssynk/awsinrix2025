require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { Issuer, generators } = require('openid-client');
const { initializeDatabase, seedConnections } = require('./db');
const connectionsRouter = require('./routes/connections');

const app = express();

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
            'http://localhost:3003/callback',
            params,
            {
                nonce: req.session.nonce,
                state: req.session.state
            }
        );

        const userInfo = await client.userinfo(tokenSet.access_token);
        req.session.userInfo = userInfo;

        res.redirect('/');
    } catch (err) {
        console.error('Callback error:', err);
        res.redirect('/');
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