# AWS INRIX 2025 - Enterprise MCP Connections Backend

Backend API for managing OAuth-based connections to various enterprise services via Model Context Protocol (MCP).

## Overview

This backend enables users to authenticate and connect to multiple enterprise services including:
- **Databases**: Neon, PostgreSQL
- **CRM/Project Management**: Asana, Trello, Jira, Linear, HubSpot
- **Documentation**: Confluence
- **Code Repositories**: GitHub

## Features

- ✅ User authentication via AWS Cognito
- ✅ OAuth 2.0 / OAuth 1.0a support for multiple services
- ✅ Secure token storage in AWS RDS PostgreSQL
- ✅ RESTful API for managing connections
- ✅ Support for API keys and connection strings
- ✅ Token expiration tracking
- ✅ MCP-ready for AWS Bedrock integration

## Prerequisites

- Node.js 14+
- AWS RDS PostgreSQL database
- AWS Cognito user pool configured
- OAuth app credentials from each service you want to integrate

## Installation

```bash
npm install
```

## Configuration

1. **Database Setup**: The database schema will be automatically created on first run.

2. **Environment Variables**: Copy `.env.example` to `.env` and configure:

```env
# Database
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PASSWORD=your-password

# OAuth Credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
# ... add others as needed
```

3. **Register OAuth Apps**: You need to register your application with each service:

### GitHub
- Go to: https://github.com/settings/developers
- Create new OAuth App
- Set callback URL: `http://localhost:3003/connections/callback/github`

### Linear
- Go to: https://linear.app/settings/api
- Create new OAuth application
- Set callback URL: `http://localhost:3003/connections/callback/linear`

### Asana
- Go to: https://app.asana.com/0/developer-console
- Create new app
- Set redirect URI: `http://localhost:3003/connections/callback/asana`

### Jira/Confluence
- Go to: https://developer.atlassian.com/console/myapps/
- Create OAuth 2.0 integration
- Set callback URL: `http://localhost:3003/connections/callback/jira` or `/confluence`

### HubSpot
- Go to: https://developers.hubspot.com/
- Create app
- Set redirect URL: `http://localhost:3003/connections/callback/hubspot`

### Trello
- Go to: https://trello.com/app-key
- Get API key and secret
- Set return URL: `http://localhost:3003/connections/callback/trello`

## Running

```bash
npm start
# or for development with auto-reload
npm run dev
```

Server will start on `http://localhost:3003`

## API Endpoints

### Authentication
- `GET /login` - Initiate Cognito login
- `GET /callback` - Cognito callback handler
- `GET /logout` - Logout user

### Connections Management

#### List All Connections
```bash
GET /connections
Authorization: Requires Cognito session

Response:
{
  "success": true,
  "connections": [
    {
      "id": 1,
      "name": "github",
      "display_name": "GitHub",
      "category": "code",
      "auth_type": "oauth2",
      "description": "Code repository and project management",
      "is_enabled": false
    },
    ...
  ]
}
```

#### List Enabled Connections
```bash
GET /connections/enabled
Authorization: Requires Cognito session

Response:
{
  "success": true,
  "connections": [
    {
      "id": 3,
      "name": "github",
      "display_name": "GitHub",
      "category": "code",
      "connected_at": "2025-10-25T10:30:00Z",
      "token_expires_at": "2025-11-25T10:30:00Z",
      "is_token_valid": true
    }
  ]
}
```

#### Enable a Connection

**For OAuth-based services (GitHub, Linear, Asana, etc.):**
```bash
POST /connections/enable
Authorization: Requires Cognito session
Content-Type: application/json

{
  "connection_name": "github"
}

Response:
{
  "success": true,
  "auth_required": true,
  "auth_url": "https://github.com/login/oauth/authorize?client_id=...",
  "message": "Redirect user to auth_url to complete OAuth flow"
}
```

**For API key-based services (Neon):**
```bash
POST /connections/enable
Authorization: Requires Cognito session
Content-Type: application/json

{
  "connection_name": "neon",
  "api_key": "your-neon-api-key"
}

Response:
{
  "success": true,
  "message": "Connection enabled successfully"
}
```

**For connection string-based services (PostgreSQL):**
```bash
POST /connections/enable
Authorization: Requires Cognito session
Content-Type: application/json

{
  "connection_name": "postgres",
  "connection_string": "postgresql://user:pass@host:5432/dbname"
}

Response:
{
  "success": true,
  "message": "Connection enabled successfully"
}
```

#### Disable a Connection
```bash
DELETE /connections/disable/:connection_name
Authorization: Requires Cognito session

Response:
{
  "success": true,
  "message": "Connection disabled successfully"
}
```

#### Get Access Token (Internal Use)
```bash
GET /connections/:connection_name/token
Authorization: Requires Cognito session

Response:
{
  "success": true,
  "access_token": "ghp_xxxxxxxxxxxxx",
  "auth_type": "oauth2"
}
```

## OAuth Flow

1. User calls `POST /connections/enable` with `connection_name`
2. Backend generates OAuth state and returns `auth_url`
3. Frontend redirects user to `auth_url`
4. User authenticates with the service
5. Service redirects back to `/connections/callback/:connection_name`
6. Backend exchanges code for access token
7. Token is stored in database
8. User is redirected to frontend with success message

## Database Schema

### connections
Master list of all available connections:
- `id` - Primary key
- `name` - Unique identifier (e.g., 'github')
- `display_name` - Human-readable name
- `category` - Type of service (database, crm, docs, code)
- `auth_type` - Authentication method (oauth2, oauth1, api_key, connection_string)
- `oauth_authorize_url` - OAuth authorization endpoint
- `oauth_token_url` - OAuth token exchange endpoint
- `oauth_scopes` - Required OAuth scopes

### user_connections
User-specific connection tokens:
- `id` - Primary key
- `user_id` - Cognito user ID
- `connection_id` - Foreign key to connections
- `access_token` - Encrypted access token
- `refresh_token` - Encrypted refresh token (if available)
- `token_expires_at` - Token expiration timestamp
- `enabled` - Whether connection is active
- `additional_data` - JSONB for service-specific data

## Security

- All tokens are stored in AWS RDS with SSL/TLS encryption
- Session cookies are HTTP-only and secure in production
- OAuth state parameter prevents CSRF attacks
- User connections are isolated by Cognito user ID
- Database credentials stored in environment variables

## Next Steps for AWS Bedrock Integration

Once connections are established, you can:

1. Retrieve access tokens via `GET /connections/:name/token`
2. Use tokens to authenticate MCP requests to services
3. Pass MCP context to AWS Bedrock with authenticated connections
4. Enable AI to interact with connected services on behalf of users

## Troubleshooting

**Database connection fails:**
- Check RDS security group allows inbound connections
- Verify DB_HOST and DB_PASSWORD in .env
- Ensure RDS SSL is enabled

**OAuth redirect doesn't work:**
- Verify callback URLs match in OAuth app settings
- Check BASE_URL in .env matches your deployment
- Update Cognito allowed callback URLs

**Token exchange fails:**
- Verify CLIENT_ID and CLIENT_SECRET are correct
- Check service-specific OAuth documentation
- Review server logs for detailed error messages

## License

MIT

