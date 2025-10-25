# Frontend Integration Guide

## Overview

This backend manages OAuth connections to enterprise services (GitHub, Linear, Asana, Trello, Jira, HubSpot, Confluence, Neon, PostgreSQL). Users authenticate via AWS Cognito, then can enable/disable connections to these services. OAuth tokens are stored server-side in AWS RDS PostgreSQL.

**Base URL**: `http://localhost:3003`

**Authentication**: All `/connections/*` endpoints require Cognito authentication via session cookies.

---

## Authentication Flow

### 1. User Login

**Frontend Action**: Redirect user to `/login`

```javascript
// Redirect to Cognito login
window.location.href = '/login';
```

**Backend Behavior**:
- Redirects to AWS Cognito hosted UI
- User authenticates with Cognito
- Cognito redirects back to `/callback`
- Backend sets session cookie
- User is redirected to `/` (or query param `redirect_uri`)

**Result**: User is now authenticated, session cookie is set automatically by browser

---

## API Endpoints

### 1. GET `/connections` - List All Available Connections

Returns all possible connections the user can enable (9 services).

**Request**:
```javascript
fetch('/connections', {
  method: 'GET',
  credentials: 'include' // Important: includes session cookie
})
```

**Response**:
```json
{
  "success": true,
  "connections": [
    {
      "id": 1,
      "name": "neon",
      "display_name": "Neon",
      "category": "database",
      "auth_type": "api_key",
      "description": "Serverless PostgreSQL database",
      "icon_url": null,
      "is_enabled": false
    },
    {
      "id": 3,
      "name": "github",
      "display_name": "GitHub",
      "category": "code",
      "auth_type": "oauth2",
      "description": "Code repository and project management",
      "icon_url": null,
      "is_enabled": true
    }
    // ... 7 more connections
  ]
}
```

**Fields**:
- `name`: Unique identifier (use this in API calls)
- `display_name`: Show this to users
- `category`: database, crm, docs, or code
- `auth_type`: oauth2, oauth1, api_key, or connection_string
- `is_enabled`: Boolean - whether user has enabled this connection

**Frontend Usage**:
- Display all connections in a grid/list
- Show enabled/disabled state
- Group by category if desired
- Use `display_name` for UI labels

---

### 2. GET `/connections/enabled` - List User's Enabled Connections

Returns only connections the user has already authenticated/enabled.

**Request**:
```javascript
fetch('/connections/enabled', {
  method: 'GET',
  credentials: 'include'
})
```

**Response**:
```json
{
  "success": true,
  "connections": [
    {
      "id": 3,
      "name": "github",
      "display_name": "GitHub",
      "category": "code",
      "auth_type": "oauth2",
      "description": "Code repository and project management",
      "connected_at": "2025-10-25T10:30:00.000Z",
      "token_expires_at": "2025-11-25T10:30:00.000Z",
      "is_token_valid": true
    }
  ]
}
```

**Additional Fields**:
- `connected_at`: When user enabled this connection
- `token_expires_at`: When OAuth token expires (null if no expiration)
- `is_token_valid`: Boolean - whether token is still valid

**Frontend Usage**:
- Show user's active connections
- Warn if `is_token_valid` is false (token expired)
- Display `connected_at` as "Connected on [date]"

---

### 3. POST `/connections/enable` - Enable a Connection

Enables a connection. Behavior depends on auth type:
- **OAuth (oauth2/oauth1)**: Returns OAuth URL to redirect user
- **API Key**: Stores key directly
- **Connection String**: Stores string directly

#### For OAuth Services (GitHub, Linear, Asana, Jira, HubSpot, Confluence, Trello)

**Request**:
```javascript
fetch('/connections/enable', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    connection_name: 'github'
  })
})
```

**Response**:
```json
{
  "success": true,
  "auth_required": true,
  "auth_url": "https://github.com/login/oauth/authorize?client_id=xxx&redirect_uri=http://localhost:3003/connections/callback/github&state=abc123&response_type=code&scope=repo,user,read:org",
  "message": "Redirect user to auth_url to complete OAuth flow"
}
```

**Frontend Action**:
```javascript
const response = await fetch('/connections/enable', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ connection_name: 'github' })
});

const data = await response.json();

if (data.auth_required && data.auth_url) {
  // Redirect user to OAuth provider
  window.location.href = data.auth_url;
}
```

