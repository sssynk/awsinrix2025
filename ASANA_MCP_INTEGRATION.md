# Asana MCP AWS Core Integration

## Overview
This integration connects Asana's official MCP (Model Context Protocol) server with your AWS Core infrastructure, providing seamless Asana project management capabilities through your existing authentication system.

## Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Node.js      │────│   Asana MCP     │
│   (Browser)     │    │   Backend      │    │   Server        │
│                 │    │   (Port 3003)  │    │   (Official)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   AWS Cognito   │    │   PostgreSQL    │
                       │   Authentication│    │   RDS Database │
                       └─────────────────┘    └─────────────────┘
```

## Key Features
- ✅ **Official Asana MCP Support**: Uses Asana's official MCP server
- ✅ **AWS Cognito Integration**: Seamless authentication with your existing system
- ✅ **Database Analytics**: PostgreSQL integration for project analytics
- ✅ **OAuth 2.0 Flow**: Secure token-based authentication
- ✅ **Proxy Architecture**: Clean separation between frontend and MCP server
- ✅ **Health Monitoring**: Comprehensive health checks and monitoring
- ✅ **Audit Logging**: Complete user activity tracking

## Quick Start

### 1. Prerequisites
- Node.js 18+
- npm
- PostgreSQL database (optional for analytics)
- AWS Cognito setup (already configured)

### 2. Environment Setup
```bash
# Copy environment template
cp asana-env.template .env

# Edit .env with your actual values
# Required: ASANA_CLIENT_ID, ASANA_CLIENT_SECRET, DB_PASSWORD
```

### 3. Register with Asana MCP
```bash
# Register your application
curl -X POST https://mcp.asana.com/register \
     -H 'Content-Type: application/json' \
     -d '{"redirect_uris": ["http://localhost:3003/api/asana/callback"]}'

# Save the returned client_id and client_secret to .env
```

### 4. Start the Integration
```bash
./start-asana-integration.sh
```

### 5. Test the Integration
```bash
./scripts/test-asana-integration.sh
```

## API Endpoints

### Authentication Endpoints
| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/asana/auth/login` | GET | Initiate Asana OAuth flow | AWS Cognito required |
| `/api/asana/auth/callback` | GET | Handle OAuth callback | None |
| `/api/asana/auth/status` | GET | Check connection status | AWS Cognito required |
| `/api/asana/auth/refresh` | POST | Refresh access token | AWS Cognito required |
| `/api/asana/auth/logout` | POST | Disconnect Asana | AWS Cognito required |

