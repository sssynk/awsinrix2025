# Enterprise Assistant - Multi-Agent AI Platform

A full-stack enterprise AI assistant that integrates with workspace tools (Jira, Asana, HubSpot, Linear) using a multi-agent system architecture.

## 🏗️ Project Structure

```
awsinrix2025/
├── backend/              # Express.js API server
│   ├── server.js        # Main server with Cognito auth & API endpoints
│   ├── package.json     # Backend dependencies
│   └── views/           # EJS templates (legacy)
└── frontend/            # Next.js web application
    ├── app/            # Next.js pages (App Router)
    ├── components/     # React components
    ├── lib/           # Utilities and API client
    ├── store/         # Zustand state management
    └── types/         # TypeScript definitions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- AWS Cognito user pool (configured in backend/.env)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file in backend directory:
```env
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_YourPoolId
COGNITO_CLIENT_ID=your_client_id
COGNITO_CLIENT_SECRET=your_client_secret
BASE_URL=http://localhost:3003
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your_session_secret
PORT=3003
NODE_ENV=development
```

3. Start the backend server:
```bash
npm start
```

Backend will run on http://localhost:3003

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Create `.env.local` file in frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## 🎯 Features

### 🤖 Multi-Agent System
- **Project Manager Agent**: Handles Jira, Asana, Linear integrations
- **Sales Analyst Agent**: Specializes in HubSpot and CRM data
- **Data Scientist Agent**: Provides analytics and insights
- **General Assistant**: Coordinates between specialized agents

### 💬 Chat Interface
- Real-time conversation with AI agents
- Agent selection and management
- Message history with timestamps
- Context-aware responses

### 🔗 Workspace Integrations
- **Jira**: Project management and issue tracking
- **Asana**: Task and project organization
- **HubSpot**: CRM and sales data
- **Linear**: Issue tracking and product management

### 🔐 Authentication
- AWS Cognito integration
- Session-based authentication
- Secure OAuth flow
- Protected routes

### ⚙️ Agent Management
- View all available agents
- Toggle agent activation
- Configure agent capabilities
- View agent specializations

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: AWS Cognito (openid-client)
- **Session**: express-session
- **CORS**: cors middleware

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Icons**: Lucide React
- **HTTP Client**: Fetch API

## 📡 API Endpoints

### Authentication
- `GET /login` - Redirect to Cognito login
- `GET /callback` - OAuth callback handler
- `GET /logout` - Logout and clear session

### API Routes (Require Authentication)
- `GET /api/auth/status` - Check authentication status
- `GET /api/user` - Get current user information
- `POST /api/chat` - Send message to multi-agent system
- `GET /api/integrations` - Get available workspace integrations

## 🎨 Frontend Pages

- `/` - Landing page with login
- `/dashboard` - Main chat interface
- `/dashboard/integrations` - Workspace integrations management
- `/dashboard/agents` - AI agent configuration
- `/dashboard/history` - Conversation history
- `/dashboard/settings` - User settings

## 🔧 Development

### Running Both Servers

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Building for Production

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm start
```

## 📝 Environment Variables

### Backend (.env)
```env
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_YourPoolId
COGNITO_CLIENT_ID=your_client_id
COGNITO_CLIENT_SECRET=your_client_secret
BASE_URL=http://localhost:3003
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your_random_secret_key
PORT=3003
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

## 🚀 Deployment

### Backend Deployment
1. Deploy to AWS EC2, Elastic Beanstalk, or similar
2. Set environment variables
3. Configure Cognito callback URLs
4. Enable HTTPS

### Frontend Deployment
1. Deploy to Vercel, Netlify, or similar
2. Set `NEXT_PUBLIC_API_URL` to production backend URL
3. Update CORS settings in backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the AWS Enterprise Assistant platform.

## 🙋 Support

For issues and questions, please refer to the documentation in each directory's README file.


