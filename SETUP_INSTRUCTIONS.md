# Quick Setup Instructions

## Step-by-Step Setup Guide

### 1. Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_VpZFVOF3q
COGNITO_CLIENT_ID=6b84e8a5dkeq43ko0qpp28uiap
COGNITO_CLIENT_SECRET=qvr7u79b2cbhokf9spqfqnqh8t8cbcnukqijboe9afkrojbll5
BASE_URL=http://localhost:3003
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=qvr7u79b2cbhokf9spqfqnqh8t8cbcnukqijboe9afkrojbll5
PORT=3003
NODE_ENV=development
```

### 2. Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

### 3. Start the Backend Server

```bash
cd backend
npm start
```

Server will start on http://localhost:3003

### 4. Start the Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

Frontend will start on http://localhost:3000

### 5. Access the Application

1. Open your browser to http://localhost:3000
2. Click "Get Started" to login with AWS Cognito
3. After successful login, you'll be redirected to the dashboard

## Features Overview

### 🏠 Landing Page
- Modern hero section
- Feature highlights
- Login button

### 💬 Dashboard (Main Chat)
- Multi-agent chat interface
- Real-time messaging
- Agent selection panel
- Message history

### 🔗 Integrations Page
- Jira integration card
- Asana integration card
- HubSpot integration card
- Linear integration card
- Connect/Disconnect functionality

### 🤖 Agents Page
- View all AI agents
- Toggle agent activation
- View agent capabilities
- Agent descriptions

### 📜 History Page
- Conversation history (placeholder)

### ⚙️ Settings Page
- Profile information
- Notification settings
- Security settings

## Testing the Chat

1. Navigate to Dashboard (main page after login)
2. Select which agents you want to use in the right panel
3. Type a message in the chat input
4. Click Send or press Enter
5. The backend will process and return a response

## Troubleshooting

### Frontend can't connect to backend
- Verify backend is running on port 3003
- Check `.env.local` has correct API URL
- Verify CORS is enabled in backend

### Authentication not working
- Check Cognito credentials in backend `.env`
- Verify callback URLs in Cognito console
- Check session secret is set

### Port already in use
- Frontend: Change port with `PORT=3001 npm run dev`
- Backend: Update PORT in `.env`

## Next Steps

### To implement actual multi-agent functionality:
1. Integrate with LLM APIs (OpenAI, Anthropic, etc.)
2. Add agent routing logic in backend
3. Implement context management
4. Add conversation history storage

### To implement integrations:
1. Add OAuth flows for each service
2. Store integration tokens securely
3. Implement API calls to each service
4. Add data synchronization

### To improve the UI:
1. Add loading states and animations
2. Implement error boundaries
3. Add toast notifications
4. Improve responsive design

## Architecture Notes

### Frontend → Backend Flow:
1. User logs in via Cognito (backend handles OAuth)
2. Backend creates session with user info
3. Frontend makes API calls with credentials: 'include'
4. Backend verifies session for protected routes
5. Frontend updates UI based on responses

### Multi-Agent System (Planned):
1. User sends message with selected agents
2. Backend routes to appropriate agents
3. Agents process in parallel/sequence
4. Results aggregated and returned
5. Frontend displays with agent attribution

## Production Deployment Checklist

- [ ] Set up production Cognito pool
- [ ] Configure production environment variables
- [ ] Enable HTTPS on both frontend and backend
- [ ] Set up proper CORS for production domain
- [ ] Configure production database
- [ ] Set up logging and monitoring
- [ ] Configure CDN for frontend assets
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure rate limiting
- [ ] Set up backup and recovery

## Support

Refer to:
- `README.md` - Main project documentation
- `frontend/README.md` - Frontend-specific documentation
- Backend server logs for API issues
- Browser console for frontend issues