**OAuth Flow**:
1. Frontend calls `/connections/enable`
2. Backend returns `auth_url`
3. Frontend redirects user to `auth_url`
4. User authorizes on the service (GitHub, Linear, etc.)
5. Service redirects back to `/connections/callback/github?code=xxx&state=yyy`
6. Backend exchanges code for token, stores it
7. Backend redirects user to `/?connection_success=github`
8. Frontend detects query param and shows success message

**Handling the Redirect Back**:
```javascript
// In your main app component or router
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const success = params.get('connection_success');
  const error = params.get('error');
  
  if (success) {
    // Show success message
    showNotification(`Successfully connected to ${success}!`, 'success');
    // Refresh connections list
    fetchConnections();
  }
  
  if (error) {
    showNotification(`Error: ${error}`, 'error');
  }
  
  // Clean up URL
  window.history.replaceState({}, '', '/');
}, []);
```

#### For API Key Services (Neon)

**Request**:
```javascript
fetch('/connections/enable', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    connection_name: 'neon',
    api_key: 'user-provided-api-key-here'
  })
})
```

**Response**:
```json
{
  "success": true,
  "message": "Connection enabled successfully"
}
```

**Frontend Flow**:
1. Show modal/form asking for API key
2. User enters API key
3. Submit to `/connections/enable` with `connection_name` and `api_key`
4. Show success message
5. Refresh connections list

#### For Connection String Services (PostgreSQL)

**Request**:
```javascript
fetch('/connections/enable', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    connection_name: 'postgres',
    connection_string: 'postgresql://user:pass@host:5432/dbname'
  })
})
```

**Response**:
```json
{
  "success": true,
  "message": "Connection enabled successfully"
}
```

---

### 4. DELETE `/connections/disable/:connection_name` - Disable a Connection

Disables a previously enabled connection.

**Request**:
```javascript
fetch('/connections/disable/github', {
  method: 'DELETE',
  credentials: 'include'
})
```

**Response**:
```json
{
  "success": true,
  "message": "Connection disabled successfully"
}
```

**Frontend Action**:
```javascript
async function disableConnection(connectionName) {
  const confirmed = confirm(`Disconnect from ${connectionName}?`);
  if (!confirmed) return;
  
  const response = await fetch(`/connections/disable/${connectionName}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  
  const data = await response.json();
  
  if (data.success) {
    showNotification('Connection disabled', 'success');
    fetchConnections(); // Refresh list
  }
}
```

---

### 5. GET `/logout` - Logout User

Destroys session and logs out of Cognito.

**Request**:
```javascript
window.location.href = '/logout';
```

---

## Complete Frontend Flow Examples

### Example 1: Display All Connections

```javascript
import { useEffect, useState } from 'react';

function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  async function fetchConnections() {
    try {
      const response = await fetch('/connections', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        // Not authenticated, redirect to login
        window.location.href = '/login';
        return;
      }
      
      const data = await response.json();
      setConnections(data.connections);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="connections-grid">
      {connections.map(conn => (
        <ConnectionCard
          key={conn.id}
          connection={conn}
          onToggle={() => handleToggle(conn)}
        />
      ))}
    </div>
  );
}
```

### Example 2: Enable/Disable Connection

```javascript
async function handleToggle(connection) {
  if (connection.is_enabled) {
    // Disable
    await disableConnection(connection.name);
  } else {
    // Enable
    await enableConnection(connection);
  }
}

async function enableConnection(connection) {
  // For OAuth connections
  if (connection.auth_type === 'oauth2' || connection.auth_type === 'oauth1') {
    const response = await fetch('/connections/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ connection_name: connection.name })
    });
    
    const data = await response.json();
    
    if (data.auth_url) {
      // Redirect to OAuth provider
      window.location.href = data.auth_url;
    }
  }
  
  // For API key connections
  if (connection.auth_type === 'api_key') {
    const apiKey = prompt(`Enter your ${connection.display_name} API key:`);
    if (!apiKey) return;
    
    const response = await fetch('/connections/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        connection_name: connection.name,
        api_key: apiKey
      })
    });
    
    const data = await response.json();
    if (data.success) {
      alert('Connection enabled!');
      fetchConnections(); // Refresh
    }
  }
  
  // For connection string
  if (connection.auth_type === 'connection_string') {
    const connString = prompt(`Enter your ${connection.display_name} connection string:`);
    if (!connString) return;
    
    const response = await fetch('/connections/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        connection_name: connection.name,
        connection_string: connString
      })
    });
    
    const data = await response.json();
    if (data.success) {
      alert('Connection enabled!');
      fetchConnections(); // Refresh
    }
  }
}