### MCP Proxy Endpoints
| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/asana/health` | GET | Service health check | None |
| `/api/asana/tools` | GET | List available MCP tools | Both required |
| `/api/asana/execute` | POST | Execute MCP tool | Both required |
| `/api/asana/mcp/*` | ALL | Direct MCP protocol | Both required |

## Database Schema

### Core Tables
- **asana_workspaces**: Workspace information
- **asana_projects**: Project data and metadata
- **asana_tasks**: Task information and status
- **asana_teams**: Team and collaboration data
- **asana_comments**: Comments and discussions

### Analytics Tables
- **asana_analytics**: User action tracking and metrics
- **asana_user_activity**: Audit trail for compliance

## Configuration

### Environment Variables
```bash
# Asana MCP Configuration
ASANA_CLIENT_ID=your_client_id_from_registration
ASANA_CLIENT_SECRET=your_client_secret_from_registration
ASANA_MCP_URL=https://mcp.asana.com
ASANA_REDIRECT_URI=http://localhost:3003/api/asana/callback

# Database Configuration
DB_HOST=database-1.cluster-cziyo8qqeu6x.us-east-1.rds.amazonaws.com
DB_PASSWORD=your_password_here

# AWS Configuration (already configured)
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_VpZFVOF3q
COGNITO_CLIENT_ID=6b84e8a5dkeq43ko0qpp28uiap
```

## Usage Examples

### 1. Connect Asana Account
```bash
# User visits: http://localhost:3003/api/asana/auth/login
# Redirects to Asana OAuth
# Returns to: http://localhost:3003/api/asana/auth/callback
# Stores tokens in session
```

### 2. List Available Tools
```bash
curl -H "Authorization: Bearer <cognito_token>" \
     http://localhost:3003/api/asana/tools
```

### 3. Execute Asana Operations
```bash
# Create a task
curl -X POST http://localhost:3003/api/asana/execute \
     -H "Authorization: Bearer <cognito_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "tool": "create_task",
       "parameters": {
         "name": "New Task",
         "project_id": "123456789"
       }
     }'
```

## Available Asana MCP Tools

Based on Asana's official MCP server, you can:
- ✅ **Create Tasks**: Add new tasks to projects
- ✅ **Update Tasks**: Modify task details, status, assignments
- ✅ **Manage Projects**: Create, update, archive projects
- ✅ **Team Collaboration**: Manage team members and permissions
- ✅ **Comments**: Add and manage task comments
- ✅ **Search**: Find tasks, projects, and team members
- ✅ **Analytics**: Track project progress and team productivity

## Security Features

### Authentication Flow
1. **AWS Cognito**: User authenticates with AWS Cognito
2. **Asana OAuth**: User connects Asana account via OAuth 2.0
3. **Token Management**: Secure token storage and refresh
4. **Session Security**: Encrypted session management

### Data Protection
- **SSL/TLS**: All connections encrypted
- **Token Encryption**: Access tokens stored securely
- **Audit Logging**: Complete activity tracking
- **User Isolation**: Data filtered by user ID

## Monitoring and Analytics

### Health Checks
- **Backend Health**: `http://localhost:3003/auth`
- **Asana Proxy Health**: `http://localhost:3003/api/asana/health`
- **Asana MCP Server**: `https://mcp.asana.com/health`

### Analytics Dashboard
- **User Activity**: Track user actions and patterns
- **Project Metrics**: Monitor project progress and completion
- **Team Performance**: Analyze team productivity
- **System Usage**: Monitor API usage and performance

## Troubleshooting

### Common Issues

**1. Authentication Errors**
- Verify AWS Cognito configuration
- Check Asana OAuth credentials
- Ensure proper redirect URIs

**2. Database Connection Issues**
- Verify RDS endpoint accessibility
- Check security group settings
- Validate credentials

**3. Asana MCP Server Errors**
- Check Asana MCP server status
- Verify client registration
- Review API rate limits

**4. Proxy Errors**
- Check backend server status
- Verify environment variables
- Review proxy configuration

### Debug Mode
```bash
export LOG_LEVEL=DEBUG
export NODE_ENV=development
```

## Development

### File Structure
```
awsinrix2025/
├── backend/
│   ├── routes/
│   │   ├── asana-auth.js      # OAuth handlers
│   │   └── asana.js          # MCP proxy routes
│   ├── database/
│   │   └── asana-db.js       # Database operations
│   ├── server.js             # Main server file
│   └── package.json          # Dependencies
├── database/
│   └── migrations/
│       └── 001_asana_schema.sql
├── scripts/
│   └── test-asana-integration.sh
├── start-asana-integration.sh
└── asana-env.template
```

### Adding New Features
1. **New MCP Tools**: Add to proxy routes
2. **Database Models**: Update schema and models
3. **Analytics**: Extend analytics tracking
4. **UI Components**: Add frontend interfaces

## Production Deployment

### AWS Deployment
- **ECS/Fargate**: Container orchestration
- **RDS**: Managed PostgreSQL database
- **Secrets Manager**: Secure credential storage
- **CloudWatch**: Monitoring and logging
- **Application Load Balancer**: Traffic distribution

### Environment Setup
```bash
# Production environment variables
ENVIRONMENT=production
DB_HOST=your-production-rds-endpoint
ASANA_REDIRECT_URI=https://your-domain.com/api/asana/callback
```

## Support and Resources

### Documentation
- **Asana MCP Docs**: https://developers.asana.com/docs/integrating-with-asanas-mcp-server
- **AWS Cognito Docs**: https://docs.aws.amazon.com/cognito/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

### Community
- **Asana Developer Community**: https://forum.asana.com/c/developers-api
- **AWS Developer Forums**: https://forums.aws.amazon.com/

---

**Branch**: feature/asana-mcp-integration  
**Status**: Ready for testing and deployment  
**Last Updated**: October 25, 2024