async function disableConnection(connectionName) {
  const response = await fetch(`/connections/disable/${connectionName}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  
  const data = await response.json();
  if (data.success) {
    fetchConnections(); // Refresh
  }
}
```

### Example 3: Handle OAuth Callback

```javascript
// In your main App component or router
function App() {
  useEffect(() => {
    // Check for OAuth callback success/error
    const params = new URLSearchParams(window.location.search);
    const connectionSuccess = params.get('connection_success');
    const error = params.get('error');
    
    if (connectionSuccess) {
      showSuccessToast(`Successfully connected to ${connectionSuccess}!`);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    if (error) {
      showErrorToast(decodeURIComponent(error));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  
  return <Router>...</Router>;
}
```

---

## Error Handling

### HTTP Status Codes

- **200**: Success
- **400**: Bad request (missing parameters, invalid connection name)
- **401**: Unauthorized (not logged in or session expired)
- **404**: Connection not found
- **500**: Server error

### Common Error Responses

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "OAuth not configured for this connection",
  "message": "Please configure GITHUB_CLIENT_ID in .env file"
}
```

```json
{
  "error": "Connection not found"
}
```

**Frontend Error Handling**:
```javascript
async function apiCall() {
  try {
    const response = await fetch('/connections', { credentials: 'include' });
    
    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    showErrorNotification(error.message);
  }
}
```

---

## UI/UX Recommendations

### Connection Card Layout

```
┌─────────────────────────────────┐
│ [Icon]  GitHub                  │
│         Code Repository         │
│                                 │
│  ● Connected                    │
│  Connected on Oct 25, 2025      │
│                                 │
│  [Disconnect Button]            │
└─────────────────────────────────┘
```

### States to Show

1. **Not Connected**: Show "Connect" button
2. **Connecting**: Show loading spinner during OAuth redirect
3. **Connected**: Show green checkmark, "Connected on [date]", "Disconnect" button
4. **Token Expired**: Show warning icon, "Token expired - Reconnect" button
5. **Error**: Show error message

### Categories

Group connections by category:
- **Databases**: Neon, PostgreSQL
- **CRM & Project Management**: Asana, Trello, Jira, Linear, HubSpot
- **Documentation**: Confluence
- **Code Repositories**: GitHub

---

## Authentication Check

Always check authentication before showing main content:

```javascript
function ProtectedPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch('/', { credentials: 'include' });
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      
      if (!data.authenticated) {
        window.location.href = '/login';
      }
    } catch (error) {
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <YourMainContent />;
}
```

---

## Sample Component Structure

```
src/
├── components/
│   ├── ConnectionCard.jsx       # Individual connection card
│   ├── ConnectionList.jsx       # List/grid of connections
│   ├── ConnectionModal.jsx      # Modal for API key/connection string input
│   └── Navbar.jsx               # With logout button
├── pages/
│   ├── Dashboard.jsx            # Main connections page
│   └── Login.jsx                # Login page (just redirects to /login)
├── hooks/
│   ├── useConnections.js        # Fetch & manage connections
│   └── useAuth.js               # Check authentication status
├── utils/
│   ├── api.js                   # API helper functions
│   └── notifications.js         # Toast/notification system
└── App.jsx                      # Main app with OAuth callback handling
```

---

## Testing Checklist

- [ ] User can see all 9 available connections
- [ ] User can enable OAuth connection (GitHub, Linear, etc.)
- [ ] OAuth flow redirects to provider and back successfully
- [ ] Success message shows after OAuth completion
- [ ] User can enter API key for Neon
- [ ] User can enter connection string for PostgreSQL
- [ ] User can see their enabled connections
- [ ] User can disable a connection
- [ ] Error messages display properly
- [ ] Unauthenticated users redirect to login
- [ ] Session persists across page refreshes
- [ ] Logout works properly

---

## Summary

**Key Points**:
1. All API calls need `credentials: 'include'` for session cookies
2. OAuth flow: POST `/connections/enable` → get `auth_url` → redirect → handle callback
3. API keys: Show input modal → POST with `api_key` or `connection_string`
4. Always handle 401 status → redirect to `/login`
5. Check URL params for `connection_success` or `error` after OAuth
6. Refresh connection list after any enable/disable action

**Simplest Implementation**:
- Single page with connection cards
- Click card → enable/disable
- OAuth redirects happen automatically
- Show success/error toasts
- That's it!

The backend handles all the complex OAuth token management, storage, and security. The frontend just needs to trigger actions and display results.

